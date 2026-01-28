from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password, verify_password


def register_user(db: Session, email: str, password: str, name: str):
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return None

    # ✅ FIX HERE
    hashed_password = hash_password(password)

    user = User(
        email=email,
        name=name,
        hashed_password=hashed_password
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user
