# backend/tools/api_scanner.py
import json
import sys
import requests
from urllib.parse import urljoin
from typing import List, Dict

def run_api_scanner(target_url: str) -> Dict[str, List[Dict]]:
    issues = []
    session = requests.Session()
    session.verify = False
    session.headers.update({"User-Agent": "VTB-Hackathon-Scanner/1.0"})

    try:
        # 1. Default creds test:test
        login_url = urljoin(target_url, "/auth/login")
        r = session.post(login_url, json={"login": "test", "password": "test"}, timeout=10)
        if r.status_code == 200:
            issues.append({
                "code": "VTB_DEFAULT_CREDS",
                "message": "УСПЕШНЫЙ ВХОД test/test — СЛАБЫЕ УЧЁТНЫЕ ДАННЫЕ!",
                "severity": "critical"
            })

        # 2. Открытый /admin
        admin = session.get(urljoin(target_url, "/admin"), timeout=10)
        if admin.status_code == 200 and "admin" in admin.text.lower():
            issues.append({
                "code": "VTB_OPEN_ADMIN",
                "message": "Панель /admin доступна без авторизации",
                "severity": "high"
            })

        # 3. Debug эндпоинты
        debug_paths = ["/debug", "/api/debug", "/_debug", "/healthz", "/metrics", "/actuator", "/env", "/config"]
        for path in debug_paths:
            r = session.get(urljoin(target_url, path), timeout=5)
            if r.status_code == 200:
                issues.append({
                    "code": "VTB_DEBUG_EXPOSED",
                    "message": f"Debug-эндпоинт открыт: {path}",
                    "severity": "high"
                })

        # 4. GraphQL introspection
        gql = session.post(urljoin(target_url, "/graphql"), json={"query": "{ __schema { types { name } } }"}, timeout=10)
        if gql.status_code == 200 and "__schema" in gql.text:
            issues.append({
                "code": "VTB_GRAPHQL_INTROSPECTION",
                "message": "GraphQL introspection включён — утечка схемы",
                "severity": "high"
            })

    except Exception as e:
        issues.append({
            "code": "SCANNER_ERROR",
            "message": f"Ошибка сканирования: {str(e)}",
            "severity": "info"
        })

    result = {"issues": issues}
    print(json.dumps(result))
    return result


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python api_scanner.py <url>"}))
        sys.exit(1)
    run_api_scanner(sys.argv[1])