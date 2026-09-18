from pathlib import Path
from uuid import uuid4
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from .database import get_db
from .models import Assignment, Submission, User

router = APIRouter(prefix="/api/submissions", tags=["submissions"])
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
ALLOWED = {".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt"}

@router.post("")
async def submit_assignment(assignment_id: int = Form(...), student_id: int = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    student = db.get(User, student_id)
    assignment = db.get(Assignment, assignment_id)
    if not student or student.role != "student":
        raise HTTPException(403, "Only students can submit")
    if not assignment:
        raise HTTPException(404, "Assignment not found")
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED:
        raise HTTPException(400, "Unsupported file type")
    key = f"{uuid4().hex}{suffix}"
    destination = UPLOAD_DIR / key
    data = await file.read()
    if len(data) > 20 * 1024 * 1024:
        raise HTTPException(413, "Maximum file size is 20 MB")
    destination.write_bytes(data)
    submission = Submission(assignment_id=assignment_id, student_id=student_id, file_key=key, original_filename=file.filename or key)
    db.add(submission); db.commit(); db.refresh(submission)
    return {"id": submission.id, "status": submission.status, "filename": submission.original_filename}

@router.get("/assignment/{assignment_id}")
def faculty_view_submissions(assignment_id: int, faculty_id: int, db: Session = Depends(get_db)):
    assignment = db.get(Assignment, assignment_id)
    faculty = db.get(User, faculty_id)
    if not assignment or not faculty or faculty.role != "faculty" or assignment.faculty_id != faculty_id:
        raise HTTPException(403, "Not authorized")
    return db.query(Submission).filter(Submission.assignment_id == assignment_id).all()
