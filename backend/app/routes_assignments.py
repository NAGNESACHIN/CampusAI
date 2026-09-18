from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import get_db
from .models import Assignment, User, Subject
from .auth import get_current_user

router = APIRouter(prefix="/api/assignments", tags=["assignments"])

@router.post("")
def create_assignment(title: str, description: str, subject_id: int, db: Session = Depends(get_db), current=Depends(get_current_user)):
    if current["role"] != "faculty": raise HTTPException(403, "Only faculty can create assignments")
    if not db.get(Subject, subject_id): raise HTTPException(404, "Subject not found")
    item = Assignment(title=title, description=description, subject_id=subject_id, faculty_id=current["id"])
    db.add(item); db.commit(); db.refresh(item)
    return {"id": item.id, "title": item.title, "subject_id": item.subject_id}

@router.get("")
def list_assignments(db: Session = Depends(get_db), current=Depends(get_current_user)):
    return db.query(Assignment).order_by(Assignment.id.desc()).all()
