from kokoro import KPipeline
import soundfile as sf
import uuid
import os
import time

pipeline = KPipeline(lang_code="a")

OUTPUT_DIR = "generated_audio"
os.makedirs(OUTPUT_DIR, exist_ok=True)


def generate_speech(text: str):

    start = time.time()

    audio_file = (
        f"{OUTPUT_DIR}/{uuid.uuid4()}.wav"
    )

    generator = pipeline(
        text,
        voice="af_heart"
    )

    for _, _, audio in generator:
        sf.write(
            audio_file,
            audio,
            24000
        )
        break

    print(
        f"TTS Generation Time: {time.time() - start:.2f}s"
    )

    return audio_file