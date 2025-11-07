import subprocess
import json
import uuid
import os
from typing import List, Dict

def run_zap_scan(target_url: str) -> List[Dict]:
    report = f"/tmp/zap_{uuid.uuid4().hex}.json"
    try:
        subprocess.run(
            ["zap.sh", "-cmd", "-quickurl", target_url, "-quickout", report],
            timeout=900, check=True
        )
        if os.path.exists(report):
            with open(report) as f:
                data = json.load(f)
            os.unlink(report)
            alerts = data.get("site", [{}])[0].get("alerts", [])
            return [
                {"code": f"ZAP_{a['risk']}", "message": a['alert'], "severity": a['risk'].lower()}
                for a in alerts
            ]
        return [{"code": "ZAP_NO_REPORT", "message": "No report", "severity": "high"}]
    except Exception as e:
        return [{"code": "ZAP_EX", "message": str(e), "severity": "high"}]