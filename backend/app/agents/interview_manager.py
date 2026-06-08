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

    return generate_response(prompt)


def generate_followup_question(profile , previous_question, candidate_answer):

    prompt = f"""
You are an experienced CAT MBA interviewer.

Candidate Profile:
{profile}

Previous Question Asked:
{previous_question} 

Candidate's Answer:
{candidate_answer}  

TASK:
Generate the best follow-up interview question.

Rules:
Rules:
- Ask exactly ONE question.
- Build naturally on the previous answer.
- Do not repeat or rephrase the previous question.
- Challenge vague statements and ask for specifics.
- Ask about decisions, trade-offs, impact, results, failures, or lessons learned.
- If a technical concept or project is mentioned, ask the candidate to explain it more deeply.
- Stay on the current topic unless the discussion has been sufficiently explored.
- Be conversational and interview-like.
- Return only the question.

"""

    return generate_response(prompt).strip()