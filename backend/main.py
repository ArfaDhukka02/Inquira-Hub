from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import bcrypt
from db import get_db_connection


app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}

class UserCreate(BaseModel):
    username: str
    email: str
    password: str


@app.post("/signup")
def signup(user: UserCreate):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM users WHERE username=%s or email=%s", (user.username, user.email))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username or email already exists")
        
        hash_pw = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        cursor.execute("INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
                    (user.username, user.email, hash_pw))
        
        conn.commit()
        cursor.close()
        conn.close()
        return {"message": "Account created successfully"}
    except Exception as e:
        return {"error": str(e)}
    
    finally:
        if conn:
            conn.close()



