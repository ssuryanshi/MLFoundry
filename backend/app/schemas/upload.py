from pydantic import BaseModel

class UploadResponse(BaseModel):
    session_id: str
    filename: str
    rows: int
    columns: int
    file_size_kb: float
    column_names: list[str]