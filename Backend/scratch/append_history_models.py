from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from sqlalchemy.sql import func

def add_to_models():
    with open('app/models/all_models.py', 'r') as f:
        content = f.read()

    # Add relationships to User
    if 'video_progresses: Mapped[List["VideoProgress"]]' not in content:
        content = content.replace(
            'analytics: Mapped[List["LearningAnalytics"]] = relationship("LearningAnalytics", back_populates="user")',
            'analytics: Mapped[List["LearningAnalytics"]] = relationship("LearningAnalytics", back_populates="user")\n    video_progresses: Mapped[List["VideoProgress"]] = relationship("VideoProgress", back_populates="user")\n    learning_history_logs: Mapped[List["LearningHistory"]] = relationship("LearningHistory", back_populates="user")'
        )

    if 'class VideoProgress' not in content:
        content += '''
class VideoProgress(Base):
    __tablename__ = "video_progress"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    video_id: Mapped[int] = mapped_column(ForeignKey("videos.id"), nullable=False)
    
    last_timestamp: Mapped[float] = mapped_column(Float, default=0.0)
    completion_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    
    last_activity: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_opened: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="video_progresses")
    video: Mapped["Video"] = relationship("Video")

class LearningHistory(Base):
    __tablename__ = "learning_history"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    video_id: Mapped[int] = mapped_column(ForeignKey("videos.id"), nullable=False)
    
    action_type: Mapped[str] = mapped_column(String, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    user: Mapped["User"] = relationship("User", back_populates="learning_history_logs")
    video: Mapped["Video"] = relationship("Video")
'''
    with open('app/models/all_models.py', 'w') as f:
        f.write(content)

if __name__ == "__main__":
    add_to_models()
