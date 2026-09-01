from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class ContentBase(BaseModel):
    video_id: int
    content_type: str
    data: Dict[str, Any]

class ContentCreate(ContentBase):
    pass

class ContentInDBBase(ContentBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Content(ContentInDBBase):
    pass

class KnowledgeGapBase(BaseModel):
    topic: str
    description: str

class KnowledgeGapCreate(KnowledgeGapBase):
    pass

class KnowledgeGap(KnowledgeGapBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class LearningPathBase(BaseModel):
    topic: str
    steps: List[Dict[str, Any]]

class LearningPathCreate(LearningPathBase):
    pass

class LearningPath(LearningPathBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
