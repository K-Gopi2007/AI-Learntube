from app.core.database import SessionLocal
from app.models.all_models import Video
from app.core.security import create_access_token
import requests
import json

db = SessionLocal()
video = db.query(Video).first()

token = create_access_token(3)
headers = {'Authorization': f'Bearer {token}'}

print(f'Testing on {video.youtube_video_id}')
res = requests.post(f'http://127.0.0.1:8000/api/exam-kit/{video.youtube_video_id}/generate', headers=headers)
print('Generate status:', res.status_code)
if res.status_code != 200:
    print(res.text)

res2 = requests.get(f'http://127.0.0.1:8000/api/exam-kit/{video.youtube_video_id}', headers=headers)
print('Get status:', res2.status_code)
if res2.status_code == 200:
    data = res2.json()
    print('Has revision notes:', len(data.get('revision_notes', [])))
