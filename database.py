# database.py
import os
from sqlmodel import create_engine, Session
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

# 2. The engine is the central manager that handles the physical connection pool
if not DATABASE_URL:
    raise ValueError("❌ CRITICAL: DATABASE_URL is not set in the environment variables (.env file)!")

engine = create_engine(DATABASE_URL, echo=True)

# 3. A helper function to create a database session for our API routes later
def get_session():
    with Session(engine) as session:
        yield session