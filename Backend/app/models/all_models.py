from datetime import datetime
from typing import Optional, List, Any
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey, Float, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.models.base import Base

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    quiz_attempts: Mapped[List["QuizAttempt"]] = relationship("QuizAttempt", back_populates="user")
    knowledge_nodes: Mapped[List["KnowledgeNode"]] = relationship("KnowledgeNode", back_populates="user")
    learning_paths: Mapped[List["LearningPath"]] = relationship("LearningPath", back_populates="user")
    teach_backs: Mapped[List["TeachBackAttempt"]] = relationship("TeachBackAttempt", back_populates="user")
    chat_messages: Mapped[List["ChatMessage"]] = relationship("ChatMessage", back_populates="user")
    exam_kits: Mapped[List["ExamKit"]] = relationship("ExamKit", back_populates="user")
    study_sessions: Mapped[List["StudySession"]] = relationship("StudySession", back_populates="user")
    analytics: Mapped[List["LearningAnalytics"]] = relationship("LearningAnalytics", back_populates="user")
    video_progresses: Mapped[List["VideoProgress"]] = relationship("VideoProgress", back_populates="user")
    learning_history_logs: Mapped[List["LearningHistory"]] = relationship("LearningHistory", back_populates="user")

class Video(Base):
    __tablename__ = "videos"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    youtube_video_id: Mapped[str] = mapped_column(String, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    channel_name: Mapped[Optional[str]] = mapped_column(String)
    duration: Mapped[Optional[int]] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    transcripts: Mapped[List["Transcript"]] = relationship("Transcript", back_populates="video")
    notes: Mapped[List["Note"]] = relationship("Note", back_populates="video")
    flashcards: Mapped[List["Flashcard"]] = relationship("Flashcard", back_populates="video")
    quizzes: Mapped[List["Quiz"]] = relationship("Quiz", back_populates="video")
    chat_messages: Mapped[List["ChatMessage"]] = relationship("ChatMessage", back_populates="video")
    exam_kits: Mapped[List["ExamKit"]] = relationship("ExamKit", back_populates="video")

class Transcript(Base):
    __tablename__ = "transcripts"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    video_id: Mapped[int] = mapped_column(ForeignKey("videos.id"), nullable=False)
    full_text: Mapped[str] = mapped_column(Text, nullable=False)
    segments: Mapped[Any] = mapped_column(JSONB, nullable=False)
    language: Mapped[str] = mapped_column(String, default="en")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    video: Mapped["Video"] = relationship("Video", back_populates="transcripts")

class Note(Base):
    __tablename__ = "notes"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    video_id: Mapped[int] = mapped_column(ForeignKey("videos.id"), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp_seconds: Mapped[Optional[int]] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    video: Mapped["Video"] = relationship("Video", back_populates="notes")

class Flashcard(Base):
    __tablename__ = "flashcards"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    video_id: Mapped[int] = mapped_column(ForeignKey("videos.id"), nullable=False)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    topic: Mapped[Optional[str]] = mapped_column(String)
    difficulty: Mapped[Optional[str]] = mapped_column(String)
    source_timestamp: Mapped[Optional[int]] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    video: Mapped["Video"] = relationship("Video", back_populates="flashcards")

class Quiz(Base):
    __tablename__ = "quizzes"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    video_id: Mapped[int] = mapped_column(ForeignKey("videos.id"), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    video: Mapped["Video"] = relationship("Video", back_populates="quizzes")
    questions: Mapped[List["QuizQuestion"]] = relationship("QuizQuestion", back_populates="quiz")
    attempts: Mapped[List["QuizAttempt"]] = relationship("QuizAttempt", back_populates="quiz")

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    quiz_id: Mapped[int] = mapped_column(ForeignKey("quizzes.id"), nullable=False)
    topic: Mapped[Optional[str]] = mapped_column(String)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[Any] = mapped_column(JSONB, nullable=False)
    correct_answer: Mapped[str] = mapped_column(String, nullable=False)
    difficulty: Mapped[Optional[str]] = mapped_column(String)
    source_timestamp: Mapped[Optional[int]] = mapped_column(Integer)

    quiz: Mapped["Quiz"] = relationship("Quiz", back_populates="questions")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    quiz_id: Mapped[int] = mapped_column(ForeignKey("quizzes.id"), nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    total_questions: Mapped[int] = mapped_column(Integer, nullable=False)
    topic_scores: Mapped[Optional[Any]] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="quiz_attempts")
    quiz: Mapped["Quiz"] = relationship("Quiz", back_populates="attempts")

class KnowledgeNode(Base):
    __tablename__ = "knowledge_nodes"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    topic: Mapped[str] = mapped_column(String, nullable=False)
    mastery_score: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String, default="weak") # mastered, needs_practice, weak
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    last_updated: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship("User", back_populates="knowledge_nodes")

class LearningPath(Base):
    __tablename__ = "learning_paths"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user: Mapped["User"] = relationship("User", back_populates="learning_paths")
    items: Mapped[List["LearningPathItem"]] = relationship("LearningPathItem", back_populates="learning_path")

class LearningPathItem(Base):
    __tablename__ = "learning_path_items"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    learning_path_id: Mapped[int] = mapped_column(ForeignKey("learning_paths.id"), nullable=False)
    topic: Mapped[str] = mapped_column(String, nullable=False)
    action: Mapped[Optional[str]] = mapped_column(String)
    priority: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[str] = mapped_column(String, default="pending")
    reason: Mapped[Optional[str]] = mapped_column(Text)

    learning_path: Mapped["LearningPath"] = relationship("LearningPath", back_populates="items")

class TeachBackAttempt(Base):
    __tablename__ = "teach_back_attempts"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    topic: Mapped[str] = mapped_column(String, nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    overall_score: Mapped[float] = mapped_column(Float, nullable=False)
    evaluation_json: Mapped[Optional[Any]] = mapped_column(JSONB)
    knowledge_gaps: Mapped[Optional[Any]] = mapped_column(JSONB)
    strengths: Mapped[Optional[Any]] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="teach_backs")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    video_id: Mapped[int] = mapped_column(ForeignKey("videos.id"), nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False) # "user" or "assistant"
    content: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp_context: Mapped[Optional[float]] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="chat_messages")
    video: Mapped["Video"] = relationship("Video", back_populates="chat_messages")

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
