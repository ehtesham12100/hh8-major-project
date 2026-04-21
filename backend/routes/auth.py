from fastapi import APIRouter, HTTPException
from database import db
from auth_utils import verify_password, create_access_token, get_password_hash
from pydantic import BaseModel

from notifications import record_anomaly, send_security_email, send_login_alert

router = APIRouter(prefix="/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

@router.post("/login")
def login(user: LoginRequest):
    db_user = db["users"].find_one({"username": user.username})

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid username")

    # Check password
    if not verify_password(user.password, db_user["password"]):
        # Increment failed attempts
        failed_count = db_user.get("failed_attempts", 0) + 1
        db["users"].update_one(
            {"username": user.username},
            {"$set": {"failed_attempts": failed_count}}
        )

        # Trigger security alert if threshold reached
        if failed_count >= 3:
            user_email = db_user.get("email", "")
            record_anomaly(user.username, user_email)
            if user_email:
                send_security_email(user_email, user.username)
        
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid password. Attempt {failed_count}/3."
        )

    # Successful login - reset failed attempts
    db["users"].update_one(
        {"username": user.username},
        {"$set": {"failed_attempts": 0}}
    )

    # Trigger Successful Login alert
    send_login_alert(user.username)

    token = create_access_token({"sub": db_user["username"]})

    # Return user info including role
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "username": db_user["username"],
            "email": db_user.get("email", ""),
            "role": db_user.get("role", "user")
        }
    }

@router.post("/register")
def register(user: RegisterRequest):
    # Check if username already exists
    existing_user = db["users"].find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check if email already exists
    existing_email = db["users"].find_one({"email": user.email})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Hash password
    hashed_password = get_password_hash(user.password)
    
    # Create new user (default role is "user")
    new_user = {
        "username": user.username,
        "email": user.email,
        "password": hashed_password,
        "role": "user"
    }
    
    db["users"].insert_one(new_user)
    
    return {"message": "User registered successfully"}
