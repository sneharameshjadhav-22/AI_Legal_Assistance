from pydantic import BaseModel, EmailStr, ConfigDict
 
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

    model_config = ConfigDict(extra="forbid")
    
    

class UserResponse(BaseModel):
    id: int
    email: EmailStr

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
