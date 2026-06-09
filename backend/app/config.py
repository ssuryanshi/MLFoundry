from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    APP_NAME: str = "CodeML"
    ENV: str = "development"
    MAX_FILE_SIZE_MB: int = 50
    MAX_FILE_SIZE_BYTES: int = 50 * 1024 * 1024
    N_TRIALS: int = 50
    TEST_SIZE: float = 0.2
    CV_FOLDS: int = 5
    STORAGE_BASE: Path = Path("backend/storage")
    UPLOADS_DIR: Path = Path("backend/storage/uploads")
    SESSIONS_DIR: Path = Path("backend/storage/sessions")
    MODELS_DIR: Path = Path("backend/storage/models")

    class Config:
        env_file = ".env"

settings = Settings()