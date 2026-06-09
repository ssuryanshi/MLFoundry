import pandas as pd
from fastapi import APIRouter, HTTPException
from app.utils.session import upload_path, session_path
from app.engine.explainer import ExplainabilityEngine
from app.engine.exporter import ModelExporter
from app.schemas.explain import ExplainResponse
import json

router = APIRouter()

@router.get("/explain/{session_id}", response_model=ExplainResponse)
def explain_model(session_id: str):
    if not upload_path(session_id).exists():
        raise HTTPException(status_code=404, detail="Session not found")

    exporter = ModelExporter(session_id)
    if not exporter.exists():
        raise HTTPException(status_code=404, detail="No trained model found. Run training first.")

    metadata = exporter.load_metadata()
    target_column = metadata.get("target_column")

    pipeline = exporter.load_pipeline()

    df = pd.read_csv(upload_path(session_id))
    X_test = df.drop(columns=[target_column])

    engine = ExplainabilityEngine(pipeline, X_test)
    result = engine.explain()

    session_dir = session_path(session_id)
    (session_dir / "explain.json").write_text(json.dumps(result, indent=2))

    return ExplainResponse(
        session_id=session_id,
        feature_names=result["feature_names"],
        global_importance=result["global_importance"],
        local_shap_row0=result["local_shap_row0"],
        base_value=result["base_value"],
    )
