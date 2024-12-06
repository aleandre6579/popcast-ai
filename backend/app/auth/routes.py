from datetime import timedelta

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.auth.utils import create_access_token, hash_password, verify_password

auth_router = APIRouter()


class UserLogin(BaseModel):
    username: str
    password: str


fake_user_db = {
    "user": {"username": "user", "hashed_password": hash_password("password")}
}


@auth_router.post("/login")
def login(user: UserLogin):
    user_data = fake_user_db.get(user.username)
    if not user_data or not verify_password(user.password, user_data["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(
        data={"sub": user.username}, expires_delta=timedelta(hours=1)
    )
    return {"access_token": token, "token_type": "bearer"}
