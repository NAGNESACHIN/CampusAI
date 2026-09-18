from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .database import get_db
from .models import Subject

router = APIRouter(prefix="/api/subjects", tags=["subjects"])

@router.post("")
def create_subject(name: str, code: str, db: Session = Depends(get_db)):
    subject = Subject(name=name, code=code)
    db.add(subject); db.commit(); db.refresh(subject)
    return subject

@router.get("")
def list_subjects(db: Session = Depends(get_db)):
    return db.query(Subject).order_by(Subject.name).all()
