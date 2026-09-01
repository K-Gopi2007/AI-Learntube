from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.all_models import User, Video, ExamKit, Transcript, QuizAttempt, KnowledgeNode
from app.services.gemini_service import GeminiService

router = APIRouter()
gemini_service = GeminiService()

@router.get("/{youtube_video_id}")
def get_exam_kit(
    youtube_video_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    video = db.query(Video).filter(Video.youtube_video_id == youtube_video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    exam_kit = db.query(ExamKit).filter(
        ExamKit.video_id == video.id,
        ExamKit.user_id == current_user.id
    ).order_by(ExamKit.created_at.desc()).first()
    
    if not exam_kit:
        raise HTTPException(status_code=404, detail="Exam kit not found. Generate one first.")
        
    return {
        "id": exam_kit.id,
        "revision_notes": exam_kit.revision_notes,
        "important_questions": exam_kit.important_questions,
        "weak_topic_revision": exam_kit.weak_topic_revision,
        "final_mock_exam": exam_kit.final_mock_exam,
        "created_at": exam_kit.created_at
    }

@router.post("/{youtube_video_id}/generate")
def generate_exam_kit(
    youtube_video_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    video = db.query(Video).filter(Video.youtube_video_id == youtube_video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    transcript = db.query(Transcript).filter(Transcript.video_id == video.id).first()
    if not transcript:
        raise HTTPException(status_code=400, detail="Transcript required to generate exam kit")
        
    # Get user's weak topics from KnowledgeNodes
    weak_nodes = db.query(KnowledgeNode).filter(
        KnowledgeNode.user_id == current_user.id,
        KnowledgeNode.status == "weak"
    ).all()
    weak_topics = [n.topic for n in weak_nodes]
    
    # Get recent test scores for this video
    quiz_attempts = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id
    ).order_by(QuizAttempt.created_at.desc()).limit(5).all()
    test_scores = [q.score for q in quiz_attempts]
    
    try:
        exam_kit_data = gemini_service.generate_exam_kit(
            transcript.full_text,
            weak_topics,
            test_scores
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    new_exam_kit = ExamKit(
        user_id=current_user.id,
        video_id=video.id,
        revision_notes=exam_kit_data["revision_notes"],
        important_questions=exam_kit_data["important_questions"],
        weak_topic_revision=exam_kit_data["weak_topic_revision"],
        final_mock_exam=exam_kit_data["final_mock_exam"]
    )
    db.add(new_exam_kit)
    db.commit()
    db.refresh(new_exam_kit)
    
    return {
        "id": new_exam_kit.id,
        "revision_notes": new_exam_kit.revision_notes,
        "important_questions": new_exam_kit.important_questions,
        "weak_topic_revision": new_exam_kit.weak_topic_revision,
        "final_mock_exam": new_exam_kit.final_mock_exam,
        "created_at": new_exam_kit.created_at
    }
