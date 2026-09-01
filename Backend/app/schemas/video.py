from typing import Optional, List, Any
from pydantic import BaseModel
from datetime import datetime

class VideoBase(BaseModel):
    youtube_video_id: str
    title: str
    channel_name: Optional[str] = None
    duration: Optional[int] = None

class VideoCreate(VideoBase):
    pass

class VideoInDB(VideoBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class TranscriptSegmentSchema(BaseModel):
    start_time: float
    duration: float
    text: str

class TranscriptResponse(BaseModel):
    video_id: str
    language: str
    segments: List[TranscriptSegmentSchema]
    full_text: str
    
    class Config:
        from_attributes = True

class VideoAnalysisRequest(BaseModel):
    pass # Empty for now, ID is in path

class NoteResponse(BaseModel):
    id: int
    title: Optional[str]
    content: str
    timestamp_seconds: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True
