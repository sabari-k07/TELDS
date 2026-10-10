import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Transformer Energy Loss Detection System (TELDS)"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./telds.db"
    )
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "telds-super-secret-jwt-key-2026-production-ready")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "*"
    ]
    
    # Energy Loss & Anomaly Thresholds
    # Normal technical loss typically sits between 3% to 8%
    TECHNICAL_LOSS_ALLOWANCE_PERCENT: float = 6.0
    WARNING_LOSS_THRESHOLD_PERCENT: float = 10.0
    CRITICAL_LOSS_THRESHOLD_PERCENT: float = 18.0
    
    # Peak Hours Definition (7:00 PM to 10:00 PM = 19 to 22)
    PEAK_HOUR_START: int = 19
    PEAK_HOUR_END: int = 22

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
