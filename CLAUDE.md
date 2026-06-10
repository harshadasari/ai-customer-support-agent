# CLAUDE.md — AI Customer Support Challenge

## Session Logging (MANDATORY)

Every conversation in this workspace MUST be logged to `logs/sessions/`.
The logger script is at `logs/session_logger.py`.

### At the START of every chat session:
```bash
python3 logs/session_logger.py start
```

### During the session — log as they occur:
```bash
python3 logs/session_logger.py idea "description"
python3 logs/session_logger.py thought "description"
python3 logs/session_logger.py decision "what was decided and why"
python3 logs/session_logger.py code "what changed and why"
```

### At the END of each session:
```bash
python3 logs/session_logger.py summary "what was accomplished"
```

---

## Challenge Context

- **Project**: AI Automation Web App (end-to-end challenge)
- **Stack**: Python + GCP (Vertex AI, Cloud Run, FastAPI)
- **Logs purpose**: Capture AI reasoning, design decisions, and progress for documentation and challenge judging.

---

## General Rules

- Always explain your reasoning before implementing.
- Log every non-trivial decision with its rationale.
- Keep session logs human-readable and well-structured.
- Activate the virtual environment before running Python: `source venv/bin/activate`
