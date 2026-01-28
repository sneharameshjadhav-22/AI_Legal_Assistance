import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, engine, Base
from app.documents.document_model import Document
from app.documents.document_schema import DocumentResponse
from app.auth.auth_dependency import get_current_user
from app.auth.auth_model import User
from app.documents.pdf_parser import extract_text_from_pdf
from app.clauses.clause_service import generate_and_store_clauses

# -------------------------------------------------------------------
# Setup
# -------------------------------------------------------------------

Base.metadata.create_all(bind=engine)

router = APIRouter()

UPLOAD_DIR = "data/uploaded_documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# -------------------------------------------------------------------
# Database Dependency
# -------------------------------------------------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------------------------------------------------
# 1️⃣ UPLOAD DOCUMENT
# POST /documents/upload
# -------------------------------------------------------------------

@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED
)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    file_path = os.path.join(
        UPLOAD_DIR,
        f"user_{current_user.id}_{file.filename}"
    )

    # 1️⃣ Save PDF to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2️⃣ Extract text
    extracted_text = extract_text_from_pdf(file_path)
    if not extracted_text:
        raise HTTPException(
            status_code=400,
            detail="Failed to extract text from PDF"
        )

    # 3️⃣ Save document in DB
    document = Document(
        filename=file.filename,
        file_path=file_path,
        extracted_text=extracted_text,
        owner_id=current_user.id
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    # 4️⃣ Generate clauses immediately
    generate_and_store_clauses(
        text=document.extracted_text,
        document_id=document.id,
        owner_id=current_user.id,
        db=db
    )

    return document


# -------------------------------------------------------------------
# 2️⃣ LIST DOCUMENTS
# GET /documents
# -------------------------------------------------------------------

@router.get(
    "",
    response_model=list[DocumentResponse]
)
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    documents = (
        db.query(Document)
        .filter(Document.owner_id == current_user.id)
        .order_by(Document.id.desc())
        .all()
    )
    return documents


# -------------------------------------------------------------------
# 3️⃣ DELETE DOCUMENT
# DELETE /documents/{document_id}
# -------------------------------------------------------------------

@router.delete(
    "/{document_id}",
    status_code=status.HTTP_200_OK
)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.owner_id == current_user.id
        )
        .first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Remove file from disk
    if document.file_path and os.path.exists(document.file_path):
        os.remove(document.file_path)

    db.delete(document)
    db.commit()

    return {"message": "Document deleted successfully"}
