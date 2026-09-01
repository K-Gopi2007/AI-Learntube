from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.gemini_service import GeminiService
# Removed Content
from typing import List

router = APIRouter()
gemini_service = GeminiService()

class TopicResult(BaseModel):
    topic: str
    correct: int
    attempted: int

class AdaptivePathRequest(BaseModel):
    user_id: int
    quiz_results: List[TopicResult]

@router.post("/path")
async def generate_adaptive_path(request: AdaptivePathRequest, db: AsyncSession = Depends(get_db)):
    # 1. Calculate mastery
    performance = []
    weak_topics = []
    
    for result in request.quiz_results:
        if result.attempted == 0:
            continue
        mastery = (result.correct / result.attempted) * 100
        
        status = ""
        if mastery >= 80:
            status = "Mastered"
        elif mastery >= 50:
            status = "Needs Practice"
        else:
            status = "Weak"
            weak_topics.append(result.topic)
            
        performance.append(f"{result.topic}: {mastery:.1f}% ({status})")
        
    performance_summary = "\n".join(performance)
    
    # 2. Generate Adaptive Path via Gemini
    try:
        adaptive_data = gemini_service.generate_adaptive_path(performance_summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate adaptive path: {str(e)}")
        
    # 3. Store in DB (Optional, but good practice. We use video_id=None if not tied to a video, 
    # but Content model requires video_id currently. We might need to bypass it or use LearningPath model)
    # We will just return it directly since LearningPath requires a topic and steps.
    # We can use the existing LearningPath model if needed, but for now we return the JSON.
    
    return {
        "status": "success",
        "performance_summary": performance,
        "adaptive_plan": adaptive_data
    }
