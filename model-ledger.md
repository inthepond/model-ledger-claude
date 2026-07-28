# Model Capability Ledger

Records the evidence used to calibrate the tiering rules in CLAUDE.md. Without a record,
every routing rule is a guess.

Two records feed the calibration:

- **`docs/model-ledger-auto.tsv`**: written automatically by `local-llm.sh`, one row per invocation,
  success or failure (timestamp, model, exit code, duration, input size, instruction). This is the
  denominator: without it, failure counts can never become success rates. Never edit it by hand.
- **This file**: the manual record for what automation cannot see: soft failures, `unknown` failures,
  and subagent escalations.

## Recording Principles

1. Log a failure the moment it is discovered. Soft failures usually surface long after the delegation;
   log them however late, and note the delay.
2. When attribution is uncertain, write `unknown`; do not guess.
3. If you suspect the prompt or the context rather than model capability, say so clearly in the notes.
4. A model change starts a new epoch: add an epoch marker row, and treat all rows above it as reference only.

## Failure Types

- `hard`: malformed tool call, timeout, failed compilation, red tests. Detected for free and reliably;
  the auto-log captures these on its own. Add a row here only when one needs prose.
- `soft`: fluent output that is factually wrong. The most expensive kind, and the reason this file
  exists: the auto-log cannot see it, only a human can.
- `unknown`: cannot tell what went wrong.

## Records

| Date | Task type | Tier attempted | Failure type | Stuck at | Escalated to | Verification signal | Notes |
|---|---|---|---|---|---|---|---|
| 2026-07-27 | Example: clustering 50 commits | Tier 1 (qwen3-coder) | soft | Merged commits from two unrelated modules into a single theme | opus | none | Example row, kept to show the format |
| 2026-07-28 | Epoch marker | | | | | | Tier 1 default changed from qwen3-coder to kimi-k2.7-code:cloud; rows above are reference only |

## Review

Review at the start of every epoch (whenever the Tier 1 model or a subagent model version changes),
and any time soft failures start accumulating. Answer:

- Which task types have enough auto-log volume and a high enough success rate to lock in as default
  delegations? Compute the rates with `./scripts/ledger-stats.sh`; this file alone cannot answer it.
- Three or more soft failures in one task type: remove that category from the delegation list
  permanently, unless a verification signal can be added.
- Do failures cluster in a particular input-size range? If so, tune `LOCAL_LLM_MAX_CHARS` instead
  of switching models.
- How many failures actually trace back to the prompt? Those should not be charged against the model.

Apply the review conclusions directly to the "safe to delegate / do not delegate" lists in CLAUDE.md.
