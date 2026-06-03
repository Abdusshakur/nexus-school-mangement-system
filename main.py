# main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager
from sqlmodel import SQLModel
from database import engine
from routers import auth, students  # Import the brand new auth router

# 1. Life span event: Automatically runs code when the server starts up
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 App starting up... verifying database tables...")
    # This automatically verifies and creates our PostgreSQL tables if they don't exist
    SQLModel.metadata.create_all(engine)
    yield
    print("🛑 App shutting down...")

# 2. Initialize FastAPI with our lifespan manager
app = FastAPI(
    title="School Management System API",
    lifespan=lifespan
)

# Connect the auth router routes
app.include_router(auth.router)
app.include_router(students.router) # Include the Student Directory


@app.get("/")
def read_root():
    return {"message": "Welcome to the School Management System API!"}