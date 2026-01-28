from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.ml.layman_service import generate_layman_summaries
from app.auth.auth_dependency import get_current_user
from app.auth.auth_model import User
from app.documents.document_model import Document
from app.clauses.clause_model import Clause
router = APIRouter()

@router.post("/summarize/{document_id}")
def summarize_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 🔐 Ownership check
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.owner_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(status_code=403, detail="Not authorized")

    # 🔥 Generate + store summaries
    generate_layman_summaries(document_id, db)

    # ✅ ALWAYS return UPDATED clauses
    clauses = db.query(Clause).filter(
        Clause.document_id == document_id
    ).all()

    return clauses

@router.get("/{document_id}")
def get_layman_summary(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 🔐 Ownership check
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.owner_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(status_code=403, detail="Not authorized")

    clauses = db.query(Clause).filter(
        Clause.document_id == document_id
    ).all()

    return clauses