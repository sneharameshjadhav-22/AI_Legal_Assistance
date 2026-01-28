from sqlalchemy.orm import Session
from app.clauses.clause_model import Clause
from app.ml.flan_t5_summarizer import LaymanSummarizer

summarizer = LaymanSummarizer()

def generate_layman_summaries(document_id: int, db: Session):
    clauses = db.query(Clause).filter(
        Clause.document_id == document_id
    ).all()

    for clause in clauses:
        if clause.risk_label:
            summary = summarizer.summarize(
                clause.clause_text,
                clause.risk_label
            )
            clause.layman_summary = summary   # ✅ ORM-tracked update

    db.commit()   # ✅ REQUIRED
