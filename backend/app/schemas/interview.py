from pydantic import BaseModel
from typing import Dict, Any, List, Optional


class StartInterviewRequest(BaseModel):
    profile: Dict[str, Any]


class AnswerRequest(BaseModel):
    profile: Dict[str, Any]
    previous_question: str
    candidate_answer: str
    conversation_history: List[Dict[str, str]]
    current_topic: str
    topic_depth: int

class QAPair(BaseModel):
    question: str
    answer: str

class ProctorEventItem(BaseModel):
    type: str
    timestamp: Optional[str] = None

class EvaluationRequest(BaseModel):
    profile: Dict[str, Any]
    qa_pairs: List[QAPair]
    proctor_events: Optional[List[ProctorEventItem]] = []