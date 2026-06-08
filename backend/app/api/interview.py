from fastapi import APIRouter

from app.schemas.interview import StartInterviewRequest

from app.agents.interview_manager import (
    generate_first_question
)

router = APIRouter()


@router.post("/start-interview")
async def start_interview(request: StartInterviewRequest):

    question = generate_first_question(request.profile)

    return {
        "success": True,
        "question": question
    }