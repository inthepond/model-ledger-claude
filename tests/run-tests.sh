#!/usr/bin/env bash
#
# Test suite for local-llm.sh and ledger-stats.sh.
# No dependencies: ollama is replaced with a fake on PATH, and everything
# runs in a temp directory. Exits non-zero if any test fails.
#
# Usage: bash tests/run-tests.sh

set -u

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$HERE")"
SCRIPT="$ROOT/local-llm.sh"
STATS="$ROOT/ledger-stats.sh"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Fake ollama: behavior selected via FAKE_OLLAMA_MODE (ok | fail | empty | slow)
mkdir -p "$TMP/bin"
cat > "$TMP/bin/ollama" <<'EOF'
#!/usr/bin/env bash
cat > /dev/null
case "${FAKE_OLLAMA_MODE:-ok}" in
  ok)    echo "FAKE_DIGEST" ;;
  fail)  echo "fake-ollama: boom" >&2; exit 1 ;;
  empty) ;;
  slow)  sleep 5; echo "late" ;;
esac
EOF
chmod +x "$TMP/bin/ollama"
export PATH="$TMP/bin:$PATH"

LOG="$TMP/auto.tsv"
PASS=0
FAIL=0

report() {
  if [ "$1" -eq 0 ]; then
    echo "ok   $2"
    PASS=$((PASS + 1))
  else
    echo "FAIL $2"
    FAIL=$((FAIL + 1))
  fi
}

log_rows() {
  if [ -f "$LOG" ]; then
    awk 'NR > 1' "$LOG" | wc -l | tr -d ' '
  else
    echo 0
  fi
}

# --- local-llm.sh -----------------------------------------------------------

# missing instruction -> exit 2
echo hi | LOCAL_LLM_LOG="" bash "$SCRIPT" > /dev/null 2>&1
RC=$?
if [ "$RC" -eq 2 ]; then ok=0; else ok=1; fi
report "$ok" "missing instruction exits 2"

# blank-only stdin -> exit 2
printf '  \n ' | LOCAL_LLM_LOG="" bash "$SCRIPT" "task" > /dev/null 2>&1
RC=$?
if [ "$RC" -eq 2 ]; then ok=0; else ok=1; fi
report "$ok" "blank stdin exits 2"

# oversized input -> exit 3, refusal message, log row with status 3
ERR="$(printf 'aaaaaaaaaaaa' | LOCAL_LLM_MAX_CHARS=5 LOCAL_LLM_LOG="$LOG" bash "$SCRIPT" "task" 2>&1 > /dev/null)"
STATUS=$?
[ "$STATUS" -eq 3 ] && printf '%s' "$ERR" | grep -q "chunk it first"
report $? "oversized input exits 3 and refuses"
[ "$(log_rows)" -eq 1 ] && awk -F'\t' 'NR == 2 { exit !($3 == 3 && $5 == 12) }' "$LOG"
report $? "oversized input logs status 3 with input size"

# success -> exit 0, output passthrough, log row with status 0
OUT="$(printf 'input text' | FAKE_OLLAMA_MODE=ok LOCAL_LLM_LOG="$LOG" bash "$SCRIPT" "digest this" 2> /dev/null)"
STATUS=$?
if [ "$STATUS" -eq 0 ] && [ "$OUT" = "FAKE_DIGEST" ]; then ok=0; else ok=1; fi
report "$ok" "success exits 0 with model output"
awk -F'\t' 'NR == 3 { exit !($3 == 0 && $6 == "digest this") }' "$LOG"
report $? "success logs status 0 with instruction"

# model failure -> exit 4, underlying stderr surfaced
ERR="$(printf 'input' | FAKE_OLLAMA_MODE=fail LOCAL_LLM_LOG="$LOG" bash "$SCRIPT" "task" 2>&1 > /dev/null)"
STATUS=$?
[ "$STATUS" -eq 4 ] && printf '%s' "$ERR" | grep -q "boom"
report $? "model failure exits 4 and surfaces stderr"

# empty model output -> exit 5
printf 'input' | FAKE_OLLAMA_MODE=empty LOCAL_LLM_LOG="$LOG" bash "$SCRIPT" "task" > /dev/null 2>&1
RC=$?
if [ "$RC" -eq 5 ]; then ok=0; else ok=1; fi
report "$ok" "empty model output exits 5"

# tabs and newlines in the instruction are sanitized to keep the TSV valid
printf 'input' | FAKE_OLLAMA_MODE=ok LOCAL_LLM_LOG="$LOG" bash "$SCRIPT" "$(printf 'multi\nline\ttask')" > /dev/null 2>&1
awk -F'\t' 'END { exit !(NF == 6 && $6 == "multi line task") }' "$LOG"
report $? "instruction sanitized for the TSV"

# empty LOCAL_LLM_LOG disables logging
BEFORE="$(log_rows)"
printf 'input' | FAKE_OLLAMA_MODE=ok LOCAL_LLM_LOG="" bash "$SCRIPT" "task" > /dev/null 2>&1
if [ "$(log_rows)" -eq "$BEFORE" ]; then ok=0; else ok=1; fi
report "$ok" "empty LOCAL_LLM_LOG disables the auto-log"

# timeout -> exit 4 (needs timeout or gtimeout on PATH; skipped otherwise)
if command -v timeout > /dev/null 2>&1 || command -v gtimeout > /dev/null 2>&1; then
  ERR="$(printf 'input' | FAKE_OLLAMA_MODE=slow LOCAL_LLM_TIMEOUT=1 LOCAL_LLM_LOG="$LOG" bash "$SCRIPT" "task" 2>&1 > /dev/null)"
  STATUS=$?
  [ "$STATUS" -eq 4 ] && printf '%s' "$ERR" | grep -q "timed out"
  report $? "slow model times out with exit 4"
else
  echo "skip timeout test (no timeout/gtimeout on PATH)"
fi

# --- ledger-stats.sh --------------------------------------------------------

STATS_LOG="$TMP/stats.tsv"
{
  printf 'timestamp\tmodel\texit\tduration_s\tinput_chars\tinstruction\n'
  printf '2026-07-28T00:00:00Z\tmodel-a\t0\t2\t100\ttaskA\n'
  printf '2026-07-28T00:00:01Z\tmodel-a\t4\t5\t200\ttaskA\n'
  printf '2026-07-28T00:00:02Z\tmodel-b\t0\t4\t50000\ttaskB\n'
} > "$STATS_LOG"

OUT="$(bash "$STATS" "$STATS_LOG")"
printf '%s' "$OUT" | grep -q "invocations: 3    successes: 2 (67%)"
report $? "stats: totals and success rate"
printf '%s' "$OUT" | grep -q "model-a" && printf '%s' "$OUT" | grep -Eq "model-a +1/2 ok \(50%\)"
report $? "stats: per-model success rate"
printf '%s' "$OUT" | grep -Eq "under 10k +1/2 failed"
report $? "stats: failure rate by size bucket (under 10k)"
printf '%s' "$OUT" | grep -Eq "50k to 100k +0/1 failed"
report $? "stats: 50000 chars lands in the 50k to 100k bucket"

bash "$STATS" "$TMP/does-not-exist.tsv" > /dev/null 2>&1
[ $? -eq 1 ]; report $? "stats: missing log exits 1"

# ----------------------------------------------------------------------------

echo ""
echo "passed: $PASS   failed: $FAIL"
[ "$FAIL" -eq 0 ]
