from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.auth.auth_dependency import get_current_user
from app.auth.auth_model import User
from app.ml.risk_service import classify_clauses_for_document
from app.clauses.clause_model import Clause
router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/analyze/{document_id}")
def analyze_document_risk(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    classify_clauses_for_document(document_id, db)
    return {"message": "Risk analysis completed"}


@router.get("/{document_id}")
def get_risk_analysis(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    clauses = db.query(Clause).filter(
        Clause.document_id == document_id
    ).all()

    return clauses