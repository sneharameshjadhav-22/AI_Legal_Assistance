from pydantic import BaseModel
from datetime import datetime

class ClauseResponse(BaseModel):
    id: int
    clause_text: str
    created_at: datetime

    class Config:
        orm_mode = True
