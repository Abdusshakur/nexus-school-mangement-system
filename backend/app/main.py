
# backend/app/main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager
from sqlmodel import SQLModel
from backend.app.db.database import engine
# Import your existing routers
from backend.app.routers import auth, students, parents, teachers, relationships, attendance, announcements, dashboard

# Add these imports to backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 NexusSchoolEngine Booting... syncing PostgreSQL schemas...")
    SQLModel.metadata.create_all(engine)
    yield
    print("🛑 Shutting down server...")

app = FastAPI(
    title="NexusSchoolEngine API",
    version="1.0.0",
    lifespan=lifespan
)

# ... right after your app = FastAPI(...) instantiation ...
origins = [
    "http://localhost:3000",        # For your local frontend testing
    "http://localhost:5173",        # Common default port if you are using Vite locally
    "https://nexus-school-mangement-system.vercel.app"  # 👈 PASTE YOUR EXACT LIVE VERCEL URL HERE!
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # Allows your Vercel site to bypass browser blocks
    allow_credentials=True,
    allow_methods=["*"],            # Allows all standard methods (GET, POST, PUT, DELETE)
    allow_headers=["*"],            # Allows all headers (including JWT Authorization)
)


# Apply the API Version Prefix (/api/v1) uniformly across your routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(students.router, prefix="/api/v1")
app.include_router(parents.router, prefix="/api/v1")
app.include_router(teachers.router, prefix="/api/v1")
app.include_router(relationships.router, prefix="/api/v1")
app.include_router(attendance.router, prefix="/api/v1") # Mount bulk attendance engine 
app.include_router(announcements.router, prefix="/api/v1") 
app.include_router(dashboard.router, prefix="/api/v1") # Mount analytics dashboard module 


@app.get("/")
def read_root():
    return {"message": "Welcome to NexusSchoolEngine Core API Engine"}


