from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.all_models import Video, Transcript, Note, Flashcard, Quiz, QuizQuestion
from app.schemas.video import VideoInDB, TranscriptResponse, NoteResponse
from pydantic import BaseModel

class QuizQuestionResponse(BaseModel):
    id: int
    question: str
    options: list[str]
    correct_answer: str
    topic: str | None = None
    difficulty: str | None = None
    source_timestamp: int | None = None

    class Config:
        from_attributes = True

class QuizResponse(BaseModel):
    id: int
    title: str | None = None
    questions: list[QuizQuestionResponse]

    class Config:
        from_attributes = True

class FlashcardResponse(BaseModel):
    id: int
    question: str
    answer: str
    topic: str | None = None
    difficulty: str | None = None
    source_timestamp: int | None = None

    class Config:
        from_attributes = True

from app.services.transcript_service import TranscriptService, TranscriptUnavailableError
from app.services.gemini_service import GeminiService

router = APIRouter()
gemini_service = GeminiService()

@router.get("/{youtube_video_id}", response_model=VideoInDB)
def get_video(youtube_video_id: str, db: Session = Depends(get_db)):
    """
    Check whether the video exists in PostgreSQL.
    If not, create the Video record with the video ID.
    Return the video information.
    """
    video = db.query(Video).filter(Video.youtube_video_id == youtube_video_id).first()
    if not video:
        video = Video(
            youtube_video_id=youtube_video_id,
            title=f"YouTube Video {youtube_video_id}", # Placeholder title, ideally we'd fetch this from YouTube API
        )
        db.add(video)
        db.commit()
        db.refresh(video)
    return video

@router.post("/{youtube_video_id}/transcript")
def get_or_create_transcript(youtube_video_id: str, db: Session = Depends(get_db)):
    """
    Validate the YouTube video ID. Check whether a transcript already exists.
    If not, retrieve it and save to PostgreSQL.
    """
    if not youtube_video_id or len(youtube_video_id) < 10:
        raise HTTPException(status_code=400, detail="Invalid YouTube video ID")
        
    video = db.query(Video).filter(Video.youtube_video_id == youtube_video_id).first()
    if not video:
        video = Video(youtube_video_id=youtube_video_id, title=f"Video {youtube_video_id}")
        db.add(video)
        db.commit()
        db.refresh(video)
        
    transcript = db.query(Transcript).filter(Transcript.video_id == video.id).first()
    
    if transcript:
        return {
            "video_id": youtube_video_id,
            "language": transcript.language,
            "segments": transcript.segments,
            "full_text": transcript.full_text
        }
        
    # Not found, fetch it
    try:
        ts_result = TranscriptService.get_transcript(youtube_video_id)
        
        segments_dict = [s.model_dump() for s in ts_result.segments]
        
        new_transcript = Transcript(
            video_id=video.id,
            language=ts_result.language,
            segments=segments_dict,
            full_text=ts_result.full_text
        )
        db.add(new_transcript)
        db.commit()
        db.refresh(new_transcript)
        
        return {
            "video_id": youtube_video_id,
            "language": new_transcript.language,
            "segments": new_transcript.segments,
            "full_text": new_transcript.full_text
        }
        
    except TranscriptUnavailableError as e:
        raise HTTPException(
            status_code=404, 
            detail={
                "error": "TRANSCRIPT_UNAVAILABLE",
                "message": e.message
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{youtube_video_id}/analyze")
def analyze_video(youtube_video_id: str, db: Session = Depends(get_db)):
    """
    Get the transcript. Send the transcript to Gemini.
    Generate structured educational analysis.
    """
    video = db.query(Video).filter(Video.youtube_video_id == youtube_video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found. Please retrieve the video first.")
        
    transcript = db.query(Transcript).filter(Transcript.video_id == video.id).first()
    if not transcript:
        # According to requirements, if no transcript exists, retrieve it
        try:
            ts_result = TranscriptService.get_transcript(youtube_video_id)
            segments_dict = [s.model_dump() for s in ts_result.segments]
            transcript = Transcript(
                video_id=video.id,
                language=ts_result.language,
                segments=segments_dict,
                full_text=ts_result.full_text
            )
            db.add(transcript)
            db.commit()
            db.refresh(transcript)
        except TranscriptUnavailableError as e:
            raise HTTPException(
                status_code=404, 
                detail={"error": "TRANSCRIPT_UNAVAILABLE", "message": e.message}
            )

    try:
        # Use our new gemini endpoint
        analysis = gemini_service.analyze_video(youtube_video_id, video.title, transcript.segments)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini Analysis Failed: {str(e)}")

@router.get("/{youtube_video_id}/notes", response_model=list[NoteResponse])
def get_notes(youtube_video_id: str, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.youtube_video_id == youtube_video_id).first()
    if not video:
        return []
    notes = db.query(Note).filter(Note.video_id == video.id).all()
    return notes

@router.post("/{youtube_video_id}/notes/generate", response_model=NoteResponse)
def generate_notes(youtube_video_id: str, db: Session = Depends(get_db)):
    """
    Generate notes from the actual transcript.
    Store generated notes in PostgreSQL.
    """
    video = db.query(Video).filter(Video.youtube_video_id == youtube_video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    transcript = db.query(Transcript).filter(Transcript.video_id == video.id).first()
    if not transcript:
        raise HTTPException(status_code=400, detail="No transcript available to generate notes from. Call /transcript first.")
        
    existing_note = db.query(Note).filter(Note.video_id == video.id).first()
    if existing_note:
        return existing_note
        
    try:
        notes_dict = gemini_service.generate_notes(transcript.full_text)
        
        # We need to map the output format to our Note DB model
        # Our model only has `content` string, so we dump the generated JSON dict to a string.
        import json
        
        new_note = Note(
            video_id=video.id,
            title=f"Notes for {video.title}",
            content=json.dumps(notes_dict),
            timestamp_seconds=0 # Or extract from the notes_dict if desired
        )
        db.add(new_note)
        db.commit()
        db.refresh(new_note)
        
        return new_note
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate notes: {str(e)}")


@router.get("/{youtube_video_id}/flashcards", response_model=list[FlashcardResponse])
def get_flashcards(youtube_video_id: str, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.youtube_video_id == youtube_video_id).first()
    if not video:
        return []
    flashcards = db.query(Flashcard).filter(Flashcard.video_id == video.id).all()
    return flashcards

@router.post("/{youtube_video_id}/flashcards/generate", response_model=list[FlashcardResponse])
def generate_flashcards(youtube_video_id: str, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.youtube_video_id == youtube_video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    transcript = db.query(Transcript).filter(Transcript.video_id == video.id).first()
    if not transcript:
        raise HTTPException(status_code=400, detail="No transcript available to generate flashcards from.")
        
    existing_cards = db.query(Flashcard).filter(Flashcard.video_id == video.id).all()
    if existing_cards:
        return existing_cards
        
    try:
        flashcards_data = gemini_service.generate_flashcards(transcript.segments)
        
        new_cards = []
        for card_data in flashcards_data.get("flashcards", []):
            card = Flashcard(
                video_id=video.id,
                question=card_data.get("question"),
                answer=card_data.get("answer"),
                topic=card_data.get("topic"),
                difficulty=card_data.get("difficulty"),
                source_timestamp=card_data.get("source_timestamp")
            )
            db.add(card)
            new_cards.append(card)
            
        db.commit()
        for card in new_cards:
            db.refresh(card)
            
        return new_cards
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to generate flashcards: {str(e)}")


@router.get("/{youtube_video_id}/quiz", response_model=QuizResponse | None)
def get_quiz(youtube_video_id: str, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.youtube_video_id == youtube_video_id).first()
    if not video:
        return None
    quiz = db.query(Quiz).filter(Quiz.video_id == video.id).first()
    if quiz:
        return quiz
    return None

@router.post("/{youtube_video_id}/quiz/generate", response_model=QuizResponse)
def generate_quiz(youtube_video_id: str, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.youtube_video_id == youtube_video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    transcript = db.query(Transcript).filter(Transcript.video_id == video.id).first()
    if not transcript:
        raise HTTPException(status_code=400, detail="No transcript available to generate quiz from.")
        
    existing_quiz = db.query(Quiz).filter(Quiz.video_id == video.id).first()
    if existing_quiz:
        return existing_quiz
        
    try:
        quiz_data = gemini_service.generate_quiz(transcript.segments)
        
        new_quiz = Quiz(
            video_id=video.id,
            title=f"Quiz for {video.title}"
        )
        db.add(new_quiz)
        db.flush() # get new_quiz.id
        
        for q_data in quiz_data.get("quiz", []):
            question = QuizQuestion(
                quiz_id=new_quiz.id,
                question=q_data.get("question"),
                options=q_data.get("options"),
                correct_answer=q_data.get("correct_answer"),
                topic=q_data.get("topic"),
                difficulty=q_data.get("difficulty"),
                source_timestamp=q_data.get("source_timestamp")
            )
            db.add(question)
            
        db.commit()
        db.refresh(new_quiz)
        return new_quiz
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")
