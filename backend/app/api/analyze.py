import pandas as pd
from fastapi import APIRouter, HTTPException
from app.utils.session import upload_path, session_path
from app.schemas.analysis import AnalyzeRequest, AnalyzeResponse
from app.engine.profiler import DatasetProfiler
from app.engine.detector import ProblemDetector
import json

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_dataset(request: AnalyzeRequest):
    csv_path = upload_path(request.session_id)
    if not csv_path.exists():
        raise HTTPException(status_code=404, detail="Session not found")

    try:
        df = pd.read_csv(csv_path)
    except Exception:
        raise HTTPException(status_code=422, detail="Could not read CSV")

    if request.target_column not in df.columns:
        raise HTTPException(status_code=422, detail=f"Column '{request.target_column}' not found in dataset")

    profiler = DatasetProfiler(df)
    profile = profiler.profile()

    detector = ProblemDetector(df[request.target_column])
    problem = detector.detect()

    result = {
        "profile": profile,
        "problem": problem,
    }

    session_dir = session_path(request.session_id)
    (session_dir / "analysis.json").write_text(json.dumps(result, indent=2))

    return AnalyzeResponse(
        session_id=request.session_id,
        target_column=request.target_column,
        task_type=problem["task_type"],
        n_classes=problem["n_classes"],
        class_balance=problem["class_balance"],
        profile=profile,
    )