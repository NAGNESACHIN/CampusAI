from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import get_db
from .models import User
from .schemas import RegisterRequest, LoginRequest, AuthResponse
from .auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["authentication"])

@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if payload.role not in {"student", "faculty"}:
        raise HTTPException(400, "Role must be student or faculty")
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(409, "Email already registered")
    user = User(name=payload.name, email=payload.email, password_hash=hash_password(payload.password), role=payload.role)
    db.add(user); db.commit(); db.refresh(user)
    return AuthResponse(access_token=create_access_token(user.id, user.role), role=user.role)

@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    return AuthResponse(access_token=create_access_token(user.id, user.role), role=user.role)
