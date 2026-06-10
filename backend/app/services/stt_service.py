from faster_whisper import WhisperModel
import tempfile
import os

model = WhisperModel(
    "tiny.en",
    device="cpu",
    compute_type="int8"
)

def transcribe_audio(audio_file):
    # Handle FastAPI UploadFile
    if hasattr(audio_file, "file"):
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
            temp_audio.write(audio_file.file.read())
            temp_audio_path = temp_audio.name
            
        try:
            segments, _ = model.transcribe(temp_audio_path)
            text = ""
            for segment in segments:
                text += segment.text + " "
            return text.strip()
        finally:
            os.remove(temp_audio_path)
            
    else:
        # Fallback for direct path
        segments, _ = model.transcribe(audio_file)
        text = ""
        for segment in segments:
            text += segment.text + " "
        return text.strip()