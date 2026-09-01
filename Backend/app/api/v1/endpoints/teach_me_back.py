from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.all_models import KnowledgeNode, TeachBackAttempt, User, LearningPath, LearningPathItem
from app.services.gemini_service import GeminiService
from pydantic import BaseModel
from app.api.deps import get_current_user

router = APIRouter()
gemini_service = GeminiService()

class TeachMeBackRequest(BaseModel):
    topic: str
    explanation: str
    
@router.post("/evaluate")
def evaluate_explanation(request: TeachMeBackRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not request.explanation.strip():
        raise HTTPException(status_code=400, detail="No explanation provided.")
        
    try:
        feedback_data = gemini_service.evaluate_explanation(request.topic, request.explanation)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI evaluation is temporarily unavailable: {str(e)}")
        
    # Store attempt
    attempt = TeachBackAttempt(
        user_id=current_user.id,
        topic=request.topic,
        explanation=request.explanation,
        overall_score=feedback_data.get("overall_score", 0),
        evaluation_json=feedback_data.get("concepts", []),
        knowledge_gaps=feedback_data.get("knowledge_gaps", []),
        strengths=feedback_data.get("strengths", [])
    )
    db.add(attempt)
    
    # Update Knowledge Node
    # Example moving average weighting: Quiz might be worth more, but we'll do simple average
    # or 60% previous / 40% new teach back
    k_node = db.query(KnowledgeNode).filter(
        KnowledgeNode.user_id == current_user.id, 
        KnowledgeNode.topic == request.topic
    ).first()
    
    new_mastery = feedback_data.get("overall_score", 0)
    
    if not k_node:
        status = "weak"
        if new_mastery >= 80: status = "mastered"
        elif new_mastery >= 50: status = "needs_practice"
        
        k_node = KnowledgeNode(
            user_id=current_user.id,
            topic=request.topic,
            mastery_score=new_mastery,
            status=status,
            attempts=1
        )
        db.add(k_node)
    else:
        # Weighted update: 60% old, 40% new
        updated_mastery = (k_node.mastery_score * 0.6) + (new_mastery * 0.4)
        k_node.mastery_score = updated_mastery
        k_node.attempts += 1
        
        if updated_mastery >= 80:
            k_node.status = "mastered"
        elif updated_mastery >= 50:
            k_node.status = "needs_practice"
        else:
            k_node.status = "weak"
            
    db.commit()
    
    # Returning the result
    return {
        "topic": request.topic,
        "score": feedback_data.get("overall_score", 0),
        "concept_scores": feedback_data.get("concepts", []),
        "knowledge_gaps": feedback_data.get("knowledge_gaps", []),
        "strengths": feedback_data.get("strengths", []),
        "feedback": feedback_data.get("recommendation", ""),
        "recommended_action": "Review weak concepts",
        "updated_mastery": k_node.mastery_score,
        "learning_path_updated": True
    }
