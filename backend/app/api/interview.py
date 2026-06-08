from fastapi import APIRouter, HTTPException
from app.schemas.interview import (
    StartInterviewRequest,
    AnswerRequest,
    EvaluationRequest
)

from app.agents.interview_manager import (
    generate_first_question,
    generate_followup_question
)

from app.agents.evaluator import evaluate_interview

import json

router = APIRouter()


@router.post("/start-interview")
async def start_interview(
    request: StartInterviewRequest
):
    """
    Generate the first interview question
    based on the candidate profile.
    """

    try:
        profile_json = json.dumps(
            request.profile,
            indent=2
        )

        question = generate_first_question(
            profile=profile_json
        )

        return {
            "success": True,
            "question": question
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start interview: {str(e)}"
        )


@router.post("/answer")
async def answer_question(
    request: AnswerRequest
):
    """
    Generate a follow-up question based on
    the previous question and candidate answer.
    """

    try:
        profile_json = json.dumps(
            request.profile,
            indent=2
        )

        next_question = generate_followup_question(
            profile=profile_json,
            previous_question=request.previous_question,
            candidate_answer=request.candidate_answer
        )

        return {
            "success": True,
            "next_question": next_question
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate follow-up question: {str(e)}"
        )


@router.post("/evaluate")
async def evaluate(
    request: EvaluationRequest
):
    """
    Evaluate the complete interview and
    generate the final report.
    """

    try:

        qa_pairs = [
            {
                "question": pair.question,
                "answer": pair.answer
            }
            for pair in request.qa_pairs
        ]

        report = evaluate_interview(
            profile=request.profile,
            qa_pairs=qa_pairs
        )

        return {
            "success": True,
            "report": report
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to evaluate interview: {str(e)}"
        )