from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.gemini_service import GeminiService
from app.models.all_models import Note

router = APIRouter()
gemini_service = GeminiService()

class NotesGenerateRequest(BaseModel):
    transcript: str
    video_id: int
    user_id: int

@router.post("/generate")
async def generate_notes(request: NotesGenerateRequest, db: AsyncSession = Depends(get_db)):
    try:
        # Generate structured notes
        notes_data = gemini_service.generate_notes(request.transcript)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate notes: {str(e)}")
        
    # Store notes in PostgreSQL
    new_content = Content(
        video_id=request.video_id,
        user_id=request.user_id,
        content_type="notes",
        data=notes_data
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
        "notes": notes_data
    }
