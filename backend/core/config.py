import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    xai_api_key: str = os.getenv("XAI_API_KEY", "")

settings = Settings()