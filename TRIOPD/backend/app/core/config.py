from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    TEMP_DIR: str = "temp"
    
    class Config:
        env_file = ".env"

settings = Settings()

# Create temp directory if it doesn't exist
os.makedirs(settings.TEMP_DIR, exist_ok=True)