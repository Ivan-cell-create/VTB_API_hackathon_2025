# backend/core/security.py
import ast
import logging
import os
import json
import subprocess
import tempfile
from typing import List, Dict

logger = logging.getLogger(__name__)

# Запрещённые домены и IP
BLOCKED_HOSTS = {
    "localhost", "127.0.0.1", "::1", "0.0.0.0",
    "169.254.169.254", "metadata.google.internal", "metadata"
}

INTERNAL_IPS = [
    "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16",
    "169.254.0.0/16", "127.0.0.0/8", "::1/128", "fc00::/7"
]

def is_blocked_domain(host: str) -> bool:
    if not host:
        return True
    host = host.lower()
    if host in BLOCKED_HOSTS:
        return True
    try:
        import socket
        ip = socket.gethostbyname(host)
        octets = list(map(int, ip.split(".")))
        for cidr in INTERNAL_IPS:
            if "/" in cidr:
                net, mask = cidr.split("/")
                net_octets = list(map(int, net.split(".")))[:4]
                if len(octets) >= len(net_octets):
                    if all(o == n for o, n in zip(octets[:len(net_octets)], net_octets)):
                        return True
        return ip.startswith("169.254.") or ip.startswith("127.") or ip.startswith("0.")
    except:
        return True
    return False

# Запрещённые вызовы
FORBIDDEN_NAMES = {
    "exec", "eval", "compile", "open", "file", "input", "raw_input",
    "subprocess", "os", "sys", "socket", "requests", "urllib",
    "popen", "system", "fork", "execfile", "pty", "__import__"
}

FORBIDDEN_ATTRS = {
    "system", "popen", "call", "check_call", "Popen", "fork", "execv",
    "__subclasses__", "__bases__", "__mro__", "__globals__", "__builtins__"
}

class SafeVisitor(ast.NodeVisitor):
    def visit_Call(self, node):
        if isinstance(node.func, ast.Name):
            if node.func.id in FORBIDDEN_NAMES:
                raise ValueError(f"Forbidden function: {node.func.id}")
        if isinstance(node.func, ast.Attribute):
            if node.func.attr in FORBIDDEN_ATTRS:
                raise ValueError(f"Forbidden attribute: {node.func.attr}")
            if isinstance(node.func.value, ast.Name) and node.func.value.id == "__builtins__":
                raise ValueError("Access to __builtins__ denied")
        self.generic_visit(node)

    def visit_Attribute(self, node):
        if node.attr in FORBIDDEN_ATTRS:
            raise ValueError(f"Forbidden attribute access: {node.attr}")
        if isinstance(node.value, ast.Name) and node.value.id == "__builtins__":
            raise ValueError("__builtins__ access blocked")
        self.generic_visit(node)

    def visit_Subscript(self, node):
        if isinstance(node.value, ast.Name) and node.value.id == "__builtins__":
            raise ValueError("__builtins__ subscript blocked")
        self.generic_visit(node)

def safe_exec_plugin(plugin_path: str, spec_data: str, plugin_name: str) -> List[Dict]:
    try:
        with open(plugin_path, "r", encoding="utf-8") as f:
            code = f.read()

        tree = ast.parse(code)
        SafeVisitor().visit(tree)

        # Только разрешённые функции
        allowed_globals = {
            "__builtins__": {},
            "json": json,
            "spec": spec_data,
        }

        local_vars = {}
        exec(code, allowed_globals, local_vars)

        analyze = local_vars.get("analyze")
        if not callable(analyze):
            raise ValueError("No analyze() function")

        result = analyze(spec_data)
        if not isinstance(result, list):
            result = [result] if result else []

        for item in result:
            item.setdefault("plugin", plugin_name)
            item.setdefault("severity", "info")
            item.setdefault("code", "CUSTOM")
        return result

    except Exception as e:
        logger.error(f"Plugin {plugin_name} blocked: {e}")
        return [{"code": "PLUGIN_BLOCKED", "message": f"Plugin execution blocked: {str(e)}", "severity": "high", "plugin": plugin_name}]

def run_bandit(code: str) -> Dict:
    return {"results": []}