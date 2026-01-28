from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime , Float, String
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Clause(Base):
    __tablename__ = "clauses"

    id = Column(Integer, primary_key=True, index=True)

    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    clause_text = Column(Text, nullable=False)
    
    risk_score = Column(Float, nullable=True)
    risk_label = Column(String(20), nullable=True)
    risk_type = Column(String(100), nullable=True)
    
    layman_summary = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    document = relationship("Document", back_populates="clauses")