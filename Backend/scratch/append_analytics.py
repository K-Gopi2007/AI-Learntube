code = """
class StudySession(Base):
    __tablename__ = "study_sessions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    video_id: Mapped[int] = mapped_column(ForeignKey("videos.id"), nullable=True)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    total_watch_time: Mapped[int] = mapped_column(Integer, default=0) # in seconds
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="study_sessions")
    video: Mapped["Video"] = relationship("Video")

class VideoProgress(Base):
    __tablename__ = "video_progress"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    video_id: Mapped[int] = mapped_column(ForeignKey("videos.id"), nullable=False)
    last_timestamp: Mapped[float] = mapped_column(Float, default=0.0)
    is_completed: Mapped[bool] = mapped_column(Integer, default=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship("User", back_populates="video_progresses")
    video: Mapped["Video"] = relationship("Video")

class LearningAnalytics(Base):
    __tablename__ = "learning_analytics"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    watch_time_seconds: Mapped[int] = mapped_column(Integer, default=0)
    notes_generated: Mapped[int] = mapped_column(Integer, default=0)
    flashcards_completed: Mapped[int] = mapped_column(Integer, default=0)
    quiz_attempts_count: Mapped[int] = mapped_column(Integer, default=0)
    teach_back_attempts_count: Mapped[int] = mapped_column(Integer, default=0)
    mastery_progression: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship("User", back_populates="analytics")
"""
with open("app/models/all_models.py", "a") as f:
    f.write(code)
