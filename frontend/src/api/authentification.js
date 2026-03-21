const API_URL = "http://127.0.0.1:8000";

// Signup
export async function signup(username, email, password) {
    const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
        throw new Error("Signup failed")
    }
    return response.json();
}

//Login
export async function login(username, password) {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        throw new Error("Login failed");
    }

    const data = await response.json()
    localStorage.setItem("token", data.access_token);
    return data;
}

export function getToken() {
    return localStorage.getItem("token");
}

//logout
export function logout() {
    localStorage.removeItem("token");
}