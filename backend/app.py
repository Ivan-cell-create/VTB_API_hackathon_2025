# backend/app.py
import os
import uuid
import json
import logging
from typing import Optional, List
from urllib.parse import urlparse

import requests
import yaml
import subprocess
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel

from core.config import settings
from core.security import is_blocked_domain, run_bandit, safe_exec_plugin
from core.utils import run_spectral
from tools.api_scanner import run_api_scanner
from tools.kiterunner import run_kiterunner
from tools.zap import run_zap_scan
from tools.postman import generate_postman_collection
from tools.newman import run_newman

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="VTB API Analyzer Pro", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PLUGINS_DIR = "/tmp/plugins"
os.makedirs(PLUGINS_DIR, exist_ok=True)


class AnalyzeRequest(BaseModel):
    url: Optional[str] = None
    dynamic_scan: bool = False


@app.post("/api/analyze-api")
async def analyze_api(
    request: Optional[AnalyzeRequest] = Body(None),
    openapi_file: Optional[UploadFile] = File(None),
    plugins: List[str] = Form([])
):
    spec_data = None
    target_url = None
    spec_path = None

    try:
        # 1. Получение OpenAPI
        if openapi_file:
            if openapi_file.size > 2 * 1024 * 1024:
                raise HTTPException(400, "File > 2MB")
            spec_data = (await openapi_file.read()).decode("utf-8")
        elif request and request.url:
            url = request.url.strip()
            if is_blocked_domain(urlparse(url).hostname or ""):
                raise HTTPException(400, "SSRF blocked")
            resp = requests.get(url, timeout=30, headers={"User-Agent": "VTB-Analyzer/1.0"})
            resp.raise_for_status()
            spec_data = resp.text
            target_url = url.rsplit("/", 1)[0]
        else:
            raise HTTPException(400, "URL or file required")

        # 2. Сохраняем временно
        spec_path = f"/tmp/spec_{uuid.uuid4().hex}.yaml"
        with open(spec_path, "w") as f:
            f.write(spec_data)

        # 3. Анализ
        all_issues = []
        dynamic_issues = []

        # Spectral
        all_issues.extend(run_spectral(spec_path))

        # Плагины
        for name in plugins:
            path = f"{PLUGINS_DIR}/{name}.py"
            if os.path.exists(path):
                all_issues.extend(safe_exec_plugin(path, spec_data, name))

        # Динамический скан
        if request and request.dynamic_scan and target_url:
            # Kiterunner
            dynamic_issues.extend(run_kiterunner(target_url))

            # Твой api_scanner (VTB-убийца)
            scanner_result = run_api_scanner(target_url)
            dynamic_issues.extend(scanner_result.get("issues", []))

            # ZAP
            dynamic_issues.extend(run_zap_scan(target_url))

            # Newman (по найденным Kiterunner)
            endpoints = [
                i["message"].split(": ", 1)[1]
                for i in dynamic_issues
                if i.get("code") == "KITE_FOUND"
            ]
            if endpoints:
                coll_path = f"/tmp/coll_{uuid.uuid4().hex}.json"
                with open(coll_path, "w") as f:
                    json.dump(generate_postman_collection(endpoints), f)
                newman_res = run_newman(coll_path)
                os.unlink(coll_path)
                for fail in newman_res.get("failures", []):
                    dynamic_issues.append({
                        "code": "NEWMAN_FAIL",
                        "message": fail.get("error", {}).get("message", "Test failed"),
                        "severity": "high"
                    })

            all_issues.extend(dynamic_issues)

        # Статистика
        counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
        for i in all_issues:
            sev = i.get("severity", "info").lower()
            if sev in counts:
                counts[sev] += 1

        return {
            "total": len(all_issues),
            "truncated": len(all_issues) > 50,
            "issues": all_issues[:50],
            "dynamic_issues": dynamic_issues,
            "summary": counts,
            "plugins_used": plugins + ["Spectral", "Kiterunner", "api_scanner", "ZAP", "Newman"]
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
    return {"status": "ok", "service": "VTB API Analyzer Pro"}