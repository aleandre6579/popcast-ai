from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from app.analysis.utils import analyze_audio

analysis_router = APIRouter()

@analysis_router.post("/")
async def analyze(file: UploadFile = File(...)):
    if file.content_type not in ["audio/mpeg", "audio/wav"]:
        raise HTTPException(status_code=400, detail="Invalid audio file type")
    result = analyze_audio(await file.read())
    return {"analysis": result}

