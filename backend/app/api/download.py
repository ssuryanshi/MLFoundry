from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.utils.session import session_path
from app.engine.exporter import ModelExporter

router = APIRouter()

@router.get("/download/{session_id}")
def download_model(session_id: str):
    if not session_path(session_id).exists():
        raise HTTPException(status_code=404, detail="Session not found")

    exporter = ModelExporter(session_id)
    if not exporter.exists():
        raise HTTPException(status_code=404, detail="No trained model found. Run training first.")

    model_file = exporter.base / "best_model.pkl"

    return FileResponse(
        path=str(model_file),
        media_type="application/octet-stream",
        filename="codeml_model.pkl"
    )