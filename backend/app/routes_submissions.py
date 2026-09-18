from pathlib import Path
from uuid import uuid4
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from .database import get_db
from .models import Assignment, Submission
from .auth import get_current_user

router = APIRouter(prefix="/api/submissions", tags=["submissions"])
UPLOAD_DIR = Path("uploads"); UPLOAD_DIR.mkdir(exist_ok=True)
ALLOWED = {".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt"}

@router.post("")
async def submit_assignment(assignment_id: int = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db), current=Depends(get_current_user)):
    if current["role"] != "student": raise HTTPException(403, "Only students can submit")
    assignment = db.get(Assignment, assignment_id)
    if not assignment: raise HTTPException(404, "Assignment not found")
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED: raise HTTPException(400, "Unsupported file type")
    data = await file.read()
    if len(data) > 20 * 1024 * 1024: raise HTTPException(413, "Maximum file size is 20 MB")
    key = f"{uuid4().hex}{suffix}"; (UPLOAD_DIR / key).write_bytes(data)
    submission = Submission(assignment_id=assignment_id, student_id=current["id"], file_key=key, original_filename=file.filename or key)
    db.add(submission); db.commit(); db.refresh(submission)
    return {"id": submission.id, "status": submission.status, "filename": submission.original_filename}

@router.get("/assignment/{assignment_id}")
def faculty_view_submissions(assignment_id: int, db: Session = Depends(get_db), current=Depends(get_current_user)):
    assignment = db.get(Assignment, assignment_id)
    if current["role"] != "faculty" or not assignment or assignment.faculty_id != current["id"]: raise HTTPException(403, "Not authorized")
    return db.query(Submission).filter(Submission.assignment_id == assignment_id).all()
