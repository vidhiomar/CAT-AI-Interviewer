from pydantic import BaseModel
from typing import Any

class StartInterviewRequest(BaseModel):
    profile: dict[str, Any]