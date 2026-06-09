import json
from fastapi import APIRouter, HTTPException
from app.utils.session import session_path
from app.engine.leaderboard import LeaderboardManager

router = APIRouter()

@router.get("/leaderboard/{session_id}")
def get_leaderboard(session_id: str):
    session_dir = session_path(session_id)
    if not session_dir.exists():
        raise HTTPException(status_code=404, detail="Session not found")

    status_file = session_dir / "train_status.json"
    if status_file.exists():
        status = json.loads(status_file.read_text())
        if status["status"] == "training":
            return {
                "status": "training",
                "progress_pct": status["progress_pct"],
                "message": status["message"],
                "leaderboard": []
            }
        if status["status"] == "failed":
            raise HTTPException(status_code=500, detail=status["message"])

    leaderboard = LeaderboardManager(session_id)
    entries = leaderboard.load()

    if not entries:
        raise HTTPException(status_code=404, detail="No leaderboard found. Training may not be complete.")

    return {
        "status": "complete",
        "progress_pct": 100,
        "message": "Training complete",
        "leaderboard": entries
    }