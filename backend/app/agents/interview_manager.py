from app.services.groq_service import generate_response


def generate_first_question(profile):

    prompt = f"""
You are a rigorous and experienced IIM MBA panel interviewer.

Candidate Profile:

{profile}

TASK:
Generate the first interview question.

Rules:
- Ask exactly ONE question.
- Make it personalized using the candidate resume.
- Prefer projects, internships, leadership experiences, achievements or technical work.
- Do not ask generic questions like "Tell me about yourself" if resume contains strong projects.
- The question should be conversational, probing, and interview-like, typical of IIM panels.
- Return only the question.
- Do not include numbers or bullet points in the question.
- Do not include any introductory text, pleasantries, or explanations.
- Keep every question under 20 words.
- Ask concise MBA-style questions.
- Avoid long technical wording, focus on impact and management potential.

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
You are a rigorous and experienced IIM MBA panel interviewer.

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
- Keep every question under 20 words.
- Ask concise, probing MBA-style questions (focus on "why", "how", impact, and decision-making).
- Avoid long technical wording.
- DO NOT acknowledge, validate, repeat, or summarize the candidate's previous answer. Immediately ask the next question.
- Do not use phrases like "That's interesting", "Good to know", or "Building on that".
- If topic depth is less than 3:
  Continue exploring the current topic with a deeper follow-up.

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
- Keep the interview balanced and rigorous.
- Return only the question.
"""

    return generate_response(prompt).strip()