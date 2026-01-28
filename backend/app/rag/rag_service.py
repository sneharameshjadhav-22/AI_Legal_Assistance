from sqlalchemy.orm import Session
from app.clauses.clause_model import Clause
from app.rag.embeddings import Embedder
from app.rag.vector_store import ClauseVectorStore
from app.rag.llama_answer import LlamaAnswerGenerator
import re
embedder = Embedder()
llama = LlamaAnswerGenerator()






def index_clauses_for_document(db: Session, document_id: int, user_id: int):
    clauses = db.query(Clause).filter(
        Clause.document_id == document_id,
        Clause.owner_id == user_id
    ).all()

    print(f"🔍 CLAUSES FOUND: {len(clauses)}")

    texts, ids, metadatas = [], [], []

    for c in clauses:
        if not c.layman_summary:
            continue

        texts.append(c.layman_summary)
        ids.append(str(c.id))
        metadatas.append({
            "clause_id": c.id,
            "risk_label": c.risk_label
        })

    if not texts:
        print("❌ No text to index")
        return

    embeddings = embedder.embed(texts)
    print(f"📐 EMBEDDINGS SHAPE: {len(embeddings)}")

    store = ClauseVectorStore(user_id, document_id)
    store.add(ids, embeddings.tolist(), metadatas, texts)

    print("✅ INDEXING COMPLETED SUCCESSFULLY")

# def is_clause_search_question(question: str) -> bool:
#     q = question.lower()

#     keywords = [
#         "termination",
#         "liability",
#         "payment",
#         "indemnity",
#         "breach",
#         "confidential",
#         "warranty",
#         "penalty",
#         "law",
#         "laws",
#         "legal",
#         "compliance",
#         "regulation",
#         "governing",
#         "federal",
#         "state",
#     ]

#     patterns = [
#         r"find .* clause",
#         r"list .* clause",
#         r".* related clause",
#         r"clauses about .*",
#         r"does .* have to .*",
#         r"is .* required to .*",
#     ]

#     return any(k in q for k in keywords) or any(re.search(p, q) for p in patterns)



def answer_question(
    question: str,
    db: Session,
    user_id: int,
    document_id: int
):
    store = ClauseVectorStore(user_id, document_id)

    query_embedding = embedder.embed([question])[0]
    results = store.query(query_embedding, k=4)

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    

    # ✅ Clean + truncate aggressively
    cleaned_docs = []
    cleaned_meta = []

    for doc, meta in zip(documents, metadatas):
        if not doc:
            continue
        doc = doc.strip()
        if len(doc) < 40:
            continue
        cleaned_docs.append(doc[:500])   # HARD LIMIT
        cleaned_meta.append(meta)

    if not cleaned_docs:
        return {
            "answer": "The document does not mention this.",
            "why_this_answer": []
        }

    # Build context for LLaMA
    context = "\n".join(f"- {d}" for d in cleaned_docs)

    # 🔥 Try LLaMA
    answer = llama.answer(question, context)

    # 🔴 CRITICAL FIX: fallback if Ollama fails
    if (
        not answer
        or "not mention" in answer.lower()
        or "unavailable" in answer.lower()
    ):
        # Extractive fallback
        answer = (
            "Based on the document, the following clauses are relevant:\n"
            + " ".join(cleaned_docs[:2])
        )

    explanations = []
    for doc, meta in zip(cleaned_docs, cleaned_meta):
        explanations.append({
            "clause_id": meta.get("clause_id"),
            "risk_label": meta.get("risk_label"),
            "reason": doc
        })

    return {
        "answer": answer,
        "why_this_answer": explanations
    }