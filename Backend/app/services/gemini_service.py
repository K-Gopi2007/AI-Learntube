import json
import typing_extensions as typing
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from app.core.config import settings

# -----------------
# Response Schemas
# -----------------

class SummaryResponse(BaseModel):
    summary: str = Field(description="A concise summary of the video transcript.")

class TimestampReference(BaseModel):
    timestamp: str = Field(description="Approximate timestamp in format MM:SS")
    description: str

class Definition(BaseModel):
    term: str
    meaning: str

class AdvancedNotesResponse(BaseModel):
    summary: str = Field(description="High-level summary of the video.")
    key_concepts: list[str] = Field(description="Main concepts covered.")
    definitions: list[Definition] = Field(description="Glossary of terms.")
    important_points: list[str] = Field(description="Bullet points of vital information.")
    timestamp_references: list[TimestampReference] = Field(description="Important moments.")

class FlashcardItem(BaseModel):
    question: str = Field(description="The question or concept to test.")
    answer: str = Field(description="The clear, concise answer.")
    topic: str = Field(description="The specific topic this flashcard belongs to.")
    difficulty: str = Field(description="e.g. Beginner, Intermediate, Advanced.")
    source_timestamp: int = Field(description="The start time in seconds of the source segment in the transcript.")

class FlashcardsResponse(BaseModel):
    flashcards: list[FlashcardItem]

class QuizItem(BaseModel):
    question: str
    options: list[str] = Field(description="Exactly 4 multiple choice options.")
    correct_answer: str = Field(description="The exact text of the correct option.")
    topic: str = Field(description="The specific topic this question covers.")
    difficulty: str = Field(description="e.g. Beginner, Medium, Hard")
    source_timestamp: int = Field(description="The exact start time in seconds of the source segment in the transcript.")

class QuizResponse(BaseModel):
    quiz: list[QuizItem]
    difficulty_level: str = Field(description="Overall difficulty level of the quiz (e.g. Beginner, Intermediate, Advanced).")
    topic_mapping: list[str] = Field(description="List of main topics covered in this quiz.")

class ConceptEvaluation(BaseModel):
    concept: str
    score: int
    status: str = Field(description="MASTERED, NEEDS_PRACTICE, or WEAK")
    feedback: str

class TeachMeBackResponse(BaseModel):
    topic: str
    overall_score: int
    concepts: list[ConceptEvaluation]
    knowledge_gaps: list[str]
    strengths: list[str]
    recommendation: str

class KnowledgeGapItem(BaseModel):
    topic: str
    description: str = Field(description="Why this is a gap and what needs to be understood.")

class KnowledgeGapsResponse(BaseModel):
    gaps: list[KnowledgeGapItem]

class LearningPathStep(BaseModel):
    step: int
    topic: str
    description: str = Field(description="What to learn in this step and how it builds on previous steps.")

class LearningPathResponse(BaseModel):
    path: list[LearningPathStep]

class AdaptiveLearningPathResponse(BaseModel):
    knowledge_gaps: list[str] = Field(description="Identified knowledge gaps based on weak topics.")
    weak_topics: list[str] = Field(description="List of weak topics based on performance.")
    recommended_next_topics: list[str] = Field(description="What the user should study next.")
    personalized_learning_path: str = Field(description="A sequential learning path, e.g. 'Focus: Trees -> BST -> AVL -> Graphs'")

class ExamPlanItem(BaseModel):
    category: str = Field(description="The study category or topic, e.g. 'Trees', 'Graphs', 'Revision', 'Mock Test'.")
    percentage: int = Field(description="The percentage weight in the exam plan (0-100).")

class ExamPlanResponse(BaseModel):
    exam_plan: list[ExamPlanItem]

class ChatResponse(BaseModel):
    response: str = Field(description="The response to the user's question, strictly based on the video context.")

class ExplanationResponse(BaseModel):
    explanation: str = Field(description="A concise, easy to understand explanation of what is happening or being discussed in the video at the given timestamp.")

class TopicSegment(BaseModel):
    topic: str
    start_time: int = Field(description="Start time in seconds")
    end_time: int = Field(description="End time in seconds")
    explanation: str
    key_concepts: list[str]

class VideoAnalysisResponse(BaseModel):
    video_id: str
    title: str
    topics: list[TopicSegment]
    subtopics: list[str]
    summary: str
    key_concepts: list[str]
    difficulty: str = Field(description="e.g., Beginner, Intermediate, Advanced")
    estimated_learning_time: int = Field(description="Estimated learning time in minutes")


class RevisionNoteTopic(BaseModel):
    topic: str
    key_points: list[str]

class ImportantQuestion(BaseModel):
    question: str
    answer: str

class WeakTopicRevision(BaseModel):
    topic: str
    explanation: str
    focus_areas: list[str]

class MockExamQuestion(BaseModel):
    question: str
    options: list[str]
    correct_answer: str

class ExamKitResponse(BaseModel):
    revision_notes: list[RevisionNoteTopic]
    important_questions: list[ImportantQuestion]
    weak_topic_revision: list[WeakTopicRevision]
    final_mock_exam: list[MockExamQuestion]

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is missing.")
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = 'gemini-3.6-flash'  # Use supported model for structured output

    def _generate_structured_content(self, prompt: str, schema: typing.Type[BaseModel]) -> dict:
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=schema,
                )
            )
            return json.loads(response.text)
        except Exception as e:
            raise Exception(f"Error calling Gemini API: {str(e)}")
            
    def generate_summary(self, transcript_text: str) -> dict:
        prompt = f"Summarize the following video transcript concisely:\n\n{transcript_text[:15000]}"
        return self._generate_structured_content(prompt, SummaryResponse)
        
    def generate_notes(self, transcript_text: str) -> dict:
        prompt = f"Create structured, detailed study notes based on this transcript. Extract summary, key concepts, definitions, important points, and timestamp references (infer approximate timestamps if missing):\n\n{transcript_text[:15000]}"
        return self._generate_structured_content(prompt, AdvancedNotesResponse)
        
    def generate_flashcards(self, transcript_segments: list, num_cards: int = 10) -> dict:
        condensed_transcript = []
        for seg in transcript_segments:
            condensed_transcript.append(f"[{int(seg['start_time'])}s] {seg['text']}")
        transcript_text = "\n".join(condensed_transcript)[:25000]
        
        prompt = f"Create {num_cards} flashcards from this timestamped transcript. Each should have a clear question, an answer, the specific topic, a difficulty rating (Beginner/Intermediate/Advanced), and the source_timestamp strictly chosen from the provided timestamps in the transcript:\n\n{transcript_text}"
        return self._generate_structured_content(prompt, FlashcardsResponse)
        
    def generate_quiz(self, transcript_segments: list, num_questions: int = 10) -> dict:
        condensed_transcript = []
        for seg in transcript_segments:
            condensed_transcript.append(f"[{int(seg['start_time'])}s] {seg['text']}")
        transcript_text = "\n".join(condensed_transcript)[:25000]
        
        prompt = f"Create a {num_questions}-question multiple-choice quiz based ONLY on this timestamped transcript. For each question, provide the question, exactly 4 options, the exact correct_answer text, the topic, the difficulty, and the source_timestamp strictly matching the transcript segment where the answer is found. Do not invent timestamps:\n\n{transcript_text}"
        return self._generate_structured_content(prompt, QuizResponse)
        
    def evaluate_explanation(self, original_topic: str, user_explanation: str, context: str = "") -> dict:
        prompt = f"The user is explaining the topic '{original_topic}'.\n\nTheir explanation:\n{user_explanation}\n\nContext:\n{context}\n\nEvaluate their explanation against the actual topic knowledge. Distinguish correct, partially correct, incorrect, and missing concepts. Do not reward keyword-dropping. Return the overall score out of 100, specific concept evaluations, strengths, gaps, and a recommendation."
        return self._generate_structured_content(prompt, TeachMeBackResponse)
        
    def analyze_knowledge_gaps(self, user_explanations: list[str], test_scores: list[int], context_topics: str) -> dict:
        prompt = f"Analyze the following user performance to find knowledge gaps within the topics: '{context_topics}'.\nUser explanations: {user_explanations}\nTest scores: {test_scores}\n\nIdentify specific topics they are struggling with and why."
        return self._generate_structured_content(prompt, KnowledgeGapsResponse)
        
    def generate_learning_path(self, gaps: list[dict], target_goal: str) -> dict:
        prompt = f"The user has the following knowledge gaps: {gaps}. Their target learning goal is: '{target_goal}'.\n\nGenerate a step-by-step personalized learning path to help them bridge these gaps and reach their goal."
        return self._generate_structured_content(prompt, LearningPathResponse)

    def generate_adaptive_path(self, performance_summary: str) -> dict:
        prompt = f"Based on the following quiz performance summary:\n{performance_summary}\n\nIdentify knowledge gaps, weak topics, recommended next topics, and generate a sequential personalized learning path (e.g. Focus: Topic A -> Topic B)."
        return self._generate_structured_content(prompt, AdaptiveLearningPathResponse)

    def generate_exam_plan(self, knowledge_gaps: list[str]) -> dict:
        prompt = f"The user has the following knowledge gaps: {knowledge_gaps}.\n\nGenerate a personalized exam plan that heavily weights their weak areas, includes revision, and adds a mock test portion. Assign a percentage to each category so they sum to 100%."
        return self._generate_structured_content(prompt, ExamPlanResponse)

    def analyze_video(self, video_id: str, title: str, transcript_segments: list) -> dict:
        condensed_transcript = []
        for seg in transcript_segments:
            condensed_transcript.append(f"[{int(seg['start_time'])}s - {int(seg['start_time'] + seg['duration'])}s] {seg['text']}")
        
        transcript_text = "\n".join(condensed_transcript)[:25000]
        
        prompt = f"Analyze the following timestamped transcript for the educational video '{title}' (ID: {video_id}).\n" \
                 f"Identify educational topic boundaries from the timestamps. Do not invent timestamps, use only the ones provided.\n" \
                 f"Extract topics, subtopics, a summary, key concepts, overall difficulty, and estimated learning time.\n\n" \
                 f"Transcript:\n{transcript_text}"
                 
        result = self._generate_structured_content(prompt, VideoAnalysisResponse)
        result["video_id"] = video_id
        result["title"] = title
        return result

    def ask_ai_with_context(self, question: str, transcript_text: str, chat_history: list, timestamp: float = None) -> dict:
        history_str = "\n".join([f"{msg['role']}: {msg['content']}" for msg in chat_history])
        
        timestamp_str = f" The user is asking specifically about the moment at {timestamp} seconds." if timestamp else ""
        
        prompt = (
            f"You are LearnTube AI, a helpful educational assistant.\n"
            f"Context (Video Transcript):\n{transcript_text[:15000]}\n\n"
            f"Chat History:\n{history_str}\n\n"
            f"User Question: {question}\n"
            f"{timestamp_str}\n"
            f"Provide a clear and accurate response based strictly on the video context."
        )
        return self._generate_structured_content(prompt, ChatResponse)

    def explain_moment(self, transcript_context: str, timestamp: float) -> dict:
        prompt = (
            f"You are LearnTube AI, an expert educational tutor.\n"
            f"The user clicked 'Explain This Moment' at exactly {timestamp} seconds into the video.\n"
            f"Here is the transcript around this timestamp:\n\n{transcript_context}\n\n"
            f"Explain clearly and concisely what is being discussed or demonstrated at this moment."
        )
        return self._generate_structured_content(prompt, ExplanationResponse)

    def generate_exam_kit(self, transcript_text: str, weak_topics: list[str], test_scores: list[int]) -> dict:
        prompt = (
            f"Generate a comprehensive personalized Exam Kit based on this video transcript.\n"
            f"The student has weak topics in: {weak_topics}. Their recent test scores: {test_scores}.\n"
            f"Tailor the 'weak_topic_revision' section and 'final_mock_exam' heavily towards these weak areas.\n"
            f"Transcript:\n{transcript_text[:20000]}"
        )
        return self._generate_structured_content(prompt, ExamKitResponse)
