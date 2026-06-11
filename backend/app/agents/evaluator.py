from app.services.groq_service import generate_response
import json


def evaluate_interview(profile, qa_pairs, proctor_events=None):

    proctor_section = ""
    if proctor_events:
        proctor_section = f"""

Proctoring Log:
{json.dumps(proctor_events, indent=2)}

IMPORTANT: The proctoring log above records integrity violations during the interview.
Types:
- TAB_SWITCH: Candidate switched browser tabs
- WINDOW_BLUR: Candidate switched to another application
- FULLSCREEN_EXIT: Candidate exited fullscreen mode
- FACE_MISSING: No face detected for >5 seconds
- MULTIPLE_FACES: More than one person visible
- LOOKING_AWAY: Candidate's head turned away significantly

Factor these violations into the integrity_score and proctoring_summary.
"""

    prompt = f"""
You are an experienced CAT MBA interviewer and exam proctor.

Candidate Profile:
{json.dumps(profile, indent=2)}

Interview Q&A:
{json.dumps(qa_pairs, indent=2)}
{proctor_section}
TASK:
Evaluate the candidate's performance and interview integrity.

Return ONLY valid JSON.

JSON Format:

{{
    "overall_score": 8.4,

    "mba_readiness": 82,

    "communication_score": 8.7,
    "experience_score": 8.2,
    "leadership_score": 7.9,
    "problem_solving_score": 8.8,
    "alignment_score": 8.1,
    "technical_skills_score": 9.0,

    "integrity_score": 95,
    "proctoring_summary": "No violations detected. Candidate maintained focus throughout.",

    "strengths": [],
    "weaknesses": [],
    "areas_for_improvement": [],

    "overall_assessment": "",
    "final_recommendation": ""
}}

Rules:
- Scores must be decimal values between 1.0 and 10.0.
- Use one decimal place when appropriate.
- MBA Readiness must be an integer between 0 and 100.
- integrity_score is an integer 0-100 (100 = perfectly clean, deduct for each violation).
- proctoring_summary is a 1-2 sentence human-readable summary of integrity findings.
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
            "overall_score": 0,
            "mba_readiness": 0,

            "communication_score": 0,
            "experience_score": 0,
            "leadership_score": 0,
            "problem_solving_score": 0,
            "alignment_score": 0,
            "technical_skills_score": 0,

            "integrity_score": 0,
            "proctoring_summary": "Evaluation failed.",

            "strengths": [],
            "weaknesses": [],
            "areas_for_improvement": [],

            "overall_assessment": "Evaluation failed.",
            "final_recommendation": "Unable to evaluate"
        }