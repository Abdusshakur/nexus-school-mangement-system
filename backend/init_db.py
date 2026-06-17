from sqlmodel import SQLModel

import backend.app.models  # noqa: F401
from backend.app.db.database import engine


def create_db_and_tables():
    print("Connecting to PostgreSQL and creating tables...")
    SQLModel.metadata.create_all(engine)
    print("Tables created successfully!")


if __name__ == "__main__":
    create_db_and_tables()
