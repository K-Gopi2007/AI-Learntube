from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.gemini_service import GeminiService
from typing import List

router = APIRouter()
gemini_service = GeminiService()

class ExamGenerateRequest(BaseModel):
    knowledge_gaps: List[str]

@router.post("/generate")
async def generate_exam(request: ExamGenerateRequest):
    if not request.knowledge_gaps:
        raise HTTPException(status_code=400, detail="knowledge_gaps list cannot be empty")
        
    try:
        exam_plan_data = gemini_service.generate_exam_plan(request.knowledge_gaps)
        return {
            "status": "success",
            "exam_plan": exam_plan_data["exam_plan"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate exam plan: {str(e)}")
