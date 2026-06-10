# Full Session Log — AI Customer Support Challenge
**Date:** June 10, 2026  
**Author:** Harsha (assisted by Cascade + Claude Code)  
**Project:** AI Customer Support Agent — E-commerce Refund Automation

---

## Timeline of Everything We Did

### Session 1 — Workspace Setup & Challenge Planning (01:15 – 01:35)

#### 1.1 Workspace Initialization
- **What:** Created the workspace from an empty directory.
- **Actions:**
  - Created Python virtual environment (`venv/`)
  - Created `requirements.txt` with initial GCP + FastAPI deps
  - Created `.gitignore`
  - Created `CLAUDE.md` — hook for Claude Code to auto-log sessions
  - Created `.devin/rules.md` — hook for Cascade to auto-log sessions
  - Created `.devin/workflows/session-logger.md` — `/session-logger` slash command
  - Created `logs/session_logger.py` — shared CLI tool for structured session logging
  - Created `logs/sessions/` — folder where all session markdown logs land
  - Created `docs/` — folder for planning documents

- **Key Decision:** Both Cascade and Claude Code feed into the same `logs/sessions/` folder using a shared `session_logger.py` script. This ensures a unified log regardless of which AI tool is used.

- **Files Created:**
  ```
  venv/                              (Python 3.10+ virtual environment)
  .gitignore
  requirements.txt
  CLAUDE.md                          (Claude Code workspace hook)
  .devin/rules.md                    (Cascade workspace hook)
  .devin/workflows/session-logger.md (session logging workflow)
  logs/session_logger.py             (CLI: start/idea/thought/decision/code/summary)
  logs/sessions/                     (auto-populated session logs)
  docs/                              (planning documents)
  ```

#### 1.2 Challenge Received & Analyzed
- **What:** Received the full "AI Agent" Full-Stack Automation Challenge brief.
- **Challenge Summary:**
  - Build a fully functional web app: AI Customer Support Agent that processes/denies e-commerce refunds.
  - 3 components: (1) Synthetic CRM data + refund policy, (2) Backend with agent loop, (3) Frontend with chat + admin dashboard.
  - Must handle edge cases, prompt injection, policy violations.
  - Deliverable: working repo + 5-min Loom video.
  - Evaluation: product completeness, agent resilience, system architecture.
  - Timeline: ~8–10 hrs active dev, 9 calendar days.

#### 1.3 Stack Decision
- **Decision:** Local-first, NO cloud (challenge doesn't require it).
- **Stack chosen:**
  - **Backend:** FastAPI + LangGraph + OpenAI/Anthropic function-calling
  - **Frontend:** React + Vite + TailwindCSS
  - **Data:** SQLite (via SQLModel) + seeded JSON
  - **Agent:** LangGraph state machine with deterministic eligibility engine
  - **Tracing:** Custom TraceStep model (latency, tokens, retries per step)

#### 1.4 Three Planning Documents Drafted
All three saved in `docs/`:

1. **`docs/01_REQUIREMENTS.md`** (10.5 KB)
   - Purpose, scope, stakeholders/actors
   - 20+ functional requirements (FR-1.x through FR-3.x) across all 3 components
   - Non-functional requirements (reliability, resilience, observability, architecture, security)
   - Policy-to-logic mapping: 6 rules (R1–R6) with exact deterministic checks
   - 10 edge cases / adversarial scenarios that must be handled
   - Deliverables checklist, evaluation criteria, timeline, risks & mitigations

2. **`docs/02_SOLUTION_IDEA.md`** (7.4 KB)
   - **Core insight:** Separate *judgment* from *decision* — LLM handles language/orchestration, deterministic Python code owns the APPROVE/DENY/ESCALATE verdict
   - "Hands, Eyes, Rulebook" mental model with diagrams
   - Why LangGraph (state machine = trace = admin dashboard)
   - Decision flow diagram (agent → tools → eligibility → act)
   - Resilience strategy table (6 attack types, each defense)
   - Defense-in-depth: hardened prompt (layer 1) + tool guards (layer 2) + deterministic engine (layer 3)
   - Observability as first-class feature (trace is a product, not afterthought)
   - Build sequencing philosophy (data → engine → tools → agent → API → UI)
   - What to add before production

3. **`docs/03_IMPLEMENTATION_PLAN.md`** (26.4 KB)
   - Technology choices table with justifications
   - Full repository structure (every file and its purpose)
   - Code snippets: Pydantic models, eligibility engine, tools with re-validation guards, hardened system prompt, LangGraph agent loop, tracer, FastAPI endpoints, data generation script, React API client
   - Package lists (backend requirements.txt + frontend package.json)
   - `.env.example` config
   - Testing strategy (unit tests for deterministic engine + adversarial prompt tests)
   - Phased execution plan (8 phases, ~8–10 hrs)
   - Run commands (3 commands to backend, 2 to frontend)
   - Loom script outline (5-min walkthrough structure)
   - Definition of done checklist

#### 1.5 Research: Spec-to-App Auto-Build Tools
- **What:** Searched for tools/frameworks that can take spec docs and auto-build end-to-end.
- **Researched 6 categories:**

  | Tool | What it does | Verdict |
  |---|---|---|
  | **Ralph Loop** | Import PRD → autonomous Claude Code loop (plan → implement → test → verify → repeat) | Best fit for "walk away and let it build" |
  | **Superpowers** | Skills framework for Claude/Cursor/Gemini; enforces brainstorm → plan → TDD → subagent dev → code review → merge | Best quality + enforced TDD |
  | **Claude Task Master** | PRD → structured task tree with dependencies → Claude executes in order | Most granular control |
  | **Firebase Studio** | Browser-based prompt → full-stack app | Good for UI, not enough control for agent logic |
  | **Bolt.new / Lovable / V0** | Browser SPA builders | Fast frontend, weak on custom backend |
  | **Cascade Skills** | Bundle docs + steps into `.devin/workflows/` | Already have this; can extend |

---

### Session 2 — Doc Refinement (01:43 – 02:00)

#### 2.1 Reviewed and Updated All 3 Docs
- **What:** Cross-checked docs against original challenge requirements and updated for accuracy.
- **Changes made:**
  - Pinned package versions to latest stable: LangGraph 1.2+, FastAPI 0.136+, Pydantic 2.13+, React 19, Tailwind v4, `uv` as package manager
  - Rewrote LangGraph code to use correct modern API: `ToolNode`, `tools_condition`, `MessagesState`, `START` constant
  - Fixed `TRACE_STORE` reference in API endpoints
  - Added injectable `now` parameter to eligibility engine for testability
  - Added `/health` endpoint to FastAPI
  - Clarified R6 rule (damaged/defective exception) with explicit conditions
  - Updated model IDs (e.g., `claude-haiku-4-5-20251001` replaces `claude-3-5-haiku-latest`)

---

### Session 3 — Scaffold & Build (02:15 – 02:51)

#### 3.1 Ralph Loop Initiated for Phase 0 Scaffold
- **Decision:** Started using Ralph Loop pattern to scaffold the project from the planning docs.

#### 3.2 Backend Built
All files under `backend/`:

| File | Purpose | Size |
|---|---|---|
| `app/main.py` | FastAPI app, CORS, `/api/chat`, `/api/runs`, `/api/runs/{id}/trace`, `/health` | 3.2 KB |
| `app/config.py` | Settings from env vars (LLM provider, model, keys, thresholds) | 243 B |
| `app/models.py` | Pydantic models: Customer, Order, OrderItem, Decision, EligibilityResult, TraceStep, ChatResponse | 1.3 KB |
| `app/db.py` | SQLite/JSON data access: get_customer, get_order, find_orders | 1.4 KB |
| `app/engine/eligibility.py` | **Deterministic verdict engine** — R1–R6 rules, pure Python, no LLM | 1.8 KB |
| `app/tools/tools.py` | Tool definitions: lookup_customer, list_orders, get_order, get_refund_policy, check_eligibility, issue_refund (with re-validation guard), escalate_to_human | 2.5 KB |
| `app/agent/graph.py` | LangGraph state machine: agent_node → tool_node loop with conditional edges | 1.9 KB |
| `app/agent/prompts.py` | Hardened system prompt — non-negotiable rules, process, injection defense | 1.4 KB |
| `app/agent/llm.py` | Swappable LLM client wrapper (OpenAI/Anthropic via env var) | 646 B |
| `app/policy/refund_policy.md` | Source-of-truth refund policy text (R1–R6 human-readable) | 1.7 KB |
| `app/policy/__init__.py` | `load_policy()` helper | 149 B |
| `app/trace/tracer.py` | TraceStep capture: latency, tokens, retries, errors | 1.2 KB |
| `data/seed/customers.json` | 15 customer profiles + order histories with deliberate edge cases | 10.6 KB |
| `scripts/seed_db.py` | Load seed JSON → SQLite | 982 B |
| `tests/test_eligibility.py` | Unit tests for deterministic engine (all R1–R6 rules) | 3.9 KB |
| `tests/test_adversarial.py` | Prompt injection / resilience tests against the agent | 4.5 KB |
| `tests/test_e2e.py` | End-to-end API tests | 13.8 KB |
| `pyproject.toml` | Python project config | 472 B |
| `.env.example` | Environment variable template | 347 B |
| `.env` | Active env config (local, gitignored) | 347 B |

#### 3.3 Frontend Built
All files under `frontend/`:

| File | Purpose | Size |
|---|---|---|
| `src/App.tsx` | Main app with tab navigation (Chat / Admin) | 1.8 KB |
| `src/api.ts` | API client — `sendMessage()`, `getRuns()`, `getTrace()` | 1.2 KB |
| `src/components/ChatWindow.tsx` | Customer chat UI — message list, input, streaming responses | 4.3 KB |
| `src/components/AdminDashboard.tsx` | Run list + trace timeline viewer | 3.4 KB |
| `src/components/TraceStepCard.tsx` | Expandable step card: tool I/O, latency, tokens, retries, red on error | 2.6 KB |
| `src/components/DecisionBadge.tsx` | APPROVED/DENIED/ESCALATED badge with color coding | 646 B |
| `src/App.css` | Styles | 2.9 KB |
| `src/main.tsx` | React entry point | 230 B |
| `vite.config.ts` | Vite config with API proxy to backend | 261 B |
| `package.json` | React 19 + Vite + TailwindCSS + deps | 805 B |
| `index.html` | HTML shell | 360 B |

#### 3.4 Configuration & Infrastructure Files
| File | Purpose |
|---|---|
| `CLAUDE.md` | Claude Code hook — instructs auto-logging for every session |
| `.devin/rules.md` | Cascade hook — instructs auto-logging for every session |
| `.devin/workflows/session-logger.md` | `/session-logger` workflow |
| `logs/session_logger.py` | Shared CLI logging tool |
| `README.md` | Project overview + setup instructions |
| `.gitignore` | Standard Python/Node ignores |

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React + Vite + TailwindCSS                                  │
│  ┌──────────────┐  ┌────────────────────────────┐           │
│  │ ChatWindow   │  │ AdminDashboard             │           │
│  │ (customer)   │  │ (run list + trace timeline)│           │
│  └──────┬───────┘  └─────────────┬──────────────┘           │
│         │ POST /api/chat         │ GET /api/runs, /trace     │
└─────────┼────────────────────────┼──────────────────────────┘
          │                        │
          ▼                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      FASTAPI BACKEND                         │
│  main.py — /api/chat, /api/runs, /api/runs/{id}/trace       │
│                                                              │
│  ┌──────────────────────────────────────────┐               │
│  │            LANGGRAPH AGENT               │               │
│  │  agent_node ←→ tool_node (loop)          │               │
│  │  prompts.py (hardened system prompt)      │               │
│  │  llm.py (swappable: OpenAI/Anthropic)    │               │
│  └───────────────────┬──────────────────────┘               │
│                      │ calls                                 │
│  ┌───────────────────▼──────────────────────┐               │
│  │              TOOLS LAYER                  │               │
│  │  lookup_customer, get_order, list_orders  │               │
│  │  get_refund_policy, check_eligibility     │               │
│  │  issue_refund (re-validates!), escalate   │               │
│  └───────────────────┬──────────────────────┘               │
│                      │ calls                                 │
│  ┌───────────────────▼──────────────────────┐               │
│  │      DETERMINISTIC ELIGIBILITY ENGINE     │  ◄── SOURCE  │
│  │  R1: final sale → DENY                    │     OF TRUTH │
│  │  R2: >$500 → ESCALATE                    │               │
│  │  R3: >30 days → DENY                     │               │
│  │  R4: wrong owner → DENY                  │               │
│  │  R5: already refunded → DENY             │               │
│  │  R6: damaged exception                   │               │
│  └──────────────────────────────────────────┘               │
│                                                              │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐     │
│  │ tracer.py    │  │ db.py         │  │ refund_      │     │
│  │ (latency,    │  │ (SQLite from  │  │ policy.md    │     │
│  │  tokens,     │  │  seed JSON)   │  │ (text rules) │     │
│  │  retries)    │  │               │  │              │     │
│  └──────────────┘  └───────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Design Decisions (and why)

| # | Decision | Rationale |
|---|---|---|
| 1 | **Deterministic eligibility engine** — verdict is computed by Python code, not LLM | Un-jailbreakable. No amount of "ignore instructions" changes a Python `if`. This is the core resilience guarantee. |
| 2 | **`issue_refund` re-validates** internally before executing | Defense-in-depth. Even if the LLM is tricked into calling the tool, the tool re-runs eligibility and rejects. |
| 3 | **LangGraph** over raw function-calling | Explicit state machine = the trace IS the admin dashboard. Each node is a step. Built-in tool loop + observability. |
| 4 | **Trace as a product feature** | Challenge explicitly evaluates tool I/O, retries, latency, token cost. TraceStep model captures all of these per step. |
| 5 | **Local-first, no cloud** | Challenge doesn't require cloud. SQLite + seeded JSON = zero-config, works offline. Only an LLM API key needed. |
| 6 | **Hardened system prompt + facts from tools only** | LLM reads facts from DB via tools, never from user claims. Customer can lie — tools don't. |
| 7 | **Unified session logging** (Cascade + Claude Code) | Both tools write to same `logs/sessions/` via shared `session_logger.py`. Full thought trail for documentation. |

---

## Current File Tree (as of Session 3)

```
AI Customer Support/
├── .devin/
│   ├── rules.md                         (Cascade auto-logging hook)
│   └── workflows/
│       └── session-logger.md            (/session-logger workflow)
├── backend/
│   ├── .env / .env.example              (LLM key + config)
│   ├── pyproject.toml
│   ├── app/
│   │   ├── main.py                      (FastAPI: /api/chat, /api/runs, /health)
│   │   ├── config.py                    (env-driven settings)
│   │   ├── models.py                    (Pydantic: Customer, Order, Decision, TraceStep, etc.)
│   │   ├── db.py                        (SQLite/JSON data access)
│   │   ├── agent/
│   │   │   ├── graph.py                 (LangGraph state machine)
│   │   │   ├── prompts.py               (hardened system prompt)
│   │   │   └── llm.py                   (swappable LLM client)
│   │   ├── engine/
│   │   │   └── eligibility.py           (deterministic R1–R6 verdict engine)
│   │   ├── tools/
│   │   │   └── tools.py                 (6 tools with re-validation guards)
│   │   ├── policy/
│   │   │   ├── __init__.py              (load_policy helper)
│   │   │   └── refund_policy.md         (source-of-truth policy text)
│   │   └── trace/
│   │       └── tracer.py                (latency/tokens/retries capture)
│   ├── data/seed/
│   │   └── customers.json               (15 customers + orders, edge cases)
│   ├── scripts/
│   │   └── seed_db.py                   (JSON → SQLite loader)
│   └── tests/
│       ├── test_eligibility.py          (deterministic engine unit tests)
│       ├── test_adversarial.py          (prompt injection resilience tests)
│       └── test_e2e.py                  (end-to-end API tests)
├── frontend/
│   ├── package.json                     (React 19 + Vite + Tailwind)
│   ├── vite.config.ts                   (API proxy to backend)
│   ├── src/
│   │   ├── App.tsx                      (tabs: Chat / Admin)
│   │   ├── api.ts                       (API client)
│   │   └── components/
│   │       ├── ChatWindow.tsx           (customer chat UI)
│   │       ├── AdminDashboard.tsx       (run list + trace timeline)
│   │       ├── TraceStepCard.tsx        (expandable step: I/O, latency, tokens)
│   │       └── DecisionBadge.tsx        (APPROVED/DENIED/ESCALATED badge)
│   └── index.html
├── docs/
│   ├── 01_REQUIREMENTS.md               (functional + non-functional reqs)
│   ├── 02_SOLUTION_IDEA.md              (approach + resilience strategy)
│   └── 03_IMPLEMENTATION_PLAN.md        (full plan + code snippets)
├── logs/
│   ├── session_logger.py                (shared CLI logging tool)
│   ├── sessions/
│   │   ├── session_20260610_011653.md   (Session 1 log)
│   │   ├── session_20260610_014306.md   (Session 2 log)
│   │   └── session_20260610_021501.md   (Session 3 log)
│   └── FULL_SESSION_LOG.md              (THIS FILE)
├── CLAUDE.md                            (Claude Code workspace hook)
├── README.md                            (setup instructions)
├── requirements.txt                     (root-level deps, initial)
└── .gitignore
```

---

## What's Next (remaining work)

| Phase | Task | Status |
|---|---|---|
| Phase 0 — Scaffold | Repo structure, venv, requirements, configs | ✅ Done |
| Phase 1 — Seed Data | 15 customers + orders JSON, refund policy, seed_db.py | ✅ Done |
| Phase 2 — Eligibility Engine | Deterministic R1–R6 engine + unit tests | ✅ Built, needs test run |
| Phase 3 — Tools | 6 tools with JSON schemas + guards | ✅ Built |
| Phase 4 — Agent Loop | LangGraph + hardened prompt + LLM wrapper | ✅ Built, needs integration test |
| Phase 5 — Tracing + API | TraceStep capture, FastAPI endpoints | ✅ Built, needs integration test |
| Phase 6 — Frontend | React chat + admin dashboard | ✅ Built, needs visual polish |
| Phase 7 — Testing + Polish | Adversarial tests, README, edge-case fixes | 🔲 Pending |
| Phase 8 — Loom | Record ≤5 min walkthrough | 🔲 Pending |

**Immediate priorities:**
1. Run `test_eligibility.py` — verify deterministic engine passes all edge cases.
2. Run the backend (`uvicorn`) and confirm `/api/chat` works end-to-end.
3. Run the frontend (`npm run dev`) and test chat + admin dashboard visually.
4. Run adversarial tests against the live agent.
5. Polish UI, fix any bugs, record Loom.

---

## Tools & Research Explored

| Tool | Type | URL | Relevance |
|---|---|---|---|
| **Ralph Loop** | Autonomous dev loop for Claude Code | github.com/frankbria/ralph-claude-code | Can import PRD → auto-build |
| **Superpowers** | Skills framework (Claude/Cursor/Gemini) | github.com/obra/superpowers | TDD-first + subagent dev |
| **Claude Task Master** | PRD → task tree decomposer | github.com/eyaltoledano/claude-task-master | Granular task management |
| **Firebase Studio** | Browser-based full-stack builder | firebase.studio | Fast prototyping, less control |
| **Bolt.new / Lovable / V0** | Browser SPA builders | bolt.new / lovable.dev / v0.dev | Fast frontend, weak backend |
