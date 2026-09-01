from app.core.database import SessionLocal
from app.models.all_models import Video
from app.core.security import create_access_token
import requests

db = SessionLocal()
token = create_access_token(3)
headers = {'Authorization': f'Bearer {token}'}

print('Update progress to 60%...')
res = requests.post('http://127.0.0.1:8000/api/history/update', json={
    'video_id': 'O5nskjZ_GoI',
    'last_timestamp': 60,
    'duration': 100
}, headers=headers)
print('Update status:', res.status_code)

print('Get history...')
res_hist = requests.get('http://127.0.0.1:8000/api/history', headers=headers)
print('History len:', len(res_hist.json()))

print('Get resume...')
res_res = requests.get('http://127.0.0.1:8000/api/history/resume', headers=headers)
print('Resume:', res_res.json())
