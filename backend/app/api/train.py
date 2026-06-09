import pandas as pd
import numpy as np
import json
import time
from fastapi import APIRouter, HTTPException, BackgroundTasks
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline
from app.utils.session import upload_path, session_path
from app.schemas.training import TrainRequest, TrainResponse
from app.engine.preprocessor import PreprocessorBuilder
from app.engine.registry import get_models
from app.engine.optimizer import optimize_model, get_cv, get_scoring
from app.engine.leaderboard import LeaderboardManager
from app.engine.exporter import ModelExporter

router = APIRouter()

def run_training(request: TrainRequest):
    session_dir = session_path(request.session_id)
    status_file = session_dir / "train_status.json"

    def update_status(status: str, progress: int, message: str):
        status_file.write_text(json.dumps({
            "status": status,
            "progress_pct": progress,
            "message": message
        }))

    try:
        update_status("training", 0, "Loading dataset")

        df = pd.read_csv(upload_path(request.session_id))
        X = df.drop(columns=[request.target_column])
        y = df[request.target_column]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=request.test_size,
            random_state=42
        )

        preprocessor = PreprocessorBuilder(df, request.target_column).build()
        X_train_proc = preprocessor.fit_transform(X_train)
        X_test_proc = preprocessor.transform(X_test)

        models = get_models(request.task_type)
        cv = get_cv(request.task_type)
        scoring = get_scoring(request.task_type)
        leaderboard = LeaderboardManager(request.session_id)

        total = len(models)
        best_pipeline = None
        best_score = -np.inf

        for i, (model_name, base_model) in enumerate(models.items()):
            update_status("training", int((i / total) * 90), f"Optimizing {model_name}")

            best_params = optimize_model(
                model_name=model_name,
                task_type=request.task_type,
                X=X_train_proc,
                y=y_train,
                n_trials=request.n_trials
            )

            base_model.set_params(**best_params)

            start = time.time()
            scores = cross_val_score(base_model, X_train_proc, y_train, cv=cv, scoring=scoring)
            train_time = time.time() - start

            cv_score = float(np.abs(scores.mean()))
            cv_std = float(scores.std())

            base_model.fit(X_train_proc, y_train)

            pipeline = Pipeline([
                ("preprocessor", preprocessor),
                ("model", base_model)
            ])

            leaderboard.add_result(
                model_name=model_name,
                cv_score=cv_score,
                cv_std=cv_std,
                train_time=train_time,
                params=best_params,
                metrics={}
            )

            if cv_score > best_score:
                best_score = cv_score
                best_pipeline = pipeline
                best_model_name = model_name

        leaderboard.save()

        exporter = ModelExporter(request.session_id)
        exporter.export(best_pipeline, {
            "model_name": best_model_name,
            "cv_score": best_score,
            "task_type": request.task_type,
            "target_column": request.target_column,
        })

        update_status("complete", 100, "Training complete")

    except Exception as e:
        status_file.write_text(json.dumps({
            "status": "failed",
            "progress_pct": 0,
            "message": str(e)
        }))


@router.post("/train", response_model=TrainResponse)
def train_models(request: TrainRequest, background_tasks: BackgroundTasks):
    csv_path = upload_path(request.session_id)
    if not csv_path.exists():
        raise HTTPException(status_code=404, detail="Session not found")

    if request.task_type not in ["binary_classification", "multiclass_classification", "regression"]:
        raise HTTPException(status_code=422, detail="Invalid task_type")

    session_dir = session_path(request.session_id)
    (session_dir / "train_status.json").write_text(json.dumps({
        "status": "queued",
        "progress_pct": 0,
        "message": "Training queued"
    }))

    background_tasks.add_task(run_training, request)

    return TrainResponse(
        session_id=request.session_id,
        status="queued",
        message="Training started in background"
    )


@router.get("/status/{session_id}")
def get_status(session_id: str):
    status_file = session_path(session_id) / "train_status.json"
    if not status_file.exists():
        raise HTTPException(status_code=404, detail="Session not found")
    return json.loads(status_file.read_text())