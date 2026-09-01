code = """
class ExamKit(Base):
    __tablename__ = "exam_kits"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    video_id: Mapped[int] = mapped_column(ForeignKey("videos.id"), nullable=False)
    
    # JSON fields
    revision_notes: Mapped[dict] = mapped_column(JSON, nullable=False)
    important_questions: Mapped[list] = mapped_column(JSON, nullable=False)
    weak_topic_revision: Mapped[dict] = mapped_column(JSON, nullable=False)
    final_mock_exam: Mapped[list] = mapped_column(JSON, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    user: Mapped["User"] = relationship("User", back_populates="exam_kits")
    video: Mapped["Video"] = relationship("Video", back_populates="exam_kits")
"""
with open("app/models/all_models.py", "a") as f:
    f.write(code)
