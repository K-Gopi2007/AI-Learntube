from app.core.database import SessionLocal
from app.models.all_models import Video, Transcript
from app.core.security import create_access_token
import requests

db = SessionLocal()
video = db.query(Video).first()
if not video:
    print("No video found in DB")
    exit(0)

transcript = db.query(Transcript).filter_by(video_id=video.id).first()
if not transcript:
    print(f"No transcript for video {video.youtube_video_id}")
    exit(0)

print(f"Testing with video {video.youtube_video_id}")

token = create_access_token(3) # Student A
headers = {"Authorization": f"Bearer {token}"}

res = requests.post(
    f"http://127.0.0.1:8000/api/chat/{video.youtube_video_id}/ask",
    json={"question": "What is this video about?"},
    headers=headers
)
print("Ask AI Response:", res.json())

res2 = requests.post(
    f"http://127.0.0.1:8000/api/chat/{video.youtube_video_id}/explain",
    json={"timestamp": 45.0},
    headers=headers
)
print("Explain Response:", res2.json())

res3 = requests.get(
    f"http://127.0.0.1:8000/api/chat/{video.youtube_video_id}/history",
    headers=headers
)
print("History length:", len(res3.json()))
