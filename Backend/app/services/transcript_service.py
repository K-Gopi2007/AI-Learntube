from typing import List, Dict, Any, Optional
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter
from pydantic import BaseModel

class TranscriptSegment(BaseModel):
    start_time: float
    duration: float
    text: str

class TranscriptResult(BaseModel):
    video_id: str
    language: str
    segments: List[TranscriptSegment]
    full_text: str

class TranscriptUnavailableError(Exception):
    def __init__(self, message: str = "No public transcript is available for this video."):
        self.message = message
        super().__init__(self.message)

class TranscriptService:
    @staticmethod
    def get_transcript(video_id: str, languages: tuple = ('en',)) -> TranscriptResult:
        """
        Retrieves transcript for a given YouTube video ID.
        """
        try:
            api = YouTubeTranscriptApi()
            fetched_transcript = api.fetch(video_id, languages=languages)
            
            segments = []
            for item in fetched_transcript.snippets:
                segments.append(TranscriptSegment(
                    start_time=item.start,
                    duration=item.duration,
                    text=item.text
                ))
                
            full_text = " ".join([s.text for s in fetched_transcript.snippets])
            
            return TranscriptResult(
                video_id=video_id,
                language=fetched_transcript.language_code,
                segments=segments,
                full_text=full_text
            )
        except Exception as e:
            # Handle specific youtube_transcript_api errors if needed
            raise TranscriptUnavailableError(str(e))
