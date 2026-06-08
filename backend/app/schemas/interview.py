from pydantic import BaseModel
from typing import Any , Dict
class StartInterviewRequest(BaseModel):
    profile: Dict[str, Any]
class AnswerRequest(BaseModel):
    profile: dict[str, Any]
    previous_question: str
    candidate_answer: str