from pydantic import BaseModel
from typing import Dict, Any, List


class StartInterviewRequest(BaseModel):
    profile: Dict[str, Any]


class AnswerRequest(BaseModel):
    profile: Dict[str, Any]
    previous_question: str
    candidate_answer: str


class QAPair(BaseModel):
    question: str
    answer: str


class EvaluationRequest(BaseModel):
    profile: Dict[str, Any]
    qa_pairs: List[QAPair]