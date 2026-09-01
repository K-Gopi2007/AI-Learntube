from fastapi import APIRouter

from app.api.v1.endpoints import (
    health, users, videos, notes, flashcards, 
    quizzes, assessments, knowledge_gaps, 
    learning_paths, teach_me_back, exams, adaptive, knowledge_map, auth, chat, exam_kit, analytics, history
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(videos.router, prefix="/videos", tags=["videos"])
api_router.include_router(notes.router, prefix="/notes", tags=["notes"])
api_router.include_router(flashcards.router, prefix="/flashcards", tags=["flashcards"])
api_router.include_router(quizzes.router, prefix="/quizzes", tags=["quizzes"])
api_router.include_router(assessments.router, prefix="/assessments", tags=["assessments"])
api_router.include_router(knowledge_gaps.router, prefix="/knowledge-gaps", tags=["knowledge_gaps"])
api_router.include_router(learning_paths.router, prefix="/learning-paths", tags=["learning_paths"])
api_router.include_router(teach_me_back.router, prefix="/teach", tags=["teach"])
api_router.include_router(exams.router, prefix="/exams", tags=["exams"])
api_router.include_router(adaptive.router, prefix="/adaptive", tags=["adaptive"])
api_router.include_router(knowledge_map.router, prefix="/knowledge-map", tags=["knowledge_map"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(exam_kit.router, prefix="/exam-kit", tags=["exam_kit"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(history.router, prefix="/history", tags=["history"])
