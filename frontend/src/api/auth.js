const API_URL = "http://127.0.0.1:8000";

export async function signup(username, email, password) {
    const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Signup failed");
    }
    return res.json();
}

export async function login(email, password) {
    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Login failed");
    }
    const data = await res.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);
    localStorage.setItem("user_id", data.user_id);
    return data;
}

export function getToken() {
    return localStorage.getItem("token");
}

export function getUsername() {
    return localStorage.getItem("username");
}

export function getUserId() {
    return parseInt(localStorage.getItem("user_id"));
}

export function isLoggedIn() {
    return !!localStorage.getItem("token");
}

export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
}