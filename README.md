# Inquira Hub

A full-stack Q&A platform inspired by Stack Overflow, built with **FastAPI**, **MySQL**, **React**, and **Tailwind CSS** — featuring AI-powered answers via the **Anthropic Claude API**.

---

## Features

- **Authentication** — Sign up, log in, log out with bcrypt-hashed passwords and token-based sessions
- **Questions** — Post questions with tags, browse the feed, search by keyword, filter by tag
- **Answers** — Post answers, accept the best answer (question author only)
- **Voting** — Upvote and downvote questions and answers with toggle-to-undo
- **AI Answers** — Any logged-in user can request a Claude-generated answer on any question
- **Protected Routes** — Ask Question page requires login

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI, uvicorn |
| Database | MySQL, mysql-connector-python |
| Auth | bcrypt, token-based sessions |
| AI | Anthropic Claude API (claude-sonnet-4-5) |
| Frontend | React 18, React Router v6 |
| Styling | Tailwind CSS |
| HTTP Client | httpx (backend), fetch (frontend) |

---

## Project Structure

```
inquira-hub/
├── backend/
│   ├── database/
│   │   └── schema.sql          # MySQL schema — 4 tables
│   ├── main.py                 # FastAPI app — 10+ endpoints
│   ├── db.py                   # DB connection helper
│   ├── .env                    # Your credentials (never commit this)
│   └── .env.example            # Template for environment variables
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/
    │   │   ├── auth.js         # Login, signup, token management
    │   │   └── api.js          # Questions, answers, votes, AI
    │   ├── components/
    │   │   ├── Navbar.jsx      # Auth-aware navigation
    │   │   ├── AnswerCard.jsx  # Answer display with voting + accept
    │   │   ├── VoteButtons.jsx # Reusable upvote/downvote
    │   │   └── TagBadge.jsx    # Clickable tag pill
    │   ├── pages/
    │   │   ├── Home.jsx            # Question feed with search + tag filter
    │   │   ├── QuestionDetail.jsx  # Full question + answers + AI button
    │   │   ├── AskQuestion.jsx     # Post a new question
    │   │   ├── Login.jsx
    │   │   └── Signup.jsx
    │   ├── App.js              # Router + protected routes
    │   └── index.js
    ├── package.json
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8.0+
- An [Anthropic API key](https://console.anthropic.com)

---

### 1. Database

```bash
mysql -u root -p < backend/database/schema.sql
```

On Windows (PowerShell):
```powershell
Get-Content backend/database/schema.sql | mysql -u root -p
```

---

### 2. Backend

**Install dependencies:**
```bash
cd backend
pip install fastapi uvicorn mysql-connector-python bcrypt httpx python-dotenv
```

**Create your `.env` file** inside `backend/`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=inquira_hub
ANTHROPIC_API_KEY=sk-ant-...
```

**Start the server:**
```bash
python -m uvicorn main:app --reload
```

Backend runs at `http://127.0.0.1:8000`

---

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/signup` | No | Create account |
| POST | `/login` | No | Log in, returns token |
| GET | `/questions` | No | List all questions (search, tag filter) |
| GET | `/questions/{id}` | No | Get question + answers |
| POST | `/questions` | Yes | Post a new question |
| POST | `/answers` | Yes | Post an answer |
| POST | `/answers/accept` | Yes | Accept an answer (author only) |
| POST | `/vote` | Yes | Upvote or downvote |
| POST | `/ai-answer` | Yes | Generate AI answer via Claude API |

---

## Environment Variables

| Variable | Description |
|---|---|
| `DB_HOST` | MySQL host (usually `localhost`) |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name (`inquira_hub`) |
| `ANTHROPIC_API_KEY` | Your Anthropic API key |

> ⚠️ Never commit your `.env` file. It is listed in `.gitignore`.

---

## Database Schema

```sql
users       — id, username, email, password_hash, token, created_at
questions   — id, user_id, title, body, tags, created_at
answers     — id, question_id, user_id, body, ai_generated, is_accepted, created_at
votes       — id, user_id, target_type, target_id, value
```

---

## Running Both Servers

You need two terminals running simultaneously:

**Terminal 1 — Backend:**
```bash
cd backend
python -m uvicorn main:app --reload
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```

Then open `http://localhost:3000` in your browser.

---

## Built With

- [FastAPI](https://fastapi.tiangolo.com/) — Python web framework
- [React](https://react.dev/) — Frontend library
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [Anthropic Claude API](https://docs.anthropic.com/) — AI answer generation
- [MySQL](https://www.mysql.com/) — Relational database

---

## Built by

https://github.com/ammarprasla
https://github.com/ArfaDhukka02
