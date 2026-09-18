from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routes_auth import router as auth_router
from .routes_assignments import router as assignments_router
from .routes_submissions import router as submissions_router
from .routes_subjects import router as subjects_router

app = FastAPI(title="CampusAI API", version="0.5.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
def startup(): Base.metadata.create_all(bind=engine)
@app.get("/health")
def health(): return {"status":"ok","service":"CampusAI API"}
app.include_router(auth_router); app.include_router(subjects_router); app.include_router(assignments_router); app.include_router(submissions_router)
