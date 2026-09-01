from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.api.deps import get_db, get_current_user
from app.models.all_models import User, VideoProgress, LearningHistory, Video
from pydantic import BaseModel

router = APIRouter()

class UpdateHistoryRequest(BaseModel):
    video_id: str
    last_timestamp: float
    duration: float = 0.0

@router.get("")
def get_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Returns recently watched videos
    progresses = db.query(VideoProgress).filter(VideoProgress.user_id == current_user.id).order_by(desc(VideoProgress.last_opened)).limit(20).all()
    
    result = []
    for p in progresses:
        if p.video:
            result.append({
                "video_id": p.video.youtube_video_id,
                "video_title": p.video.title,
                "last_timestamp": p.last_timestamp,
                "completion_percentage": p.completion_percentage,
                "last_activity": p.last_activity,
                "last_opened": p.last_opened
            })
    return result

@router.get("/resume")
def get_resume(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    p = db.query(VideoProgress).filter(VideoProgress.user_id == current_user.id).order_by(desc(VideoProgress.last_opened)).first()
    if not p or not p.video:
        return {"continue_learning": None}
    
    return {
        "continue_learning": {
            "video_id": p.video.youtube_video_id,
            "title": p.video.title,
            "last_timestamp": p.last_timestamp,
            "completion_percentage": p.completion_percentage
        }
    }

@router.post("/update")
def update_history(req: UpdateHistoryRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    video = db.query(Video).filter(Video.youtube_video_id == req.video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    prog = db.query(VideoProgress).filter(
        VideoProgress.user_id == current_user.id,
        VideoProgress.video_id == video.id
    ).first()
    
    completion_percentage = 0.0
    if req.duration > 0:
        completion_percentage = min(100.0, (req.last_timestamp / req.duration) * 100)
    
    if not prog:
        prog = VideoProgress(
            user_id=current_user.id,
            video_id=video.id,
            last_timestamp=req.last_timestamp,
            completion_percentage=completion_percentage
        )
        db.add(prog)
    else:
        prog.last_timestamp = req.last_timestamp
        if req.duration > 0:
            prog.completion_percentage = completion_percentage
        from datetime import datetime
        import pytz
        prog.last_activity = datetime.now(pytz.utc)
        prog.last_opened = datetime.now(pytz.utc)
        
    hist = LearningHistory(
        user_id=current_user.id,
        video_id=video.id,
        action_type="watch"
    )
    db.add(hist)
    
    db.commit()
    return {"status": "success"}
