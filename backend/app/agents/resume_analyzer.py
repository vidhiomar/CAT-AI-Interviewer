import json

from app.services.groq_service import generate_response


def analyze_resume(resume_text):

    prompt = f"""
You are a resume parser.

Extract:
- education
- skills
- projects
- internships
- achievements

Return ONLY valid JSON.

Resume:
{resume_text}
"""

    response = generate_response(prompt)

    response = response.replace("```json", "")
    response = response.replace("```", "")
    response = response.strip()

    try:
        profile = json.loads(response)
        return profile

    except json.JSONDecodeError:
        return {
            "education": [],
            "skills": [],
            "projects": [],
            "internships": [],
            "achievements": []
        }