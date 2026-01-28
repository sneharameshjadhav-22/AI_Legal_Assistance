import os
import chromadb
from chromadb.config import Settings

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(os.path.abspath(__file__))
        )
    )
)

CHROMA_PATH = os.path.join(BASE_DIR, "chroma_db")

class ClauseVectorStore:
    def __init__(self, user_id: int, document_id: int):
        print("📂 CHROMA PATH:", CHROMA_PATH)

        self.client = chromadb.Client(
            Settings(
                persist_directory=CHROMA_PATH,
                anonymized_telemetry=False
            )
        )

        self.collection = self.client.get_or_create_collection(
            name=f"user_{user_id}_doc_{document_id}"
        )

    def add(self, ids, embeddings, metadatas, documents):
        print(f"📦 Writing {len(documents)} clauses to Chroma")

        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            metadatas=metadatas,
            documents=documents
        )

        print("💾 Chroma write complete")

    def query(self, embedding, k=4):
        print("🔍 Querying Chroma with top_k =", k)

        return self.collection.query(
            query_embeddings=[embedding],
            n_results=k
        )
