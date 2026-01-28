from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password, verify_password, create_access_token
from app.auth.auth_model import User
from app.auth.auth_schema import UserRegister, UserLogin, Token

Base.metadata.create_all(bind=engine)

auth_router = APIRouter()


# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ✅ Register API
@auth_router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user: UserRegister, db: Session = Depends(get_db)):
    print("📩 REGISTER REQUEST RECEIVED:", user)

    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        print("❌ EMAIL ALREADY EXISTS:", user.email)
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        new_user = User(
            name=user.name,
            email=user.email,
            hashed_password=hash_password(user.password)
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        token = create_access_token({"sub": new_user.email})
        return {"access_token": token, "token_type": "bearer"}

    except Exception as e:
        print("🔥 REGISTER ERROR:", str(e))
        raise HTTPException(status_code=400, detail=str(e))


# ✅ Login API
@auth_router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token({"sub": db_user.email})
    return {"access_token": token, "token_type": "bearer"}


