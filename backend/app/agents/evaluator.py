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
- Scores must be integers from 1 to 10.
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
            "overall_score": 0,
            "communication_score": 0,
            "experience_score": 0,
            "leadership_score": 0,
            "problem_solving_score": 0,
            "alignment_score": 0,
            "technical_skills_score": 0,
            "strengths": [],
            "weaknesses": [],
            "areas_for_improvement": [],
            "overall_assessment": "Evaluation failed.",
            "final_recommendation": "Unable to evaluate"
        }