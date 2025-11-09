# backend/app.py
import os
import uuid
import json
import logging
from typing import Optional, List
from urllib.parse import urlparse
import requests
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from tenacity import retry, stop_after_attempt, wait_fixed
from core.config import settings
from core.security import is_blocked_domain, safe_exec_plugin
from core.utils import run_spectral
from tools.api_scanner import run_api_scanner
from tools.kiterunner import run_kiterunner
from tools.zap import run_zap_scan
from tools.postman import generate_postman_collection
from tools.newman import run_newman

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="VTB API Analyzer Pro", version="2.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PLUGINS_DIR = "/tmp/plugins"
os.makedirs(PLUGINS_DIR, exist_ok=True)

# Rate limiting
REQUESTS_PER_IP = {}

class AnalyzeRequest(BaseModel):
    url: Optional[str] = None
    dynamic_scan: bool = False
    plugins: List[str] = []
    ai: bool = False

@app.middleware("http")
async def rate_limiter(request: Request, call_next):
    client_ip = request.client.host
    now = __import__("time").time()
    if client_ip not in REQUESTS_PER_IP:
        REQUESTS_PER_IP[client_ip] = []
    REQUESTS_PER_IP[client_ip] = [t for t in REQUESTS_PER_IP[client_ip] if now - t < 60]
    if len(REQUESTS_PER_IP[client_ip]) > 10:
        raise HTTPException(429, "Too many requests")
    REQUESTS_PER_IP[client_ip].append(now)
    return await call_next(request)

# НОВОЕ: Управление плагинами
@app.get("/api/plugins")
def list_plugins():
    plugins = [f[:-3] for f in os.listdir(PLUGINS_DIR) if f.endswith('.py')]
    return {"plugins": plugins}

@app.get("/api/plugins/{name}", response_class=PlainTextResponse)
def get_plugin(name: str):
    path = os.path.join(PLUGINS_DIR, f"{name}.py")
    if not os.path.exists(path):
        raise HTTPException(404, "Plugin not found")
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

@app.post("/api/plugins")
async def create_plugin(plugin_file: UploadFile = File(...)):
    if not plugin_file.filename.endswith('.py'):
        raise HTTPException(400, "Only .py files allowed")
    path = os.path.join(PLUGINS_DIR, plugin_file.filename)
    with open(path, "wb") as f:
        f.write(await plugin_file.read())
    return {"status": "ok", "name": plugin_file.filename[:-3]}

@app.put("/api/plugins/{name}")
async def update_plugin(name: str, plugin_file: UploadFile = File(...)):
    path = os.path.join(PLUGINS_DIR, f"{name}.py")
    if not os.path.exists(path):
        raise HTTPException(404, "Plugin not found")
    with open(path, "wb") as f:
        f.write(await plugin_file.read())
    return {"status": "ok"}

@app.delete("/api/plugins/{name}")
def delete_plugin(name: str):
    path = os.path.join(PLUGINS_DIR, f"{name}.py")
    if not os.path.exists(path):
        raise HTTPException(404, "Plugin not found")
    os.unlink(path)
    return {"status": "ok"}

@app.post("/api/analyze-api")
@retry(stop=stop_after_attempt(2), wait=wait_fixed(2))
async def analyze_api(
    request: Optional[AnalyzeRequest] = Body(None),
    openapi_file: Optional[UploadFile] = File(None),
    plugins: List[str] = Form([])  # Для совместимости, но используем request.plugins
):
    spec_data = None
    target_url = None
    spec_path = None
    ai = False
    dynamic_scan = False
    selected_plugins = plugins  # fallback

    try:
        if request:
            target_url = request.url
            dynamic_scan = request.dynamic_scan
            ai = request.ai
            selected_plugins = request.plugins or plugins

        if openapi_file:
            contents = await openapi_file.read()
            if openapi_file.filename.endswith(('.yaml', '.yml')):
                import yaml
                spec_data = yaml.safe_load(contents)
            else:
                spec_data = json.loads(contents)
            spec_path = f"/tmp/spec_{uuid.uuid4().hex}.json"
            with open(spec_path, "w") as f:
                json.dump(spec_data, f)
        elif target_url:
            if is_blocked_domain(urlparse(target_url).hostname):
                raise HTTPException(403, "Blocked domain")
            r = requests.get(target_url, timeout=10)
            if r.status_code != 200:
                raise HTTPException(400, "Invalid spec URL")
            try:
                spec_data = r.json()
            except:
                import yaml
                spec_data = yaml.safe_load(r.text)
            spec_path = f"/tmp/spec_{uuid.uuid4().hex}.json"
            with open(spec_path, "w") as f:
                json.dump(spec_data, f)
        else:
            raise HTTPException(400, "No spec")

        all_issues = []
        dynamic_issues = []
        ai_insights = []

        # Spectral
        spectral_res = run_spectral(spec_path)
        all_issues.extend([{
            "code": i.get("code", "SPECTRAL"),
            "message": i.get("message", "")[:200],
            "severity": i.get("severity", 1),
            "path": ".".join(map(str, i.get("path", []))),
            "range": i.get("range")
        } for i in spectral_res if isinstance(i, dict)])

        # Плагины
        for plugin in selected_plugins:
            path = os.path.join(PLUGINS_DIR, f"{plugin}.py")
            if os.path.exists(path):
                plugin_res = safe_exec_plugin(path, json.dumps(spec_data), plugin)
                all_issues.extend(plugin_res)

        # AI анализ (Grok) — ПОЛНОСТЬЮ ОТКЛЮЧЁН
        # if ai and settings.xai_api_key:
        #     try:
        #         prompt = f"Анализируй OpenAPI spec на уязвимости по OWASP API Top 10: BOLA, IDOR, injections, auth, rate limits, data exposure. Верни JSON список: [{{'code': 'AI_OWASP', 'severity': 'high', 'message': 'desc'}}]"
        #         res = requests.post(
        #             "https://api.x.ai/v1/chat/completions",
        #             headers={"Authorization": f"Bearer {settings.xai_api_key}"},
        #             json={
        #                 "model": "grok-beta",
        #                 "messages": [{"role": "user", "content": prompt + "\n\n" + json.dumps(spec_data, indent=2)[:4000]}]
        #             },
        #             timeout=30
        #         )
        #         if res.status_code == 200:
        #             content = res.json()["choices"][0]["message"]["content"]
        #             try:
        #                 ai_insights = json.loads(content)
        #             except:
        #                 ai_insights = [{"code": "AI_PARSE_ERR", "message": content[:500], "severity": "info"}]
        #         else:
        #             ai_insights = [{"code": "AI_ERROR", "message": f"HTTP {res.status_code}", "severity": "high"}]
        #     except Exception as e:
        #         ai_insights = [{"code": "AI_ERROR", "message": str(e), "severity": "high"}]
        # else:
        #     ai_insights = [{"code": "AI_DISABLED", "message": "Grok AI отключён в коде", "severity": "info"}]

        # Динамический скан
        if dynamic_scan and target_url:
            # api_scanner
            scanner_res = run_api_scanner(target_url)
            dynamic_issues.extend(scanner_res.get("issues", []))

            # Kiterunner
            kite_res = run_kiterunner(target_url)
            dynamic_issues.extend(kite_res)

            # ZAP
            zap_res = run_zap_scan(target_url)
            dynamic_issues.extend(zap_res)

            # Newman на найденных путях
            endpoints = []
            for i in dynamic_issues:
                if i.get("code") == "KITE_FOUND":
                    path = i["message"].split(": ", 1)[1] if ": " in i["message"] else ""
                    if ".." not in path and not path.startswith("/etc") and not path.startswith("/proc"):
                        endpoints.append(urlparse(target_url).scheme + "://" + urlparse(target_url).netloc + path)
            if endpoints:
                coll_path = f"/tmp/coll_{uuid.uuid4().hex}.json"
                with open(coll_path, "w") as f:
                    json.dump(generate_postman_collection(endpoints), f)
                newman_res = run_newman(coll_path)
                os.unlink(coll_path)
                for fail in newman_res.get("failures", []):
                    dynamic_issues.append({
                        "code": "NEWMAN_FAIL",
                        "message": fail.get("error", {}).get("message", "Test failed")[:200],
                        "severity": "high"
                    })

            all_issues.extend(dynamic_issues)

        counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
        for i in all_issues:
            sev = i.get("severity", "info").lower()
            if sev in counts:
                counts[sev] += 1

        return {
            "id": uuid.uuid4().hex,
            "total": len(all_issues),
            "truncated": len(all_issues) > 50,
            "issues": all_issues[:50],
            "dynamic_issues": dynamic_issues,
            "ai_insights": [{"code": "AI_DISABLED", "message": "Grok AI отключён в коде", "severity": "info"}],
            "summary": counts,
            "plugins_used": selected_plugins + ["Spectral", "Kiterunner", "api_scanner", "ZAP", "Newman"]
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analyze error: {e}")
        raise HTTPException(500, "Server error")
    finally:
        if spec_path and os.path.exists(spec_path):
            try:
                os.unlink(spec_path)
            except:
                pass

@app.get("/health")
async def health():
    return {"status": "ok", "service": "VTB API Analyzer Pro v2.1"}