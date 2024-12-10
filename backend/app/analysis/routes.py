from fastapi import APIRouter, File, HTTPException, UploadFile
import logging

from app.analysis.service import analyze_audio

analysis_router = APIRouter()
logging.basicConfig(level=logging.DEBUG)

@analysis_router.post("/")
async def analyze(file: UploadFile = File(...)):
    try:
        logging.debug(f"Received file: {file.filename}, Type: {file.content_type}")
        
        if file.content_type not in ["audio/mpeg", "audio/wav"]:
            raise HTTPException(status_code=400, detail="Invalid audio file type")
        
        content = await file.read()
        #result = analyze_audio(content)
        return {"analysis": 'yooooo'}
    except Exception as e:
        logging.error(f"Error analyzing file: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
