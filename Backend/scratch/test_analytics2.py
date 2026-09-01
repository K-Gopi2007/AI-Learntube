from app.core.database import SessionLocal
from app.models.all_models import Video
from app.core.security import create_access_token
import requests

db = SessionLocal()
token = create_access_token(3)
headers = {'Authorization': f'Bearer {token}'}

res = requests.get('http://127.0.0.1:8000/api/analytics/dashboard', headers=headers)
print(res.status_code, res.json())
