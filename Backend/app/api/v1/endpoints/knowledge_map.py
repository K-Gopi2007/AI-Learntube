from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.all_models import KnowledgeNode, User
from app.api.deps import get_current_user

router = APIRouter()

@router.get("")
@router.get("/")
def get_knowledge_map(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    nodes = db.query(KnowledgeNode).filter(KnowledgeNode.user_id == current_user.id).all()
    
    node_data = []
    for n in nodes:
        node_data.append({
            "topic": n.topic,
            "mastery": n.mastery_score,
            "status": n.status
        })
            
    return {
        "status": "success",
        "user_id": current_user.id,
        "knowledge_map": node_data
    }
