from typing import List, Dict, Any, Optional
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import JSONFormatter

class YouTubeService:
    @staticmethod
    def get_transcript(video_id: str) -> List[Dict[str, Any]]:
        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            return transcript
        except Exception as e:
            raise ValueError(f"Error fetching transcript: {str(e)}")

    @staticmethod
    def extract_video_id(url: str) -> Optional[str]:
        # Simple extraction for youtube.com/watch?v=... or youtu.be/...
        if "v=" in url:
            return url.split("v=")[1].split("&")[0]
        elif "youtu.be/" in url:
            return url.split("youtu.be/")[1].split("?")[0]
        return None
