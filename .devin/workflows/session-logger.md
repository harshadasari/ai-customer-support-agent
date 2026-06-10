---
description: Log every Cascade chat session - ideas, reasoning, decisions - to logs/sessions/
---

## Session Logging Workflow

Every time you start a new conversation in this workspace, run the following steps:

### Step 1 — Create a session log file
// turbo
```bash
mkdir -p logs/sessions && SESSION_FILE="logs/sessions/session_$(date +%Y%m%d_%H%M%S).md" && echo "# Session Log — $(date '+%Y-%m-%d %H:%M:%S')\n\n## Context\n_Fill in task context here_\n\n## Ideas & Reasoning\n\n## Decisions Made\n\n## Code Changes\n\n## Open Questions\n" > "$SESSION_FILE" && echo "Created: $SESSION_FILE"
```

### Step 2 — Append a thought/reasoning entry during work
Whenever a significant decision or idea is formed, append it to the active session log:
```bash
SESSION_FILE=$(ls -t logs/sessions/*.md | head -1) && echo "\n### $(date '+%H:%M:%S') — [THOUGHT/DECISION]\n_description here_\n" >> "$SESSION_FILE"
```

### Step 3 — End of session summary
At the end of each chat/working session, summarize by appending:
```bash
SESSION_FILE=$(ls -t logs/sessions/*.md | head -1) && echo "\n---\n## Session Summary\n_Write summary here_\n" >> "$SESSION_FILE"
```
