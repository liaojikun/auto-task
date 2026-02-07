from pydantic_settings import BaseSettings
from typing import ClassVar

class Settings(BaseSettings):
    PROJECT_NAME: str = "TestFlow Pro API"
    API_V1_STR: str = "/api/v1"
    
    # Database (Hardcoded for Dev as requested)
    DB_USER: str = "auto"
    DB_PASS: str = "ts8SAzAM8YdTsPec"
    DB_HOST: str = "192.168.1.100"
    DB_PORT: int = 3366
    DB_NAME: str = "auto"
    
    # Constructed Database URL
    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+aiomysql://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # Jenkins
    JENKINS_URL: str = "http://192.168.1.100:8080"
    JENKINS_USER: str = "admin"
    JENKINS_PASS: str = "admin"

    class Config:
        case_sensitive = True

settings = Settings()
