from pydantic import BaseModel
from typing import Dict, Any

class AnalyzeRequest(BaseModel):
    session_id: str
    target_column: str

class AnalyzeResponse(BaseModel):
    session_id: str
    target_column: str
    task_type: str
    n_classes: int
    class_balance: Dict[str, Any]
    profile: Dict[str, Any]