from pydantic import BaseModel
from typing import List, Optional

class ExplainResponse(BaseModel):
    session_id: str
    feature_names: List[str]
    global_importance: List[float]
    local_shap_row0: List[float]
    base_value: Optional[float]