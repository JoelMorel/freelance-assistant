# AI Freelance Assistant 🚀

A multi-platform AI assistant that aggregates freelance opportunities across **Upwork**, **RemoteOK**, and **We Work Remotely**, scores them against your tech stack (React, Node.js, Next.js, WordPress, SEO), and generates tailored proposal drafts with 1-click clipboard copy.

---

## 🏗️ Architecture

- **Backend (`backend/`)**: FastAPI server that:
  - Aggregates jobs concurrently from **Upwork**, **RemoteOK** (REST API), and **We Work Remotely** (RSS).
  - Scores every job **0–100%** using the AI match engine ([`services/scorer.py`](backend/services/scorer.py)).
  - Generates winning, context-aware proposals with hook, solution, and CTA questions using OpenAI ([`services/proposal_gen.py`](backend/services/proposal_gen.py)).
- **Frontend (`frontend/`)**: React 18 + Vite + Tailwind CSS dashboard:
  - Platform filter tabs (All, Upwork, RemoteOK, We Work Remotely).
  - Search keyword filtering.
  - Minimum match score selector (e.g., 85%+ Top Matches 🔥).
  - Modal with editable proposal draft, word counter, and 1-click copy.
- **Upwork MCP Integration**: Configured in `~/.gemini/config/mcp_config.json` pointing to `https://mcp.upwork.com/mcp` for direct AI agent integration.

---

## 🛠️ Quick Start

### 1. Start the Backend (Port 8000)
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```
API Documentation will be live at `http://localhost:8000/docs`.

### 2. Start the Frontend (Port 5173)
In a separate terminal:
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.
