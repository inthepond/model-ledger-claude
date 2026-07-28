#!/usr/bin/env bash
#
# escalation-reminder.sh
# Optional Claude Code PostToolUse hook. When a local-llm.sh invocation fails,
# it feeds the escalation protocol back to the agent as tool feedback, turning
# the CLAUDE.md prose rule ("on failure, do not retry; escalate and record")
# into mechanism. Prose instructions decay over a long session; hooks do not.
#
# Wire it up in .claude/settings.json:
#
#   {
#     "hooks": {
#       "PostToolUse": [
#         {
#           "matcher": "Bash",
#           "hooks": [
#             {"type": "command", "command": "$CLAUDE_PROJECT_DIR/hooks/escalation-reminder.sh"}
#           ]
#         }
#       ]
#     }
#   }
#
# The hook reads the tool payload JSON on stdin. Detection is a plain-text
# heuristic to avoid a jq dependency: the payload must mention local-llm.sh
# (the command) and contain the script's "local-llm: " error prefix (which
# only failing runs emit).

set -u

payload="$(cat)"

printf '%s' "$payload" | grep -q 'local-llm\.sh' || exit 0
printf '%s' "$payload" | grep -q 'local-llm: ' || exit 0

cat >&2 <<'MSG'
local-llm.sh failed. Per the escalation protocol: do not retry at Tier 1.
Escalate this task to Tier 2 now; the failure is already in the auto-log.
If a delegate output later proves fluent but wrong, add a soft-failure row
to docs/model-ledger.md.
MSG
exit 2
