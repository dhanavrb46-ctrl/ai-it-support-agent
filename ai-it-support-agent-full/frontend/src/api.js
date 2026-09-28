const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: (token) => request("/auth/me", { token }),

  sendMessage: (token, payload) => request("/chat/message", { method: "POST", body: payload, token }),
  myChats: (token) => request("/chat/my-chats", { token }),
  chatHistory: (token, id) => request(`/chat/history/${id}`, { token }),

  listTickets: (token, query = "") => request(`/tickets${query}`, { token }),
  getTicket: (token, id) => request(`/tickets/${id}`, { token }),
  updateTicket: (token, id, payload) => request(`/tickets/${id}`, { method: "PATCH", body: payload, token }),
};
