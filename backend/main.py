from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import bcrypt
import httpx
import os
from db import get_db_connection
from dotenv import load_dotenv
 
load_dotenv()
 
app = FastAPI()
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
# Auth helpers
 
def get_user_from_token(token: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE token=%s", (token,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    return user
 
 
# Models
 
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
 
class UserLogin(BaseModel):
    email: str
    password: str
 
class QuestionCreate(BaseModel):
    title: str
    body: str
    tags: Optional[str] = ""
 
class AnswerCreate(BaseModel):
    question_id: int
    body: str
    ai_generated: Optional[bool] = False
 
class VoteRequest(BaseModel):
    target_type: str
    target_id: int
    value: int   
 
class AcceptAnswer(BaseModel):
    answer_id: int
 
class AIAnswerRequest(BaseModel):
    question_id: int
 
 
# Auth
 
@app.post("/signup")
def signup(user: UserCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE username=%s OR email=%s", (user.username, user.email))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username or email already exists")
        hash_pw = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()
        cursor.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
            (user.username, user.email, hash_pw)
        )
        conn.commit()
        return {"message": "Account created successfully"}
    finally:
        cursor.close()
        conn.close()
 
 
@app.post("/login")
def login(user: UserLogin):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM users WHERE email=%s", (user.email,))
        db_user = cursor.fetchone()
        if not db_user or not bcrypt.checkpw(user.password.encode(), db_user["password_hash"].encode()):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        import secrets
        token = secrets.token_hex(32)
        cursor.execute("UPDATE users SET token=%s WHERE id=%s", (token, db_user["id"]))
        conn.commit()
        return {"token": token, "username": db_user["username"], "user_id": db_user["id"]}
    finally:
        cursor.close()
        conn.close()
 
 
# Questions
 
@app.post("/questions")
def create_question(q: QuestionCreate, authorization: str = Header(...)):
    user = get_user_from_token(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO questions (user_id, title, body, tags) VALUES (%s, %s, %s, %s)",
            (user["id"], q.title, q.body, q.tags)
        )
        conn.commit()
        return {"message": "Question posted", "id": cursor.lastrowid}
    finally:
        cursor.close()
        conn.close()
 
 
@app.get("/questions")
def list_questions(search: Optional[str] = None, tag: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT q.*, u.username,
                   COUNT(DISTINCT a.id) AS answer_count,
                   COALESCE(SUM(v.value), 0) AS vote_score
            FROM questions q
            JOIN users u ON q.user_id = u.id
            LEFT JOIN answers a ON a.question_id = q.id
            LEFT JOIN votes v ON v.target_type='question' AND v.target_id = q.id
        """
        params = []
        conditions = []
        if search:
            conditions.append("(q.title LIKE %s OR q.body LIKE %s)")
            params += [f"%{search}%", f"%{search}%"]
        if tag:
            conditions.append("q.tags LIKE %s")
            params.append(f"%{tag}%")
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        query += " GROUP BY q.id ORDER BY q.created_at DESC"
        cursor.execute(query, params)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
 
 
@app.get("/questions/{question_id}")
def get_question(question_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT q.*, u.username, COALESCE(SUM(v.value), 0) AS vote_score
            FROM questions q
            JOIN users u ON q.user_id = u.id
            LEFT JOIN votes v ON v.target_type='question' AND v.target_id = q.id
            WHERE q.id = %s GROUP BY q.id
        """, (question_id,))
        question = cursor.fetchone()
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        cursor.execute("""
            SELECT a.*, u.username, COALESCE(SUM(v.value), 0) AS vote_score
            FROM answers a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN votes v ON v.target_type='answer' AND v.target_id = a.id
            WHERE a.question_id = %s
            GROUP BY a.id
            ORDER BY a.is_accepted DESC, vote_score DESC
        """, (question_id,))
        question["answers"] = cursor.fetchall()
        return question
    finally:
        cursor.close()
        conn.close()
 
 
# Answers
 
@app.post("/answers")
def post_answer(ans: AnswerCreate, authorization: str = Header(...)):
    user = get_user_from_token(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO answers (question_id, user_id, body, ai_generated) VALUES (%s, %s, %s, %s)",
            (ans.question_id, user["id"], ans.body, ans.ai_generated)
        )
        conn.commit()
        return {"message": "Answer posted", "id": cursor.lastrowid}
    finally:
        cursor.close()
        conn.close()
 
 
@app.post("/answers/accept")
def accept_answer(req: AcceptAnswer, authorization: str = Header(...)):
    user = get_user_from_token(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT q.user_id, a.question_id FROM answers a JOIN questions q ON q.id = a.question_id WHERE a.id=%s",
            (req.answer_id,)
        )
        row = cursor.fetchone()
        if not row or row["user_id"] != user["id"]:
            raise HTTPException(status_code=403, detail="Only the question author can accept an answer")
        cursor.execute("UPDATE answers SET is_accepted=0 WHERE question_id=%s", (row["question_id"],))
        cursor.execute("UPDATE answers SET is_accepted=1 WHERE id=%s", (req.answer_id,))
        conn.commit()
        return {"message": "Answer accepted"}
    finally:
        cursor.close()
        conn.close()
 
 
# Votes
 
@app.post("/vote")
def vote(req: VoteRequest, authorization: str = Header(...)):
    user = get_user_from_token(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    if req.value not in (1, -1):
        raise HTTPException(status_code=400, detail="Vote value must be 1 or -1")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT * FROM votes WHERE user_id=%s AND target_type=%s AND target_id=%s",
            (user["id"], req.target_type, req.target_id)
        )
        existing = cursor.fetchone()
        if existing:
            if existing["value"] == req.value:
                cursor.execute("DELETE FROM votes WHERE id=%s", (existing["id"],))
                msg = "Vote removed"
            else:
                cursor.execute("UPDATE votes SET value=%s WHERE id=%s", (req.value, existing["id"]))
                msg = "Vote updated"
        else:
            cursor.execute(
                "INSERT INTO votes (user_id, target_type, target_id, value) VALUES (%s, %s, %s, %s)",
                (user["id"], req.target_type, req.target_id, req.value)
            )
            msg = "Vote recorded"
        conn.commit()
        # Return updated score
        cursor.execute(
            "SELECT COALESCE(SUM(value), 0) as score FROM votes WHERE target_type=%s AND target_id=%s",
            (req.target_type, req.target_id)
        )
        new_score = cursor.fetchone()["score"]
        return {"message": msg, "score": int(new_score)}
    finally:
        cursor.close()
        conn.close()
 
 
# ── AI Answer
 
@app.post("/ai-answer")
async def ai_answer(req: AIAnswerRequest, authorization: str = Header(...)):
    user = get_user_from_token(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
 
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM questions WHERE id=%s", (req.question_id,))
        question = cursor.fetchone()
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
    finally:
        cursor.close()
        conn.close()
 
    prompt = f"""You are a helpful technical assistant on a Q&A platform similar to Stack Overflow.
Answer the following question clearly and concisely. Use code examples where appropriate.
 
Question Title: {question['title']}
 
Question Body: {question['body']}
 
Provide a well-structured, accurate answer."""
 
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AI service not configured")
 
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-5",
                "max_tokens": 1000,
                "messages": [{"role": "user", "content": prompt}]
            },
            timeout=30.0
        )
 
    if response.status_code != 200:
        error_detail = response.json()
        print(f"Anthropic API error: {response.status_code} - {error_detail}")
        raise HTTPException(status_code=500, detail=f"AI service error: {error_detail}")
 
    ai_text = response.json()["content"][0]["text"]
 
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO answers (question_id, user_id, body, ai_generated) VALUES (%s, %s, %s, %s)",
            (req.question_id, user["id"], ai_text, True)
        )
        conn.commit()
        return {"answer": ai_text, "id": cursor.lastrowid}
    finally:
        cursor.close()
        conn.close()