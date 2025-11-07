import subprocess
import json
from typing import List, Dict

def run_kiterunner(target_url: str) -> List[Dict]:
    try:
        result = subprocess.run(
            ["kiterunner", "scan", target_url, "--json"],
            capture_output=True, text=True, timeout=600
        )
        if result.returncode == 0:
            data = json.loads(result.stdout)
            return [
                {"code": "KITE_FOUND", "message": f"Found: {ep['path']}", "severity": "info"}
                for ep in data.get("endpoints", [])
            ]
        else:
            return [{"code": "KITE_ERROR", "message": result.stderr[:200], "severity": "high"}]
    except Exception as e:
        return [{"code": "KITE_EX", "message": str(e), "severity": "high"}]