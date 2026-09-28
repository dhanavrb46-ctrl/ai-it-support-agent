# AI IT Support Agent — Full Working Demo

A working prototype: employees chat with an AI assistant that answers common
IT questions instantly (RAG over a knowledge base + Groq LLM), and
auto-creates a classified, prioritized ticket when it can't help — grouping
duplicate tickets into a Bulk Incident automatically.

```
project/
├── backend/     Node.js + Express + MongoDB + Groq
└── frontend/    React (Vite) chatbot UI + ticket dashboard
```

> **Note on RAG:** the original plan used ChromaDB as a vector database.
> This build uses MongoDB's built-in text search instead of a separate
> ChromaDB server — same RAG concept (retrieve relevant docs, then generate
> a grounded answer with an LLM), but nothing extra to host, which makes the
> free-tier deployment below far simpler. You can swap in ChromaDB later
> without changing anything else.

---

## 1. Run it locally

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — your MongoDB Atlas connection string (see README inside `backend/` from Step 1 if you haven't set this up yet)
- `JWT_SECRET` — any long random string
- `GROQ_API_KEY` — free key from https://console.groq.com (sign up → API Keys → Create)

```bash
npm run seed   # loads 6 sample IT knowledge-base articles
npm run dev    # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

`.env` already points to `http://localhost:5000/api` for local dev — leave it as is.

```bash
npm run dev    # starts on http://localhost:5173
```

Open `http://localhost:5173` → Register an account → try the chat:
- Try **"my VPN isn't connecting"** → chatbot solves it instantly from the knowledge base.
- Try **"my monitor keeps flickering"** → chatbot can't find a match → auto-creates a ticket with an AI-classified priority/category. Check the **Tickets** tab.
- Register 3 different accounts and report the *same* issue from each within an hour → they'll auto-group into one **Bulk Incident** (visible in the Tickets table).

To act as IT staff (see all tickets, change status), manually edit that user's `role` field to `"ITEngineer"` or `"Admin"` in MongoDB Atlas (Collections → users → edit document) — self-signup only allows the `Employee` role, by design.

---

## 2. Deploy live (free tier)

### Step A — Backend on Render

1. Push this project to a GitHub repo.
2. Go to https://render.com → New → Web Service → connect your repo.
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add Environment Variables (same as your `.env`): `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `GROQ_API_KEY`, `GROQ_MODEL`, `CLIENT_URL` (set this to your Vercel URL once you have it in Step B).
5. Deploy. Note the live URL, e.g. `https://ai-it-support-backend.onrender.com`.
6. Run the seed script once from Render's Shell tab: `npm run seed`.

> Free Render services sleep after inactivity — the first request after a while takes ~30s to wake up. Fine for a demo/review.

### Step B — Frontend on Vercel

1. Go to https://vercel.com → Add New → Project → import the same GitHub repo.
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (auto-detected)
3. Add Environment Variable: `VITE_API_URL` = `https://ai-it-support-backend.onrender.com/api` (your Render URL from Step A, with `/api` at the end).
4. Deploy. Vercel gives you a live URL, e.g. `https://ai-it-support-agent.vercel.app`.
5. Go back to Render → update `CLIENT_URL` to this Vercel URL → redeploy backend (so CORS allows it).

That's it — share the Vercel link as your live demo.

---

## 3. What's implemented vs. what's a stretch goal

| Feature | Status |
|---|---|
| JWT auth, roles (Employee/Admin/ITEngineer) | ✅ Done |
| Chatbot with RAG (retrieval + Groq generation) | ✅ Done (MongoDB text search instead of ChromaDB) |
| Auto ticket creation + LLM urgency/category classification | ✅ Done |
| Bulk incident detection & grouping | ✅ Done |
| Role-based ticket dashboard | ✅ Done |
| Engineer resolution → pushed back into Knowledge Base | ✅ Backend supports it (`pushToKnowledgeBase` flag on ticket update) — add a UI form for it if you want it in the demo |
| Docker containerization | Not built — optional, mentioned in the original PPT as future scope |
