from pathlib import Path
from fastapi import APIRouter,Depends,File,Form,HTTPException,UploadFile
from .auth import get_current_user
from .ai import rag_service
router=APIRouter(prefix="/api/materials",tags=["course material"])
@router.post("/text")
async def add_material(subject:str=Form(...),file:UploadFile=File(...),current=Depends(get_current_user)):
    if current["role"]!="faculty":raise HTTPException(403,"Only faculty can add course material")
    if Path(file.filename or "").suffix.lower() not in {".txt",".md"}:raise HTTPException(400,"Prototype RAG accepts .txt or .md material")
    data=await file.read()
    if len(data)>5*1024*1024:raise HTTPException(413,"Material is too large")
    rag_service.add_document(f"{subject}/{file.filename}",data.decode("utf-8","ignore"))
    return {"status":"indexed","subject":subject,"filename":file.filename}
