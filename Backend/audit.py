import sys
import os
import asyncio
from sqlalchemy import create_engine, text

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.core.config import settings
from app.services.gemini_service import GeminiService

async def run_tests():
    print(f"DATABASE_URL: {settings.DATABASE_URL}")
    print(f"GEMINI_API_KEY snippet: {str(settings.GEMINI_API_KEY)[:10]}...")
    
    # 1. Test PostgreSQL Connectivity
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            print("[PASS] PostgreSQL connectivity")
    except Exception as e:
        print(f"[FAIL] PostgreSQL connectivity: {e}")
        
    # 2. Test Gemini Connectivity
    try:
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY not set")
        service = GeminiService()
        # Test basic generation
        res = await service.generate_notes([{"text": "Hello world", "start": 0.0, "duration": 1.0}])
        if res:
             print("[PASS] Gemini connectivity")
        else:
             print("[FAIL] Gemini connectivity: No result returned")
    except Exception as e:
        print(f"[FAIL] Gemini connectivity: {e}")

if __name__ == "__main__":
    asyncio.run(run_tests())
