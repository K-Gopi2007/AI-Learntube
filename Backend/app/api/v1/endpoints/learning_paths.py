from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.all_models import KnowledgeNode, LearningPath, LearningPathItem, User
from pydantic import BaseModel

router = APIRouter()

# Simple prerequisite relationship system
PREREQUISITES = {
    "Linked Lists": ["Arrays"],
    "Stacks": ["Arrays", "Linked Lists"],
    "Queues": ["Arrays", "Linked Lists"],
    "Trees": ["Linked Lists"],
    "Binary Trees": ["Trees"],
    "BST": ["Binary Trees"],
    "AVL": ["BST"],
    "Graphs": ["Trees"],
    "Graph Fundamentals": ["Graphs"],
    "BFS": ["Graph Fundamentals", "Queues"],
    "DFS": ["Graph Fundamentals", "Stacks"],
    "Tree Fundamentals": ["Trees"],
    "Tree Practice": ["BST", "Binary Trees"]
}

class PathItemResponse(BaseModel):
    topic: str
    action: str
    reason: str | None
    priority: int

class LearningPathResponse(BaseModel):
    current_mastery: dict[str, float]
    weak_topics: list[str]
    needs_practice_topics: list[str]
    mastered_topics: list[str]
    next_recommendation: PathItemResponse | None
    path: list[PathItemResponse]

from app.api.deps import get_current_user

@router.get("", response_model=LearningPathResponse)
@router.get("/", response_model=LearningPathResponse)
def get_learning_path(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_id = current_user.id
        
    nodes = db.query(KnowledgeNode).filter(KnowledgeNode.user_id == user_id).all()
    
    current_mastery = {}
    weak_topics = []
    needs_practice_topics = []
    mastered_topics = []
    
    for node in nodes:
        current_mastery[node.topic] = node.mastery_score
        if node.mastery_score < 50:
            weak_topics.append(node)
        elif node.mastery_score < 80:
            needs_practice_topics.append(node)
        else:
            mastered_topics.append(node)
            
    # Sort weak topics by lowest mastery
    weak_topics.sort(key=lambda x: x.mastery_score)
    needs_practice_topics.sort(key=lambda x: x.mastery_score)
    
    generated_path = []
    priority = 1
    added_topics = set()
    
    # Process weak topics
    for node in weak_topics:
        topic = node.topic
        if topic in added_topics:
            continue
            
        # Check prerequisites
        if topic in PREREQUISITES:
            for prereq in PREREQUISITES[topic]:
                prereq_mastery = current_mastery.get(prereq, 0)
                if prereq_mastery < 80 and prereq not in added_topics:
                    generated_path.append({
                        "topic": prereq,
                        "action": "REMEDIATION" if prereq_mastery < 50 else "PRACTICE",
                        "reason": f"Prerequisite for {topic} (Mastery: {prereq_mastery:.0f}%)",
                        "priority": priority
                    })
                    priority += 1
                    added_topics.add(prereq)
                    
        generated_path.append({
            "topic": topic,
            "action": "REMEDIATION",
            "reason": f"{topic} mastery is {node.mastery_score:.0f}%",
            "priority": priority
        })
        priority += 1
        added_topics.add(topic)
        
    # Process needs practice topics
    for node in needs_practice_topics:
        topic = node.topic
        if topic in added_topics:
            continue
        generated_path.append({
            "topic": topic,
            "action": "PRACTICE",
            "reason": f"{topic} needs practice ({node.mastery_score:.0f}%)",
            "priority": priority
        })
        priority += 1
        added_topics.add(topic)
        
    # Process mastered topics for advancing
    for node in mastered_topics:
        topic = node.topic
        if topic in added_topics:
            continue
        generated_path.append({
            "topic": topic,
            "action": "ADVANCE",
            "reason": f"{topic} is mastered ({node.mastery_score:.0f}%)",
            "priority": priority
        })
        priority += 1
        added_topics.add(topic)
        
    # If no data exists, suggest a starting point
    if not generated_path:
        generated_path.append({
            "topic": "Arrays",
            "action": "LEARN",
            "reason": "Start your learning journey",
            "priority": priority
        })
        
    # Save to DB
    old_paths = db.query(LearningPath).filter(LearningPath.user_id == user_id).all()
    for op in old_paths:
        for item in op.items:
            db.delete(item)
        db.delete(op)
    db.commit()
    
    new_path = LearningPath(user_id=user_id)
    db.add(new_path)
    db.flush()
    
    for item in generated_path:
        path_item = LearningPathItem(
            learning_path_id=new_path.id,
            topic=item["topic"],
            action=item["action"],
            reason=item["reason"],
            priority=item["priority"]
        )
        db.add(path_item)
    db.commit()
    
    return {
        "current_mastery": current_mastery,
        "weak_topics": [n.topic for n in weak_topics],
        "needs_practice_topics": [n.topic for n in needs_practice_topics],
        "mastered_topics": [n.topic for n in mastered_topics],
        "next_recommendation": generated_path[0] if generated_path else None,
        "path": generated_path
    }
