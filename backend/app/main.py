from fastapi import FastAPI
from .database import Base, engine
from .routes_auth import router as auth_router

app = FastAPI(title="CampusAI API", version="0.2.0")

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

@app.get("/health")
def health():
    return {"status": "ok", "service": "CampusAI API"}

app.include_router(auth_router)
