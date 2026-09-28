# AI IT Support Agent — Backend (Step 1: Project Setup)

## What's included in this step

```
backend/
├── config/
│   └── db.js              # MongoDB Atlas connection
├── models/
│   ├── User.js             # Employee / Admin / ITEngineer, password hashing
│   ├── Ticket.js            # Ticket lifecycle: Open → In Progress → Resolved → Closed
│   ├── BulkIncident.js       # Groups duplicate tickets (Bulk Incident Detection)
│   ├── ChatHistory.js         # Chatbot conversation log
│   └── KnowledgeBase.js        # IT docs used for RAG retrieval
├── middleware/
│   └── auth.js              # JWT verification + role-based access (protect, authorize)
├── controllers/
│   └── authController.js     # register, login, getMe
├── routes/
│   └── authRoutes.js          # /api/auth/register, /login, /me
├── server.js                   # Express app entry point
├── .env.example                 # Copy to .env and fill in your values
└── package.json
```

## Setup steps

1. **Install Node.js** (v18 or above) if you don't have it.

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Create a MongoDB Atlas cluster** (free tier)
   - Go to https://www.mongodb.com/cloud/atlas, sign up, create a free M0 cluster.
   - Create a database user (username + password).
   - Under "Network Access", allow access from anywhere (0.0.0.0/0) for development.
   - Copy the connection string.

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env`:
   - `MONGO_URI` — paste your Atlas connection string, replace `<username>`/`<password>`.
   - `JWT_SECRET` — any long random string (e.g. generate with `openssl rand -hex 32`).
   - `GROQ_API_KEY` — get a free key at https://console.groq.com (needed from Step 4 onward).

5. **Run the server**
   ```bash
   npm run dev
   ```
   You should see:
   ```
   MongoDB Connected: cluster0-xxxxx.mongodb.net
   Server running on port 5000
   ```

6. **Test it**
   - Health check: `GET http://localhost:5000/api/health`
   - Register: `POST http://localhost:5000/api/auth/register`
     ```json
     { "name": "Test User", "email": "test@company.com", "password": "test1234" }
     ```
   - Login: `POST http://localhost:5000/api/auth/login`
     ```json
     { "email": "test@company.com", "password": "test1234" }
     ```
     Response includes a `token` — use it as `Authorization: Bearer <token>` for protected routes.
   - Get profile: `GET http://localhost:5000/api/auth/me` (with the Bearer token)

## MongoDB Schema Overview

| Collection | Purpose |
|---|---|
| **users** | Employee / Admin / ITEngineer accounts, hashed passwords, roles |
| **tickets** | Every support ticket — category, priority, status, assigned engineer, links to bulk incident |
| **bulkincidents** | Groups multiple tickets reporting the same issue |
| **chathistories** | Full chatbot conversation per employee, flags whether RAG resolved it |
| **knowledgebases** | IT documentation used for RAG retrieval, linked to ChromaDB via `chromaId` |

## Next steps (not built yet)

- **Step 2:** Ticket routes/controller (create, list, update status) + Bulk Incident detection logic
- **Step 3:** RAG pipeline — LangChain + ChromaDB + Groq (chat route)
- **Step 4:** Urgency classification (LLM tags High/Medium/Low before ticket creation)
- **Step 5:** React frontend (chatbot UI + role dashboards)
- **Step 6:** Deployment (Vercel + Render)

Ask for any of these next and I'll build it the same way.
