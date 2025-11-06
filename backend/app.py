# backend/app.py
import os
import uuid
import json
import logging
import tempfile
from typing import Optional, List, Dict, Any
from urllib.parse import urlparse

import yaml
import requests
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl, validator
from tenacity import retry, stop_after_attempt, wait_fixed
import subprocess
import ast

# === Конфигурация ===
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="VTB API Analyzer", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Лимиты
MAX_SPEC_SIZE = 2 * 1024 * 1024  # 2MB
MAX_PLUGIN_CODE_SIZE = 50_000
MAX_AI_PROMPT_CHARS = 15_000
SPECTRAL_TIMEOUT = 180
PLUGINS_DIR = "/tmp/plugins"
os.makedirs(PLUGINS_DIR, exist_ok=True)

# Безопасные глобалы для exec
SAFE_GLOBALS = {
    '__builtins__': {
        'len': len, 'dict': dict, 'str': str, 'list': list,
        'print': print, 'range': range, 'enumerate': enumerate,
        'zip': zip, 'sorted': sorted, 'min': min, 'max': max,
        'sum': sum, 'any': any, 'all': all, 'map': map, 'filter': filter,
        'isinstance': isinstance, 'type': type, 'hasattr': hasattr,
        'getattr': getattr, 'setattr': setattr,
    },
    'yaml': yaml,
    'json': json,
}

# Запрещённые домены (SSRF protection)
BLOCKED_DOMAINS = {
    "localhost", "127.0.0.1", "::1",
    "169.254.169.254",  # AWS metadata
    "metadata.google.internal",  # GCP
}

# === Модели ===
class AnalyzeRequest(BaseModel):
    url: Optional[HttpUrl] = None

    @validator("url", pre=True, always=True)
    def validate_url_scheme(cls, v):
        if v and not str(v).startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v

# === Утилиты ===
def is_blocked_domain(host: str) -> bool:
    """Проверка на внутренние/запрещённые домены"""
    host = host.lower()
    if host in BLOCKED_DOMAINS:
        return True
    return any(host.endswith(f".{blocked}") for blocked in BLOCKED_DOMAINS if "." in blocked)

@retry(stop=stop_after_attempt(2), wait=wait_fixed(2))
def run_bandit(code: str) -> Dict:
    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
        f.write(code)
        path = f.name
    try:
        result = subprocess.run(
            ["bandit", "-f", "json", path],
            capture_output=True, text=True, timeout=60
        )
        return json.loads(result.stdout) if result.stdout else {"results": []}
    except Exception as e:
        logger.error(f"Bandit error: {e}")
        return {"results": []}
    finally:
        try:
            os.unlink(path)
        except:
            pass

def run_spectral(spec_path: str) -> List[Dict]:
    cmd = [
        "spectral", "lint", spec_path,
        "--ruleset", "@stoplight/spectral-rulesets/owasp-api-security",
        "--format", "json"
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=SPECTRAL_TIMEOUT)
        if result.returncode != 0:
            return [{"code": "SPECTRAL_ERROR", "message": result.stderr[:500], "severity": "high"}]
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return [{"code": "JSON_ERROR", "message": "Spectral output not JSON", "severity": "high"}]
    except Exception as e:
        return [{"code": "SPECTRAL_INTERNAL", "message": str(e), "severity": "high"}]

def safe_exec_plugin(plugin_path: str, spec_data: str, plugin_name: str) -> List[Dict]:
    """Безопасный запуск плагина"""
    try:
        with open(plugin_path, 'r') as f:
            code = f.read()

        # Проверка на опасные конструкции
        tree = ast.parse(code)
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name) and node.func.id in {'exec', 'eval', 'open', 'subprocess', 'os', 'sys', 'importlib'}:
                    raise ValueError(f"Unsafe function: {node.func.id}")
                if isinstance(node.func, ast.Attribute) and node.func.attr in {'system', 'popen', 'call'}:
                    raise ValueError(f"Unsafe method: {node.func.attr}")

        local_vars = {}
        exec(code, SAFE_GLOBALS, local_vars)

        analyze_func = local_vars.get('analyze')
        if not callable(analyze_func):
            raise ValueError("Plugin must define 'analyze(spec)' function")

        findings = analyze_func(spec_data)
        if not isinstance(findings, (list, dict)):
            raise ValueError("analyze() must return dict or list of dicts")

        findings = findings if isinstance(findings, list) else [findings]
        for f in findings:
            f.setdefault("plugin", plugin_name)
            f.setdefault("severity", "info")
            f.setdefault("code", "CUSTOM")

        return findings

    except Exception as e:
        logger.error(f"Plugin {plugin_name} error: {e}")
        return [{"code": "PLUGIN_ERROR", "message": str(e), "severity": "high", "plugin": plugin_name}]

# === Эндпоинты ===
@app.post("/api/save-plugin")
async def save_plugin(name: str = Form(...), code: str = Form(...)):
    if len(code) > MAX_PLUGIN_CODE_SIZE:
        raise HTTPException(400, "Plugin code too large (>50KB)")

    bandit_result = run_bandit(code)
    if bandit_result.get("results"):
        raise HTTPException(400, f"Bandit found {len(bandit_result['results'])} issues")

    safe_path = os.path.join(PLUGINS_DIR, f"{name}.py")
    with open(safe_path, 'w') as f:
        f.write(code)

    return {"status": "saved", "name": name}

@app.post("/api/analyze-api")
async def analyze_api(
    request: Optional[AnalyzeRequest] = None,
    openapi_file: Optional[UploadFile] = File(None),
    plugins: List[str] = Form([])
):
    spec_path = None
    spec_data = None

    try:
        # === 1. Получение спецификации ===
        if openapi_file:
            if openapi_file.size > MAX_SPEC_SIZE:
                raise HTTPException(400, "File too large (>2MB)")
            spec_data = (await openapi_file.read()).decode('utf-8')
        elif request and request.url:
            url = str(request.url)
            parsed = urlparse(url)
            if is_blocked_domain(parsed.hostname or ""):
                raise HTTPException(400, "Blocked domain (SSRF protection)")

            resp = requests.get(url, timeout=30, headers={"User-Agent": "VTB-Analyzer/1.0"})
            resp.raise_for_status()
            spec_data = resp.text
        else:
            raise HTTPException(400, "Provide either URL or file")

        # === 2. Валидация YAML (защита от bomb) ===
        try:
            yaml.safe_load(spec_data[:100_000])  # Ограничение на парсинг
        except yaml.YAMLError as e:
            raise HTTPException(400, f"Invalid YAML: {e}")

        # === 3. Сохранение во временный файл ===
        spec_path = f"/tmp/spec_{uuid.uuid4().hex}.yaml"
        with open(spec_path, "w") as f:
            f.write(spec_data)

        # === 4. Spectral ===
        spectral_issues = run_spectral(spec_path)

        # === 5. Плагины ===
        plugin_issues = []
        for plugin_name in plugins:
            plugin_path = os.path.join(PLUGINS_DIR, f"{plugin_name}.py")
            if os.path.exists(plugin_path):
                plugin_issues.extend(safe_exec_plugin(plugin_path, spec_data, plugin_name))
            else:
                plugin_issues.append({
                    "code": "PLUGIN_NOT_FOUND",
                    "message": f"Plugin '{plugin_name}' not found",
                    "severity": "low",
                    "plugin": plugin_name
                })

        all_issues = spectral_issues + plugin_issues
        truncated = len(all_issues) > 50
        displayed_issues = all_issues[:50]

        # === 6. Статистика ===
        counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
        for issue in all_issues:
            sev = issue.get("severity", "info").lower()
            if sev in counts:
                counts[sev] += 1

        # === 7. Плагины в отчёте ===
        plugins_summary = [
            {"name": "Spectral OWASP", "findings": len(spectral_issues)}
        ]
        for p in plugins:
            findings = len([i for i in plugin_issues if i.get("plugin") == p])
            plugins_summary.append({"name": p, "findings": findings})

        return {
            "summary": f"Found {len(all_issues)} issues",
            "total": len(all_issues),
            "truncated": truncated,
            **counts,
            "issues": displayed_issues,
            "plugins": plugins_summary
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analyze error: {e}")
        raise HTTPException(500, "Internal server error")
    finally:
        if spec_path and os.path.exists(spec_path):
            try:
                os.unlink(spec_path)
            except:
                pass

@app.post("/api/ai-analyze")
async def ai_analyze(spec_data: str = Form(...)):
    api_key = os.getenv("XAI_API_KEY")
    if not api_key:
        raise HTTPException(500, "xAI API key not configured")

    prompt = f"""Analyze this OpenAPI spec for security vulnerabilities.
Return only JSON list of findings: [{{"code": "...", "severity": "high|medium|low", "message": "..."}}]

Spec (truncated): {spec_data[:MAX_AI_PROMPT_CHARS]}"""

    try:
        resp = requests.post(
            "https://api.x.ai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "model": "grok-beta",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3
            },
            timeout=60
        )
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"]

        # Попытка парсинга JSON
        try:
            findings = json.loads(content)
            if not isinstance(findings, list):
                findings = [findings]
            for f in findings:
                f["plugin"] = "xAI Grok"
                f["severity"] = f.get("severity", "info")
            return {"ai_insights": findings}
        except:
            return {"ai_insights": [{"code": "AI_PARSE_ERROR", "message": content, "plugin": "xAI Grok"}]}
    except Exception as e:
        logger.error(f"xAI error: {e}")
        raise HTTPException(500, "AI analysis failed")

@app.post("/api/analyze-code")
async def analyze_code(file: UploadFile = File(...)):
    if not file.filename.endswith(".py"):
        raise HTTPException(400, "Only .py files allowed")
    if file.size > 100_000:
        raise HTTPException(400, "File too large")

    code = (await file.read()).decode()
    result = run_bandit(code)
    return JSONResponse(content=result)

@app.get("/api/plugins")
async def list_plugins():
    try:
        plugins = [f.replace(".py", "") for f in os.listdir(PLUGINS_DIR) if f.endswith(".py")]
        return {"plugins": plugins}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "service": "vtb-api-analyzer"}