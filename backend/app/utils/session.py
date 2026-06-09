import uuid
from pathlib import Path

BASE = Path("storage")

def create_session() -> str:
    session_id = str(uuid.uuid4())
    (BASE / "sessions" / session_id).mkdir(parents=True, exist_ok=True)
    return session_id

def session_path(session_id: str) -> Path:
    return BASE / "sessions" / session_id

def upload_path(session_id: str) -> Path:
    return BASE / "uploads" / f"{session_id}.csv"

def model_path(session_id: str) -> Path:
    path = BASE / "models" / session_id
    path.mkdir(parents=True, exist_ok=True)
    return path