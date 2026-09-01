from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.all_models import User, Quiz, QuizQuestion, QuizAttempt, KnowledgeNode
from datetime import datetime

router = APIRouter()

class AnswerItem(BaseModel):
    question_id: int
    selected_answer: str

class QuizSubmitRequest(BaseModel):
    answers: list[AnswerItem]

@router.post("/{quiz_id}/submit")
def submit_quiz(quiz_id: int, request: QuizSubmitRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
        
    questions = {q.id: q for q in quiz.questions}
    
    total = len(quiz.questions)
    if total == 0:
        raise HTTPException(status_code=400, detail="Quiz has no questions")

    correct_count = 0
    topic_stats = {} # topic: {"correct": int, "total": int}
    
    for ans in request.answers:
        q = questions.get(ans.question_id)
        if not q:
            continue
            
        topic = q.topic or "General"
        if topic not in topic_stats:
            topic_stats[topic] = {"correct": 0, "total": 0}
            
        topic_stats[topic]["total"] += 1
        
        # Check answer
        if q.correct_answer.strip() == ans.selected_answer.strip():
            correct_count += 1
            topic_stats[topic]["correct"] += 1
            
    # Calculate scores
    percentage = (correct_count / total) * 100 if total > 0 else 0
    
    topic_scores = {}
    weak_topics = []
    mastered_topics = []
    
    user_id = current_user.id
    
    for topic, stats in topic_stats.items():
        if stats["total"] > 0:
            mastery = (stats["correct"] / stats["total"]) * 100
        else:
            mastery = 0
            
        topic_scores[topic] = mastery
        
        status = "weak"
        if mastery >= 80:
            status = "mastered"
            mastered_topics.append(topic)
        elif mastery >= 50:
            status = "needs_practice"
        else:
            weak_topics.append(topic)
            
        # Update or create KnowledgeNode
        k_node = db.query(KnowledgeNode).filter(
            KnowledgeNode.user_id == user_id, 
            KnowledgeNode.topic == topic
        ).first()
        
        if not k_node:
            k_node = KnowledgeNode(
                user_id=user_id,
                topic=topic,
                mastery_score=mastery,
                status=status,
                attempts=1
            )
            db.add(k_node)
        else:
            # Simple moving average for prototype
            k_node.mastery_score = (k_node.mastery_score * k_node.attempts + mastery) / (k_node.attempts + 1)
            k_node.attempts += 1
            if k_node.mastery_score >= 80:
                k_node.status = "mastered"
            elif k_node.mastery_score >= 50:
                k_node.status = "needs_practice"
            else:
                k_node.status = "weak"
                
    # Save Attempt
    attempt = QuizAttempt(
        user_id=user_id,
        quiz_id=quiz.id,
        score=correct_count,
        total_questions=total,
        topic_scores=topic_scores
    )
    db.add(attempt)
    db.commit()
    
    return {
        "score": correct_count,
        "total": total,
        "percentage": percentage,
        "topic_scores": topic_scores,
        "weak_topics": weak_topics,
        "mastered_topics": mastered_topics
    }
