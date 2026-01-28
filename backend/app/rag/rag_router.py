from fastapi import APIRouter, Depends , Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.auth.auth_dependency import get_current_user
from app.auth.auth_model import User
from app.rag.rag_service import (
    index_clauses_for_document,
    answer_question
)
from app.rag.vector_store import ClauseVectorStore 
from app.rag.schemas import AskRequest
router = APIRouter()
@router.get("/debug/{document_id}")
def debug_chroma(document_id: int, user=Depends(get_current_user)):
    store = ClauseVectorStore(user.id, document_id)
    count = store.collection.count()
    return {"stored_vectors": count}


@router.post("/index/{document_id}")
def index_document(
    document_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    index_clauses_for_document(db, document_id, user.id)
    return {"message": "Document indexed for chatbot"}


@router.post("/ask/{document_id}")
def ask_question_route(
    document_id: int,
    payload: AskRequest = Body(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return answer_question(
        payload.question,
        db,
        user.id,
        document_id
    )

