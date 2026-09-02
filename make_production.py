import os

# 1. Update Extension API URL
api_ts_path = 'Extension/src/services/api.ts'
with open(api_ts_path, 'r') as f:
    content = f.read()
content = content.replace(
    "const BASE_URL = 'http://127.0.0.1:8000/api';", 
    "const BASE_URL = import.meta.env.VITE_API_URL || 'https://learntube-api.production.com/api';"
)
with open(api_ts_path, 'w') as f:
    f.write(content)

print("Updated Extension API URL")

# 2. Add Deployment Files
with open('Backend/Procfile', 'w') as f:
    f.write("web: uvicorn app.main:app --host 0.0.0.0 --port $PORT\n")

with open('Backend/runtime.txt', 'w') as f:
    f.write("python-3.11.x\n")

with open('Backend/railway.json', 'w') as f:
    f.write('''{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}''')

print("Created Deployment files")
