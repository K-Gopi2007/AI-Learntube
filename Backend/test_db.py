import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        print("Database Connected Successfully!")
except Exception as e:
    print(f"Failed to connect to the database. Error:\n{e}")
