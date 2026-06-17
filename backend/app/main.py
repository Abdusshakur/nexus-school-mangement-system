from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlmodel import SQLModel

from backend.app.db.database import engine
from backend.app.routers import auth, students


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("App starting up... verifying database tables...")
    SQLModel.metadata.create_all(engine)
    yield
    print("App shutting down...")


app = FastAPI(
    title="School Management System API",
    lifespan=lifespan,
)

app.include_router(auth.router)
app.include_router(students.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the School Management System API!"}
