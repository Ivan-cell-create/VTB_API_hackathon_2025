def generate_postman_collection(endpoints: List[str]) -> dict:
    return {
        "info": {"name": "VTB Auto Test", "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"},
        "item": [
            {
                "name": ep,
                "request": {
                    "method": "GET",
                    "header": [],
                    "url": {"raw": ep, "protocol": "https", "host": ["{{host}}"], "path": ep.split("/")[1:]}
                }
            } for ep in endpoints
        ]
    }