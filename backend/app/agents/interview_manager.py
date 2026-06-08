from app.services.groq_service import generate_response


def generate_first_question(profile):

    prompt = f"""
You are an experienced CAT MBA interviewer.

Candidate Profile:

{profile}

TASK:
Generate the first interview question.

Rules:
- Ask exactly ONE question.
- Make it personalized using the candidate resume.
- Prefer projects, internships, leadership experiences, achievements or technical work.
- Do not ask generic questions like "Tell me about yourself" if resume contains strong projects.
- The question should be conversational and interview-like, not too formal or robotic.
- Return only the question.
- Do not include numbers or bullet points in the question.
- Do not include any introductory text or explanations.

Example:
Can you tell me more about your experience leading the marketing campaign for XYZ product during your internship at ABC company?
"""

    return generate_response(prompt).strip()