#!/usr/bin/env bash
#
# ledger-stats.sh
# Summarize the auto-log written by local-llm.sh. This is where the ledger's
# denominators become numbers: success rate per model and per task, failure
# rate by input size, and durations. Run it at every epoch review.
#
# Usage:
#   ./scripts/ledger-stats.sh                     # reads docs/model-ledger-auto.tsv
#   ./scripts/ledger-stats.sh path/to/log.tsv

set -euo pipefail

LOG="${1:-docs/model-ledger-auto.tsv}"
if [ ! -f "$LOG" ]; then
  echo "ledger-stats: no auto-log at ${LOG}" >&2
  echo "Run local-llm.sh from the repo root first, or pass the log path." >&2
  exit 1
fi

awk -F'\t' '
NR == 1 { next }
{
  n++
  models[$2] = 1; per_model[$2]++
  if ($3 == 0) { ok++; ok_model[$2]++; dur_sum += $4; dur_n++ }
  instr = substr($6, 1, 44)
  instrs[instr] = 1; per_instr[instr]++
  if ($3 == 0) ok_instr[instr]++
  sz = $5 + 0
  b = sz < 10000 ? "under 10k" : sz < 50000 ? "10k to 50k" : sz < 100000 ? "50k to 100k" : "100k plus"
  per_bucket[b]++
  if ($3 != 0) fail_bucket[b]++
}
END {
  if (n == 0) { print "ledger-stats: log has a header but no records yet"; exit }
  printf "invocations: %d    successes: %d (%.0f%%)\n", n, ok, 100 * ok / n
  if (dur_n > 0) printf "mean duration of successes: %.1fs\n", dur_sum / dur_n
  print ""
  print "by model:"
  for (m in models)
    printf "  %-30s %d/%d ok (%.0f%%)\n", m, ok_model[m] + 0, per_model[m], 100 * (ok_model[m] + 0) / per_model[m]
  print ""
  print "by instruction (first 44 chars):"
  for (i in instrs)
    printf "  %-46s %d/%d ok\n", i, ok_instr[i] + 0, per_instr[i]
  print ""
  print "failure rate by input size (chars):"
  split("under 10k,10k to 50k,50k to 100k,100k plus", order, ",")
  for (k = 1; k <= 4; k++) {
    b = order[k]
    if (b in per_bucket)
      printf "  %-14s %d/%d failed\n", b, fail_bucket[b] + 0, per_bucket[b]
  }
}
' "$LOG"
