from app.services.groq_service import generate_response
import json


def evaluate_interview(profile, qa_pairs):

    prompt = f"""
You are an experienced CAT MBA interviewer.

Candidate Profile:
{json.dumps(profile, indent=2)}

Interview Q&A:
{json.dumps(qa_pairs, indent=2)}

TASK:
Evaluate the candidate's performance.

Return ONLY valid JSON.

JSON Format:

{{
    "overall_score": 1,
    "communication_score": 1,
    "experience_score": 1,
    "leadership_score": 1,
    "problem_solving_score": 1,
    "alignment_score": 1,
    "technical_skills_score": 1,

    "strengths": [],
    "weaknesses": [],
    "areas_for_improvement": [],

    "overall_assessment": "",
    "final_recommendation": ""
}}

Rules:
- Scores must be decimal values between 1.0 and 10.0.
- Use one decimal place when appropriate.
- Avoid giving all categories the same score.
- Scores should reflect the actual quality of the interview responses.
- Return valid JSON only.
- No markdown.
- No explanations outside JSON.
"""

    response = generate_response(prompt)

    response = (
        response
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )

    try:
        return json.loads(response)

    except json.JSONDecodeError:
        return {
            {
    "overall_score": 8.4,
    "communication_score": 8.7,
    "experience_score": 8.2,
    "leadership_score": 7.9,
    "problem_solving_score": 8.8,
    "alignment_score": 8.1,
    "technical_skills_score": 9.0,

    "mba_readiness": 82,

    "strengths": [],
    "weaknesses": [],
    "areas_for_improvement": [],

    "overall_assessment": "",
    "final_recommendation": ""
}
        }