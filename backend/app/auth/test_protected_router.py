from fastapi import APIRouter, Depends
from app.auth.auth_dependency import get_current_user
from app.auth.auth_model import User

router = APIRouter()

@router.get("/protected-test")
def protected_test(current_user: User = Depends(get_current_user)):
    return {
        "message": "Authorize button works 🎉",
        "user_id": current_user.id,          # ✅ add this
        "email": current_user.email,
        "name": current_user.name
    }
