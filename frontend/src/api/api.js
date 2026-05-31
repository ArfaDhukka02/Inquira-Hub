import { getToken } from "./auth";

const API_URL = "http://127.0.0.1:8000";

function authHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: getToken(),
    };
}

// Questions
export async function fetchQuestions(search = "", tag = "") {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (tag) params.append("tag", tag);
    const res = await fetch(`${API_URL}/questions?${params}`);
    if (!res.ok) throw new Error("Failed to fetch questions");
    return res.json();
}

export async function fetchQuestion(id) {
    const res = await fetch(`${API_URL}/questions/${id}`);
    if (!res.ok) throw new Error("Question not found");
    return res.json();
}

export async function createQuestion(title, body, tags) {
    const res = await fetch(`${API_URL}/questions`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ title, body, tags }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to post question");
    }
    return res.json();
}

// Answers
export async function postAnswer(question_id, body) {
    const res = await fetch(`${API_URL}/answers`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ question_id, body, ai_generated: false }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to post answer");
    }
    return res.json();
}

export async function acceptAnswer(answer_id) {
    const res = await fetch(`${API_URL}/answers/accept`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ answer_id }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to accept answer");
    }
    return res.json();
}

// AI Answer
export async function requestAIAnswer(question_id) {
    const res = await fetch(`${API_URL}/ai-answer`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ question_id }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "AI answer failed");
    }
    return res.json();
}

// Votes
export async function vote(target_type, target_id, value) {
    const res = await fetch(`${API_URL}/vote`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ target_type, target_id, value }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Vote failed");
    }
    return res.json();
}
