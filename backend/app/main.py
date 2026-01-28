from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth.auth_router import auth_router
from app.auth.test_protected_router import router as protected_router
from app.documents.document_router import router as document_router
from app.ml.risk_router import router as risk_router
from app.clauses.layman_router import router as layman_router
from app.rag.rag_router import router as rag_router
app = FastAPI(
    title="AI Legal Assistant for Contracts & Compliance",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://172.28.11.99:8080",  # ← THIS WAS MISSING
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(protected_router, tags=["Protected"])
app.include_router(
    document_router,
    prefix="/documents",
    tags=["Documents"]
)

app.include_router(
    risk_router,
    prefix="/risk",
    tags=["Risk Analysis"]
)
app.include_router(
    layman_router,
    prefix="/layman",
    tags=["Layman Explanation"]
)
app.include_router(
    rag_router,
    prefix="/chatbot",
    tags=["RAG Chatbot"]
)


@app.get("/")
def root():
    return {"message": "AI Legal Assistant Backend is running"}
