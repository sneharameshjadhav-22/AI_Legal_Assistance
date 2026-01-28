from app.core.database import SessionLocal
from app.documents.document_model import Document
from app.clauses.clause_service import generate_and_store_clauses

db = SessionLocal()

documents = db.query(Document).all()

for doc in documents:
    if doc.extracted_text:
        generate_and_store_clauses(
            text=doc.extracted_text,
            document_id=doc.id,
            owner_id=doc.owner_id,
            db=db
        )

db.close()
print("✅ Clause backfill completed")
