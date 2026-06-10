import edge_tts
import uuid
import os
import time

OUTPUT_DIR = "generated_audio"
os.makedirs(OUTPUT_DIR, exist_ok=True)

VOICE = "en-US-AriaNeural"

async def generate_speech(text: str):
    start = time.time()
    
    audio_file = f"{OUTPUT_DIR}/{uuid.uuid4()}.mp3"
    
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(audio_file)
    
    print(f"TTS Generation Time (Edge-TTS): {time.time() - start:.2f}s")
    
    return audio_file