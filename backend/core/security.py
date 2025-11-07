import subprocess
import json
import tempfile
import ast
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

SAFE_GLOBALS = {
    '__builtins__': {
        'len': len, 'dict': dict, 'str': str, 'list': list,
        'print': print, 'range': range, 'enumerate': enumerate,
        'zip': zip, 'sorted': sorted, 'min': min, 'max': max,
        'sum': sum, 'any': any, 'all': all, 'map': map, 'filter': filter,
        'isinstance': isinstance, 'type': type, 'hasattr': hasattr,
    },
    'json': json,
}

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
        try: __import__('os').unlink(path)
        except: pass

def safe_exec_plugin(plugin_path: str, spec_data: str, plugin_name: str) -> List[Dict]:
    try:
        with open(plugin_path) as f:
            code = f.read()

        tree = ast.parse(code)
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                func = node.func
                if isinstance(func, ast.Name) and func.id in {'exec', 'eval', 'open', 'subprocess', 'os'}:
                    raise ValueError("Forbidden function")
                if isinstance(func, ast.Attribute) and func.attr in {'system', 'popen'}:
                    raise ValueError("Forbidden method")

        local_vars = {}
        exec(code, SAFE_GLOBALS, local_vars)
        analyze = local_vars.get('analyze')
        if not callable(analyze):
            raise ValueError("No analyze() function")

        findings = analyze(spec_data)
        if not isinstance(findings, list):
            findings = [findings]

        for f in findings:
            f.setdefault("plugin", plugin_name)
            f.setdefault("severity", "info")
            f.setdefault("code", "CUSTOM")
        return findings

    except Exception as e:
        logger.error(f"Plugin {plugin_name} error: {e}")
        return [{"code": "PLUGIN_ERROR", "message": str(e), "severity": "high", "plugin": plugin_name}]