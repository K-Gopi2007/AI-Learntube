from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.all_models import User, Video, ChatMessage, Transcript
from app.services.gemini_service import GeminiService
import logging

logger = logging.getLogger("learntube_ai.chat")

router = APIRouter()
gemini_service = GeminiService()

class ChatRequest(BaseModel):
    question: str
    timestamp: Optional[float] = None

class ExplainRequest(BaseModel):
    timestamp: float

class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    timestamp_context: Optional[float] = None

@router.post("/{youtube_video_id}/ask")
def ask_ai(
    youtube_video_id: str,
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    video = db.query(Video).filter(Video.youtube_video_id == youtube_video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    transcript = db.query(Transcript).filter(Transcript.video_id == video.id).first()
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found for this video")

    # Fetch previous chat history
    history = db.query(ChatMessage).filter(
        ChatMessage.video_id == video.id,
        ChatMessage.user_id == current_user.id
    ).order_by(ChatMessage.created_at.asc()).all()
    
    chat_history_dicts = [{"role": msg.role, "content": msg.content} for msg in history[-10:]] # limit to last 10
    
    # Save user message
    user_msg = ChatMessage(
        user_id=current_user.id,
        video_id=video.id,
        role="user",
        content=request.question,
        timestamp_context=request.timestamp
    )
    db.add(user_msg)
    db.commit()
    
    # Generate response
    try:
        response_data = gemini_service.ask_ai_with_context(
            question=request.question,
            transcript_text=transcript.full_text,
            chat_history=chat_history_dicts,
            timestamp=request.timestamp
        )
        ai_text = response_data.get("response", "I could not generate a response.")
    except Exception as e:
        logger.error(f"Error in ask_ai: {e}")
        ai_text = "Sorry, there was an error processing your request."
        
    # Save assistant message
    assistant_msg = ChatMessage(
        user_id=current_user.id,
        video_id=video.id,
        role="assistant",
        content=ai_text,
        timestamp_context=request.timestamp
    )
    db.add(assistant_msg)
    db.commit()
    
    return {
        "response": ai_text
    }

@router.post("/{youtube_video_id}/explain")
def explain_moment(
    youtube_video_id: str,
    request: ExplainRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    video = db.query(Video).filter(Video.youtube_video_id == youtube_video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    transcript = db.query(Transcript).filter(Transcript.video_id == video.id).first()
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found for this video")

    # Extract context window around timestamp (e.g. +/- 30 seconds)
    context_text = ""
    for segment in transcript.segments:
        start = segment.get("start_time", 0)
        end = start + segment.get("duration", 0)
        
        # If segment overlaps with [timestamp - 30, timestamp + 30]
        if start <= request.timestamp + 30 and end >= request.timestamp - 30:
            context_text += f"[{start}s] {segment.get('text', '')}\n"

    if not context_text:
        context_text = transcript.full_text[:5000] # Fallback
        
    try:
        response_data = gemini_service.explain_moment(
            transcript_context=context_text,
            timestamp=request.timestamp
        )
        ai_text = response_data.get("explanation", "I could not generate an explanation.")
    except Exception as e:
        logger.error(f"Error in explain_moment: {e}")
        ai_text = "Sorry, there was an error generating the explanation."
        
    # We also save this as a chat interaction
    user_msg = ChatMessage(
        user_id=current_user.id,
        video_id=video.id,
        role="user",
        content=f"Explain what is happening at {request.timestamp}s",
        timestamp_context=request.timestamp
    )
    assistant_msg = ChatMessage(
        user_id=current_user.id,
        video_id=video.id,
        role="assistant",
        content=ai_text,
        timestamp_context=request.timestamp
    )
    db.add(user_msg)
    db.add(assistant_msg)
    db.commit()
    
    return {
        "explanation": ai_text
    }

@router.get("/{youtube_video_id}/history", response_model=List[ChatMessageResponse])
def get_chat_history(
    youtube_video_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    video = db.query(Video).filter(Video.youtube_video_id == youtube_video_id).first()
    if not video:
        return []
        
    history = db.query(ChatMessage).filter(
        ChatMessage.video_id == video.id,
        ChatMessage.user_id == current_user.id
    ).order_by(ChatMessage.created_at.asc()).all()
    
    return history
