# CLAUDE.md

<!-- This file is injected into the context of every request, and every line is billed again on every turn.
     Before adding anything, ask: is this rule worth paying for on every turn? If not, delete it. -->

## Project

<!-- Fill in your own -->
- Name:
- Tech stack:
- Entry point:
- Test command:
- Build command:
- Lint command:

## Tiered Execution Principles

This project allocates compute across three tiers. Default to the lowest viable tier, and move up only with a clear reason.

| Tier | Handles | Executor |
|---|---|---|
| 0 | Deterministic work: file trees, dependency lists, grep, git history extraction, formatting | Shell tools, no model |
| 1 | Mechanical text work: single-file summaries, log digests, commit history clustering | Delegate model, see below |
| 2 | Judgment, trade-offs, cross-file reasoning, writing, architecture decisions | You |

**Tier 0 first.** Need a file list? Use `tree`. Need commit history? Use `git log --oneline`.
Need to find a symbol? Use `rg`. Never call any model, including the Tier 1 delegate, to obtain deterministic facts.

Routing is context hygiene as much as cost: keep raw material (logs, diffs, dumps) out of your context and bring in conclusions.

## Delegate Model (Tier 1)

The default model is `kimi-k2.7-code:cloud`, which runs via Ollama Cloud; `LOCAL_LLM_MODEL`
can point at a non-cloud tag for fully local inference. How to invoke:

```bash
./scripts/local-llm.sh "task instruction" < input-file
git log --oneline -50 | ./scripts/local-llm.sh "Cluster these commits by theme"
```

**Safe to delegate:**
- Summarizing what a single file or a single function does
- Digesting long logs, long diffs, long changelogs
- Clustering commit history by theme
- Extracting lists from unstructured text

**Do not delegate:**
- Any output that will turn into code directly
- Any judgment that requires connecting information across files
- Any finished text aimed at external readers (READMEs, copy, PR descriptions)
- Any conclusion that cannot be verified

There is exactly one criterion: **if this output were wrong and I would not notice, do not delegate it.**

**Handling the delegate model's output:**
Its output is unverified secondhand material, not fact. Before it goes into a final product,
check every concrete claim that affects the conclusion (file names, function names, numbers, version numbers)
against the source. If checking costs more than reading the source yourself, read it yourself.

When the script fails, it exits non-zero and reports to stderr; it will not silently return garbage.
On failure, do not retry a second time. Escalate straight to Tier 2. The script logs every invocation,
including failures, on its own; add a manual ledger row only for what it cannot see (see Ledger).

## Subagent Delegation

**When to delegate:** isolating context, parallelizing independent work, batch mechanical operations.

**When not to delegate:** the main thread needs that reasoning, the synthesis requires seeing all the material together,
or the overhead of delegating exceeds the subtask itself.

For each subagent, pick the cheapest tier that can do the job well:

- `haiku`: batch mechanical work involving no judgment
- `sonnet`: well-scoped research, code exploration, synthesis within a bounded scope
- `opus`: subtasks that need real planning or trade-offs

**Tier 1 script vs `haiku` subagent:** use the script when the material is already pipeable from disk
and the output is cheap for a human to check; use a `haiku` subagent when the task needs tools
(search, file navigation) or its result feeds directly into your reasoning.

The parent owns the final product and the synthesis across subagents; subagents do not make final decisions.
Explicit user instructions override all of the rules above.

## Escalation Protocol

When a subagent judges the current task to be beyond its own tier, **do not force it through**.
Stop, return to the parent, and state three things:

1. Which step it is stuck on
2. Why the current tier is not enough
3. Whether a verification signal is available (tests, compilation, schema)

The same applies to the delegate model: when it fails or returns suspicious output, do not retry at the same tier. Move up.

Escalation is not failure; it is this mechanism working as intended. **Silently botching the job is failure.**

## Ledger

The tiering rules above are calibrated by evidence, kept in two places:

- `docs/model-ledger-auto.tsv`: written automatically by the script, one row per invocation,
  success or failure. This provides success-rate denominators and captures hard failures. Never edit it by hand.
- `docs/model-ledger.md`: the manual record for what automation cannot see. Append a row the moment
  a soft failure is discovered (however late), and for every `unknown` and every subagent escalation.

Failure types for manual rows:

- `hard`: malformed tool call, timeout, failed compilation, red tests (mostly auto-captured)
- `soft`: fluent output that is factually wrong (the most expensive kind, always log it)
- `unknown`: cannot tell what went wrong

Do not log a failure with unclear attribution without a note. If you suspect the prompt or the context
rather than model capability, say so in the notes.

## Output Conventions

- Never use em dashes in any output
- Write code comments and commit messages in English; converse with me in Chinese
- Do not generate README or documentation files unless asked
- Explain what you intend to change before changing it, unless the change is obvious and local
