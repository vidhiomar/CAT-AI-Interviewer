from fastapi import FastAPI

from app.api.resume import router

app = FastAPI()

app.include_router(router)

@app.get("/")
def home():
    return {
        "message": "AI Interviewer Running"
    }