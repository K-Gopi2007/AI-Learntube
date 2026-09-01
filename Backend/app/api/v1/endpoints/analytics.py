from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.all_models import User, StudySession, LearningAnalytics, KnowledgeNode

router = APIRouter()

@router.get("/dashboard")
def get_analytics_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Mastery Score
    nodes = db.query(KnowledgeNode).filter(KnowledgeNode.user_id == current_user.id).all()
    if nodes:
        mastery_score = sum(n.mastery_score for n in nodes) / len(nodes)
    else:
        mastery_score = 0.0
        
    # Learning Activity aggregations
    analytics = db.query(LearningAnalytics).filter(
        LearningAnalytics.user_id == current_user.id
    ).all()
    
    total_study_time = sum(a.watch_time_seconds for a in analytics)
    quiz_attempts = sum(a.quiz_attempts_count for a in analytics)
    teach_back_attempts = sum(a.teach_back_attempts_count for a in analytics)
    
    # Videos watched
    sessions = db.query(StudySession).filter(StudySession.user_id == current_user.id).all()
    videos_watched = len(set([s.video_id for s in sessions if s.video_id]))
        
    return {
        "study_time": total_study_time,
        "videos_watched": videos_watched,
        "quiz_attempts": quiz_attempts,
        "teach_back_attempts": teach_back_attempts,
        "mastery_score": mastery_score
    }
