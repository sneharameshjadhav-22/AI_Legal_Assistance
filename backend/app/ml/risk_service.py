from sqlalchemy.orm import Session
from app.clauses.clause_model import Clause
from app.ml.legalbert_classifier import LegalBERTClassifier

classifier = LegalBERTClassifier()

def classify_clauses_for_document(
    document_id: int,
    db: Session
):
    clauses = db.query(Clause).filter(
        Clause.document_id == document_id
    ).all()

    for clause in clauses:
        score, label = classifier.predict(clause.clause_text)

        clause.risk_score = score
        clause.risk_label = label
        clause.risk_type = "General Legal Risk"  # placeholder

    db.commit()
