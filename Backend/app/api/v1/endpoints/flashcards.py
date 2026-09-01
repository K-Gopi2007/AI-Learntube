from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.gemini_service import GeminiService
from app.models.all_models import Flashcard

router = APIRouter()
gemini_service = GeminiService()

class FlashcardsGenerateRequest(BaseModel):
    transcript: str
    video_id: int
    user_id: int

@router.post("/generate")
async def generate_flashcards(request: FlashcardsGenerateRequest, db: AsyncSession = Depends(get_db)):
    try:
        # Generate structured flashcards from transcript
        flashcards_data = gemini_service.generate_flashcards(request.transcript)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate flashcards: {str(e)}")
        
    # Store flashcards in PostgreSQL
    new_content = Content(
        video_id=request.video_id,
        user_id=request.user_id,
        content_type="flashcards",
        data=flashcards_data
    )
    
    try:
        db.add(new_content)
        await db.commit()
        await db.refresh(new_content)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        
    return {
        "status": "success", 
        "content_id": new_content.id,
        "flashcards": flashcards_data["flashcards"]
    }
