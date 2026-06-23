from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import upload, analyze, train, leaderboard, explain, download

def create_app() -> FastAPI:
    app = FastAPI(
        title="CodeML AutoML API",
        description="Explainable AutoML Platform for Tabular Data",
        version="1.0.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "https://your-project.vercel.app",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(upload.router,      prefix="/api", tags=["upload"])
    app.include_router(analyze.router,     prefix="/api", tags=["analyze"])
    app.include_router(train.router,       prefix="/api", tags=["train"])
    app.include_router(leaderboard.router, prefix="/api", tags=["leaderboard"])
    app.include_router(explain.router,     prefix="/api", tags=["explain"])
    app.include_router(download.router,    prefix="/api", tags=["download"])

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app

app = create_app()