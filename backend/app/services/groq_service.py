from groq import Groq
import os
import dotenv
import json

dotenv.load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

MODEL = "llama-3.3-70b-versatile"


def generate_json_response(
    prompt: str,
    system_prompt: str
):

    response = generate_response(
        prompt=prompt,
        system_prompt=system_prompt
    )

    response = response.replace("```json", "")
    response = response.replace("```", "")
    response = response.strip()

    return json.loads(response)

def generate_response(
    prompt: str,
    system_prompt: str = "You are a helpful AI assistant.",
    temperature: float = 0.3
) -> str:

    try:

        completion = client.chat.completions.create(
            model=MODEL,
            temperature=temperature,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return completion.choices[0].message.content or ""

    except Exception as e:
        raise Exception(f"Groq Error: {str(e)}")