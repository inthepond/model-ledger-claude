#!/usr/bin/env bash
#
# local-llm.sh
# Delegate mechanical text tasks to the Tier 1 model via Ollama.
# Design principle: fail loudly rather than silently return garbage.
#
# Usage:
#   ./scripts/local-llm.sh "Summarize what this file does" < src/foo.ts
#   git log --oneline -50 | ./scripts/local-llm.sh "Cluster these commits by theme"
#
# Run from the repo root so the auto-log lands in docs/.
#
# Environment variables:
#   LOCAL_LLM_MODEL      default kimi-k2.7-code:cloud (runs via Ollama Cloud;
#                        set a non-cloud tag for fully local inference)
#   LOCAL_LLM_TIMEOUT    default 120 seconds
#   LOCAL_LLM_MAX_CHARS  default 200000; refuse rather than truncate when exceeded.
#                        A cost and quality guardrail, not a context limit;
#                        calibrate it with ledger evidence.
#   LOCAL_LLM_LOG        auto-log path, default docs/model-ledger-auto.tsv.
#                        Every invocation that reaches the size check appends one
#                        row, success or failure; this gives the ledger review its
#                        denominators. Set to empty to disable.
#
# Exit codes:
#   0 success  2 usage error  3 input too large  4 call failed or timed out  5 empty output

set -euo pipefail

MODEL="${LOCAL_LLM_MODEL:-kimi-k2.7-code:cloud}"
TIMEOUT_SECS="${LOCAL_LLM_TIMEOUT:-120}"
MAX_CHARS="${LOCAL_LLM_MAX_CHARS:-200000}"
LOG_FILE="${LOCAL_LLM_LOG-docs/model-ledger-auto.tsv}"

if [ "$#" -lt 1 ] || [ -z "${1// }" ]; then
  echo "local-llm: missing task instruction" >&2
  echo "Usage: $0 \"task instruction\" < input" >&2
  exit 2
fi
INSTRUCTION="$1"

if [ -t 0 ]; then
  echo "local-llm: no stdin input; pipe or redirect content in" >&2
  exit 2
fi

INPUT="$(cat)"
if [ -z "${INPUT//[[:space:]]/}" ]; then
  echo "local-llm: stdin is empty, nothing to process" >&2
  exit 2
fi
CHARS=${#INPUT}

# Every real invocation is logged, success or failure. A failure-only record
# cannot yield a success rate; this file is the denominator.
START_SECS=$(date +%s)
log_run() {
  local status=$1
  if [ -z "$LOG_FILE" ]; then return 0; fi
  local dir
  dir=$(dirname "$LOG_FILE")
  mkdir -p "$dir" 2>/dev/null || return 0
  if [ ! -f "$LOG_FILE" ]; then
    printf 'timestamp\tmodel\texit\tduration_s\tinput_chars\tinstruction\n' > "$LOG_FILE" 2>/dev/null || return 0
  fi
  local now dur instr
  now=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  dur=$(( $(date +%s) - START_SECS ))
  instr=${INSTRUCTION//[$'\t\n\r']/ }
  printf '%s\t%s\t%s\t%s\t%s\t%s\n' \
    "$now" "$MODEL" "$status" "$dur" "$CHARS" "${instr:0:200}" >> "$LOG_FILE" 2>/dev/null || true
}
ERR_FILE=$(mktemp)
trap 'log_run $?; rm -f "$ERR_FILE"' EXIT

# Oversized input is refused, not truncated: a truncated summary looks complete
# and is wrong. The limit is a guardrail to recalibrate with ledger evidence,
# not a hard context ceiling.
if [ "$CHARS" -gt "$MAX_CHARS" ]; then
  echo "local-llm: input of ${CHARS} chars exceeds limit ${MAX_CHARS}, chunk it first" >&2
  exit 3
fi

if ! command -v ollama >/dev/null 2>&1; then
  echo "local-llm: ollama not found; install it and make sure ollama serve is running" >&2
  exit 4
fi

# macOS ships BSD tools without timeout; coreutils installs it as gtimeout
if command -v timeout >/dev/null 2>&1; then
  TIMEOUT_CMD=(timeout "$TIMEOUT_SECS")
elif command -v gtimeout >/dev/null 2>&1; then
  TIMEOUT_CMD=(gtimeout "$TIMEOUT_SECS")
else
  TIMEOUT_CMD=()
  echo "local-llm: timeout/gtimeout not found, this call has no timeout protection" >&2
fi

PROMPT=$(printf '%s\n\n--- INPUT ---\n%s\n' "$INSTRUCTION" "$INPUT")

set +e
if [ "${#TIMEOUT_CMD[@]}" -gt 0 ]; then
  OUTPUT=$(printf '%s' "$PROMPT" | "${TIMEOUT_CMD[@]}" ollama run "$MODEL" 2>"$ERR_FILE")
else
  OUTPUT=$(printf '%s' "$PROMPT" | ollama run "$MODEL" 2>"$ERR_FILE")
fi
STATUS=$?
set -e

# ollama's stderr mixes real errors with spinner frames, carriage returns and
# ANSI escape codes; strip the noise and keep the useful tail
err_tail() {
  tr '\r' '\n' < "$ERR_FILE" \
    | sed -e $'s/\x1b\\[[0-9;?]*[a-zA-Z]//g' \
    | grep -v '^[[:space:]]*$' | tail -n 3 || true
}

if [ "$STATUS" -eq 124 ]; then
  echo "local-llm: call timed out (${TIMEOUT_SECS}s, model=${MODEL}), escalate this task" >&2
  exit 4
fi
if [ "$STATUS" -ne 0 ]; then
  echo "local-llm: call failed (exit=${STATUS}, model=${MODEL}), escalate this task" >&2
  err_tail >&2
  exit 4
fi
if [ -z "${OUTPUT//[[:space:]]/}" ]; then
  echo "local-llm: empty output (model=${MODEL}), escalate this task" >&2
  err_tail >&2
  exit 5
fi

printf '%s\n' "$OUTPUT"
