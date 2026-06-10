# AI Customer Support Agent — E-commerce Refund Automation

An AI-powered customer support agent that autonomously processes refund requests using a deterministic eligibility engine, LangGraph agent loop, and hardened system prompt.

## Architecture

```
Data → Engine → Tools → Agent (LangGraph) → API (FastAPI) → UI (React/Tailwind)
```

**Key principle:** The LLM handles language and orchestration. The **verdict (APPROVE/DENY/ESCALATE) is computed by deterministic Python code** that cannot be overridden by prompt injection.

## Quick Start

### Backend

```bash
cd backend
source ../venv/bin/activate
cp .env.example .env          # Add your LLM API key
python scripts/seed_db.py     # Verify seed data
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Tests

```bash
cd backend
source ../venv/bin/activate
python -m pytest tests/ -v
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `LLM_PROVIDER` | `openai` | `openai` or `anthropic` |
| `OPENAI_API_KEY` | — | Required if using OpenAI |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model |
| `ANTHROPIC_API_KEY` | — | Required if using Anthropic |
| `ANTHROPIC_MODEL` | `claude-haiku-4-5-20251001` | Anthropic model |

## Policy Rules

| Rule | Description | Verdict |
|---|---|---|
| R1 | Final-sale items | DENIED |
| R2 | Amount > $500 | ESCALATED |
| R3 | Past 30-day window | DENIED |
| R4 | Wrong customer | DENIED |
| R5 | Already refunded | DENIED |
| R6 | Damaged overrides R1 | APPROVED (if other rules pass) |

## Seed Data Edge Cases

- **CUST-001/ORD-1002**: Final sale item (R1)
- **CUST-002/ORD-2001**: >$500 order (R2)
- **CUST-003/ORD-3001**: Out of refund window (R3)
- **CUST-004/ORD-4001**: Already refunded (R5)
- **CUST-006/ORD-6001**: Damaged + final sale (R6 override)
- **CUST-011/ORD-11001**: >$500 order (R2)
