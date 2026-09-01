from app.core.database import SessionLocal
from app.models.all_models import Video
from app.core.security import create_access_token
import requests
import json

db = SessionLocal()
video = db.query(Video).first()

token = create_access_token(3)
headers = {'Authorization': f'Bearer {token}'}

print('Update history...')
res = requests.post('http://127.0.0.1:8000/api/history/update', json={
    'video_id': video.youtube_video_id,
    'timestamp': 120.5,
    'action_type': 'watch'
}, headers=headers)
print('Update status:', res.status_code)

res2 = requests.post('http://127.0.0.1:8000/api/history/update', json={
    'video_id': video.youtube_video_id,
    'timestamp': 120.5,
    'action_type': 'quiz'
}, headers=headers)

print('Get dashboard...')
res_dash = requests.get('http://127.0.0.1:8000/api/analytics/dashboard', headers=headers)
print('Dashboard status:', res_dash.status_code)
dash_data = res_dash.json()
print('Activity length:', len(dash_data['learning_activity']))
print('Topic distrib length:', len(dash_data['topic_distribution']))

print('Get history...')
res_hist = requests.get('http://127.0.0.1:8000/api/history', headers=headers)
print('History status:', res_hist.status_code)
hist_data = res_hist.json()
print('Continue learning video:', hist_data['continue_learning']['title'])
