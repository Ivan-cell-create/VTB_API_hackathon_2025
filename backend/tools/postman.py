# backend/tools/postman.py
from urllib.parse import urlparse, urlunparse
from typing import List

def generate_postman_collection(endpoints: List[str]) -> dict:
    items = []
    for ep in endpoints:
        parsed = urlparse(ep)
        if ".." in parsed.path or parsed.path.startswith("/etc") or parsed.path.startswith("/proc"):
            continue
        items.append({
            "name": parsed.path or "/",
            "request": {
                "method": "GET",
                "header": [],
                "url": {
                    "raw": ep,
                    "protocol": parsed.scheme,
                    "host": parsed.hostname.split("."),
                    "port": parsed.port,
                    "path": parsed.path.split("/")
                }
            }
        })
    return {
        "info": {"name": "VTB Secure Test", "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"},
        "item": items
    }