from fastapi import APIRouter, Depends
from pydantic import BaseModel
from .auth import get_current_user
from .ai import rag_service
router=APIRouter(prefix="/api/ai",tags=["ai"])
class AskRequest(BaseModel):
    question:str
    subject:str|None=None
@router.post("/ask")
def ask(req:AskRequest,current=Depends(get_current_user)):
    context,sources=rag_service.build_context(req.question)
    return {"answer":rag_service.generate_answer(req.question,context),"sources":sources,"grounded":bool(context)}
