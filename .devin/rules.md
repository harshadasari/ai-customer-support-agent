# Workspace Rules — AI Customer Support Challenge

## Session Logging (MANDATORY)

Every conversation in this workspace MUST be logged to `logs/sessions/`.

### At the START of every chat session:
1. Create a new session log by running: `python3 logs/session_logger.py start`
2. Note the session filename — all entries for this conversation go there.

### During the session — log the following as they occur:
- **Ideas**: `python3 logs/session_logger.py idea "description"`
- **Reasoning / Thoughts**: `python3 logs/session_logger.py thought "description"`
- **Architecture decisions**: `python3 logs/session_logger.py decision "description"`
- **Code changes**: `python3 logs/session_logger.py code "what changed and why"`

### At the END of each session:
- Write a brief summary: `python3 logs/session_logger.py summary "what was accomplished"`

---

## Challenge Context

- **Project**: AI Automation Web App (end-to-end challenge)
- **Stack**: Python + GCP (Vertex AI, Cloud Run, etc.)
- **Logs purpose**: Track AI reasoning, design decisions, and progress for documentation and judging.

---

## General Rules

- Always explain your reasoning before implementing a solution.
- Log every non-trivial decision with its rationale.
- Keep session logs human-readable and well-structured.
- Use the `/session-logger` workflow for consistent logging.
