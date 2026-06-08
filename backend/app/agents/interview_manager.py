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


def generate_followup_question(
    profile,
    previous_question,
    candidate_answer,
    conversation_history,
    current_topic,
    topic_depth):
    
    switch_topic = False

    if topic_depth >= 3:
        switch_topic = True

    prompt = f"""
You are an experienced CAT MBA interviewer.

Candidate Profile:
{profile}

Conversation History:
{conversation_history}

Current Topic:
{current_topic}

Topic Depth:
{topic_depth}

Previous Question:
{previous_question}

Candidate Answer:
{candidate_answer}

TASK:
Generate the next interview question.

Rules:

- Ask exactly ONE question.

- If topic depth is less than 3:
  Continue exploring the current topic.

- If topic depth is 3 or more:
  Move naturally to another important area of the resume.

Possible new areas:
- Another project
- Internship
- Leadership
- Achievement
- Teamwork
- MBA goals

- Do not repeatedly ask about the same technical detail.
- Keep the interview balanced.
- Return only the question.
"""

    return generate_response(prompt).strip()