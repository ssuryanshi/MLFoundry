import joblib
import json
from pathlib import Path
from sklearn.pipeline import Pipeline
from app.utils.session import model_path

class ModelExporter:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.base = model_path(session_id)

    def export(self, pipeline: Pipeline, metadata: dict) -> Path:
        model_file = self.base / "best_model.pkl"
        meta_file = self.base / "metadata.json"

        joblib.dump(pipeline, model_file)
        meta_file.write_text(json.dumps(metadata, indent=2))

        return model_file

    def load_pipeline(self) -> Pipeline:
        model_file = self.base / "best_model.pkl"
        if not model_file.exists():
            raise FileNotFoundError(f"No model found for session {self.session_id}")
        return joblib.load(model_file)

    def load_metadata(self) -> dict:
        meta_file = self.base / "metadata.json"
        if not meta_file.exists():
            return {}
        return json.loads(meta_file.read_text())

    def exists(self) -> bool:
        return (self.base / "best_model.pkl").exists()