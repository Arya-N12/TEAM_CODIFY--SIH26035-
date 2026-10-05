from fastapi import FastAPI, File, UploadFile, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tempfile
import os
import time
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

from .schemas import get_schema
from .extraction.extractor import Extractor

# ASR logic
ASR_ENGINE = os.getenv("ASR_ENGINE", "faster_whisper")
MAX_AUDIO_SIZE_MB = int(os.getenv("MAX_AUDIO_SIZE_MB", "10"))

class TTSRequest(BaseModel):
    text: str
    voice: str = "en-IN"

app = FastAPI(title="Voice Entry Service")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

extractor = Extractor()

@app.on_event("startup")
async def startup_event():
    try:
        from .asr.faster_whisper_asr import FasterWhisperASR
        app.state.asr = FasterWhisperASR()
    except Exception as e:
        logger.exception("Failed to load FasterWhisperASR")
        raise RuntimeError(f"Failed to load FasterWhisperASR: {e}") from e

@app.get("/api/voice/health")
def health_check():
    return {
        "status": "ok",
        "engine": ASR_ENGINE,
        "model_loaded": app.state.asr is not None
    }

@app.get("/api/voice/schema")
def schema():
    return get_schema()

@app.post("/api/voice/transcribe-extract")
async def transcribe_extract(
    audio: UploadFile = File(...),
    section_id: str = Form(...),
    language: str = Form("en")
):
    start_time = time.time()
    
    content_type = audio.content_type or ""
    if not content_type.startswith("audio/") and content_type not in ["video/webm", "application/octet-stream", "video/mp4"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type. Must be an audio file.")

    content = await audio.read()
    if len(content) > MAX_AUDIO_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=f"Audio size exceeds {MAX_AUDIO_SIZE_MB}MB limit.")
        
    if len(content) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty audio file provided.")
    
    # Save audio temporarily
    ext = ".webm"
    if audio.filename:
        _, file_ext = os.path.splitext(audio.filename)
        if file_ext:
            ext = file_ext
            
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        tmp.write(content)
        tmp_path = tmp.name
        
    try:
        if app.state.asr is None:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="ASR Engine not loaded.")
            
        # Transcribe
        try:
            transcript = app.state.asr.transcribe(tmp_path, language)
        except Exception as e:
            logger.error(f"Transcription error: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Transcription failed: {str(e)}")
        
        # Extract
        try:
            extraction_result = extractor.extract(transcript, section_id)
        except Exception as e:
            logger.error(f"Extraction error: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Extraction failed: {str(e)}")
        
        return {
            "request_id": f"req_{int(time.time())}",
            "transcript": transcript,
            "duration": time.time() - start_time,
            "fields": extraction_result["fields"],
            "unmatched_segments": extraction_result["unmatched_segments"],
            "warnings": extraction_result["warnings"],
            "timings": {"total": time.time() - start_time}
        }
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@app.post("/api/voice/tts")
def tts_fallback(req: TTSRequest):
    # This represents the Bhashini proxy. Not fully implemented here.
    # Return failure so frontend falls back to Web Speech API
    return {"status": "error", "message": "Bhashini not configured."}

@app.post("/api/voice/extract-text")
def extract_text(text: str = Form(...), section_id: str = Form(...)):
    # Dev only
    extraction_result = extractor.extract(text, section_id)
    return {
        "transcript": text,
        "fields": extraction_result["fields"],
        "unmatched_segments": extraction_result["unmatched_segments"],
        "warnings": extraction_result["warnings"]
    }
