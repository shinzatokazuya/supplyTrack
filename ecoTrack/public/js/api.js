// api.js
const API_BASE = "http://localhost:3001";

async function apiGet(path) {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

async function apiPost(path, body) {
    const res = await fetch(`${API_BASE}${path}`), {
        method: "POST",
        
    }
}
