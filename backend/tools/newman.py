import subprocess
import json
import uuid
import os
from typing import Dict
from .postman import generate_postman_collection

def run_newman(collection_path: str) -> Dict:
    report = f"/tmp/newman_{uuid.uuid4().hex}.json"
    try:
        subprocess.run(
            ["newman", "run", collection_path, "--reporters", "json", "--reporter-json-export", report],
            timeout=600, check=True
        )
        if os.path.exists(report):
            with open(report) as f:
                data = json.load(f)
            os.unlink(report)
            return {"failures": data.get("run", {}).get("failures", [])}
        return {"failures": []}
    except Exception as e:
        return {"failures": [{"error": {"message": str(e)}}]}