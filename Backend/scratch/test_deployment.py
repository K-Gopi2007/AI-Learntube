import requests
import sys
import traceback

def test_health():
    res = requests.get('http://127.0.0.1:8000/api/health')
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"

def test_auth():
    res = requests.post('http://127.0.0.1:8000/api/auth/register', json={
        "email": "test_deploy@example.com",
        "username": "test_deploy",
        "password": "password123"
    })
    if res.status_code == 400 and 'already registered' in res.text:
        # Try login instead
        res = requests.post('http://127.0.0.1:8000/api/auth/login', data={
            "username": "test_deploy@example.com",
            "password": "password123"
        })
    assert res.status_code == 200, f"Expected 200, got {res.status_code} - {res.text}"
    return res.json().get('access_token')

def test_analytics(token):
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get('http://127.0.0.1:8000/api/analytics/dashboard', headers=headers)
    assert res.status_code == 200, f"Expected 200, got {res.status_code} - {res.text}"

def test_history(token):
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get('http://127.0.0.1:8000/api/history', headers=headers)
    assert res.status_code == 200, f"Expected 200, got {res.status_code} - {res.text}"

if __name__ == "__main__":
    try:
        test_health()
        print("✅ Health Endpoint")
        token = test_auth()
        print("✅ Authentication")
        test_analytics(token)
        print("✅ Analytics Endpoint")
        test_history(token)
        print("✅ History Endpoint")
    except Exception as e:
        print(f"❌ TEST FAILED")
        traceback.print_exc()
        sys.exit(1)
