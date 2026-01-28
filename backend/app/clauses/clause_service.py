from sqlalchemy.orm import Session
from app.clauses.clause_model import Clause
from app.utils.clause_segmenter import segment_clauses


def generate_and_store_clauses(
    text: str,
    document_id: int,
    owner_id: int,
    db: Session
):
    clauses = segment_clauses(text)

    clause_objects = []

    for clause_text in clauses:
        clause = Clause(
            document_id=document_id,
            owner_id=owner_id,
            clause_text=clause_text
        )
        clause_objects.append(clause)

    db.bulk_save_objects(clause_objects)
    db.commit()

    return clause_objects
