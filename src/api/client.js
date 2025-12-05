// src/api/client.js
const API_BASE_URL = "https://dental-clinic-backend-4yfs.onrender.com/api";

export async function apiClient(path, { method = "GET", token, body } = {}) {
  const headers = {
    "Content-Type": "application/json",
  };

  // ✅ correct Authorization header
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // optional: simple auto-logout trigger for invalid token
  if (res.status === 401 || res.status === 403) {
    const text = await res.text();
    throw new Error(text || "Unauthorized (token expired or invalid)");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return res.status === 204 ? null : res.json();
}
