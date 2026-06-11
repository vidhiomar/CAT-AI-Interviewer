from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.stt_service import transcribe_audio
import asyncio

router = APIRouter()

@router.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...)
):
    try:
        audio_bytes = await audio.read()

        if len(audio_bytes) < 200:
            return {"transcript": ""}

        filename = audio.filename or "audio.wav"

        # Run the blocking Faster Whisper model in a thread pool
        # so it does NOT block the async event loop (which causes Network Error)
        loop = asyncio.get_event_loop()
        transcript = await loop.run_in_executor(
            None,
            lambda: transcribe_audio(audio_bytes, filename)
        )

        return {"transcript": transcript}

    except Exception as e:
        print(f"[TRANSCRIBE ENDPOINT ERROR] {e}")
        raise HTTPException(status_code=500, detail=str(e))