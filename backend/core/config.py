from typing import List
from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
    API_PREFIX: str = "/api"
    DEBUG: bool = False
    
    # We set a default for DB to avoid crashes if you don't have Postgres running yet
    DATABASE_URL: str = "sqlite:///./test.db" 
    
    # Allow all origins for Hackathon ease
    ALLOWED_ORIGINS: str = "*"
    
    GEMINI_API_KEY: str
    ELEVENLABS_API_KEY: str = ""

    @field_validator("ALLOWED_ORIGINS")
    def parse_allowed_origins(cls, v: str) -> List[str]:
        if v == "*": return ["*"]
        return v.split(",") if v else []

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()