from fastapi import FastAPI

from app.api.resume import router

from app.api.resume import router as resume_router
from app.api.interview import router as interview_router


app = FastAPI()

app.include_router(router)
app.include_router(resume_router)
app.include_router(interview_router)

@app.get("/")
def home():
    return {
        "message": "AI Interviewer Running"
    }