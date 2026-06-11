from faster_whisper import WhisperModel
import tempfile
import os

model = WhisperModel(
    "tiny.en",
    device="cpu",
    compute_type="int8"
)

def transcribe_audio(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    # Determine extension from filename
    ext = os.path.splitext(filename)[-1] or ".webm"
    
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        segments, _ = model.transcribe(tmp_path)
        text = " ".join(segment.text for segment in segments)
        return text.strip()

    except Exception as e:
        print(f"[STT ERROR] Failed to transcribe audio ({filename}): {e}")
        return ""

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)