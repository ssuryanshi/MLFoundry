import json
from pathlib import Path
from typing import List, Dict
from app.utils.session import session_path

class LeaderboardManager:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.path = session_path(session_id) / "leaderboard.json"
        self.entries: List[Dict] = []

    def add_result(
        self,
        model_name: str,
        cv_score: float,
        cv_std: float,
        train_time: float,
        params: dict,
        metrics: dict
    ):
        self.entries.append({
            "model": model_name,
            "cv_score": round(cv_score, 5),
            "cv_std": round(cv_std, 5),
            "train_time_sec": round(train_time, 2),
            "params": params,
            "metrics": metrics,
        })

    def save(self) -> List[Dict]:
        ranked = sorted(
            self.entries,
            key=lambda x: x["cv_score"],
            reverse=True
        )
        for i, entry in enumerate(ranked):
            entry["rank"] = i + 1
            entry["is_best"] = i == 0

        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(ranked, indent=2))
        return ranked

    def load(self) -> List[Dict]:
        if not self.path.exists():
            return []
        return json.loads(self.path.read_text())

    def get_best(self) -> Dict:
        ranked = self.load()
        if not ranked:
            return {}
        return ranked[0]