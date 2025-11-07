import subprocess
import json
from typing import List, Dict

def run_spectral(spec_path: str) -> List[Dict]:
    cmd = [
        "spectral", "lint", spec_path,
        "--ruleset", "@stoplight/spectral-rulesets/owasp-api-security",
        "--format", "json"
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            return [{"code": "SPECTRAL_ERROR", "message": result.stderr[:500], "severity": "high"}]
    except Exception as e:
        return [{"code": "SPECTRAL_ERR", "message": str(e), "severity": "high"}]