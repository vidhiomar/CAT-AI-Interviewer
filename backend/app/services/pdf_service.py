import fitz
import re


def extract_text_from_pdf(pdf_path: str) -> str:
    text = ""

    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text() + "\n"

    text = re.sub(r"\n{2,}", "\n", text)

    return text.strip()