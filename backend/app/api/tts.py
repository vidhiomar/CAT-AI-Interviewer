from fastapi import APIRouter
from fastapi.responses import FileResponse

from app.services.tts_service import (
    generate_speech
)

router = APIRouter()


@router.post("/speak")
async def speak(data: dict):

    text = data["text"]

    audio_path = generate_speech(
        text
    )

    return FileResponse(
        audio_path,
        media_type="audio/wav"
    )