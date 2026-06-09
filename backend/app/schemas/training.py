from pydantic import BaseModel, Field
from typing import Optional

class TrainRequest(BaseModel):
    session_id: str
    target_column: str
    task_type: str
    n_trials: int = Field(default=50, ge=10, le=200)
    test_size: float = Field(default=0.2, ge=0.1, le=0.4)

class TrainResponse(BaseModel):
    session_id: str
    status: str
    message: str