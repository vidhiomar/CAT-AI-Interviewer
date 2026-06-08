from fastapi import APIRouter, UploadFile, File, HTTPException
import tempfile
import os
from app.services.pdf_service import extract_text_from_pdf
from app.agents.resume_analyzer import analyze_resume
from app.agents.interview_manager import generate_first_question

router = APIRouter()


@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...)
):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf"
        ) as temp:
            temp.write(await file.read())
            temp_path = temp.name

        resume_text = extract_text_from_pdf(temp_path)

        if not resume_text or not resume_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from PDF"
            )

        profile = analyze_resume(resume_text)

        first_question = generate_first_question(profile)

        return {
            "success": True,
            "profile": profile,
            "first_question": first_question
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Resume processing failed: {str(e)}"
        )

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)