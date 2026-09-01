from fastapi import APIRouter
from pydantic import BaseModel
from app.services.gemini_service import GeminiService

router = APIRouter()
gemini_service = GeminiService()

class KnowledgeGapRequest(BaseModel):
    user_explanations: list[str]
    test_scores: list[int]
    context_topics: str

@router.post("/")
async def analyze_knowledge_gaps(request: KnowledgeGapRequest):
    gaps_data = gemini_service.analyze_knowledge_gaps(
        request.user_explanations, 
        request.test_scores, 
        request.context_topics
    )
    return {"status": "success", "gaps": gaps_data["gaps"]}
