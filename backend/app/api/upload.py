import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.utils.session import create_session, upload_path
from app.schemas.upload import UploadResponse
import aiofiles

router = APIRouter()

MAX_SIZE = 50 * 1024 * 1024

@router.post("/upload", response_model=UploadResponse)
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=422, detail="Only CSV files accepted")

    contents = await file.read()

    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Max size is 50MB")

    session_id = create_session()
    path = upload_path(session_id)

    async with aiofiles.open(path, "wb") as f:
        await f.write(contents)

    try:
        df = pd.read_csv(path)
    except Exception:
        raise HTTPException(status_code=422, detail="Could not parse CSV file")

    return UploadResponse(
        session_id=session_id,
        filename=file.filename,
        rows=int(df.shape[0]),
        columns=int(df.shape[1]),
        file_size_kb=round(len(contents) / 1024, 2),
        column_names=df.columns.tolist()
    )