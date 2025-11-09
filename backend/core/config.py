# backend/core/config.py — ОТ ДОДРИОСА, ЧЕМПИОНА ВТБ-2025
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    xai_api_key: str = os.getenv("XAI_API_KEY", "")
    zap_proxy: str = os.getenv("ZAP_PROXY", "http://127.0.0.1:8081")  # но мы его отключим
    dynamic_scan: bool = False  # по дефолту — без ZAP

    class Config:
        env_file = ".env"

settings = Settings()