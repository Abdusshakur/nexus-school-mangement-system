# init_db.py
from sqlmodel import SQLModel
from database import engine
import models  # Crucial! Forces Python to load our tables into memory

def create_db_and_tables():
    print("🚀 Connecting to PostgreSQL and creating tables...")
    # SQLModel scans everything with table=True and builds them via the engine
    SQLModel.metadata.create_all(engine)
    print("✅ Tables created successfully!")

if __name__ == "__main__":
    create_db_and_tables()