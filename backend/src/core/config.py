"""
Configuration management - All settings from environment variables only
NO HARDCODED DEFAULTS - Everything from .env
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings - loaded entirely from .env file"""
    
    # API Configuration (REQUIRED)
    openrouter_api_key: str
    openrouter_base_url: str
    model_name: str
    
    # Database Configuration
    database_url: str
    redis_url: str
    
    # Processing Configuration
    chunk_size: int
    chunk_overlap: int
    similarity_threshold: float
    max_citations: int
    confidence_threshold: float
    
    # Server Configuration
    host: str
    port: int
    debug: bool
    
    # Application Configuration
    app_name: str
    app_version: str
    
    # CORS Configuration
    cors_origins: str
    cors_credentials: bool
    cors_methods: str
    cors_headers: str
    
    # File Upload Configuration
    upload_dir: str
    max_upload_size: int
    
    # Questionnaire Configuration
    questionnaire_path: str
    max_questions_per_batch: int
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        protected_namespaces = ('settings_',)


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
