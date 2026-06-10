from fastapi import APIRouter, UploadFile, File
from app.services.stt_service import transcribe_audio

router = APIRouter()

@router.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...)
):
    transcript = transcribe_audio(audio)

    return {
        "transcript": transcript
    }