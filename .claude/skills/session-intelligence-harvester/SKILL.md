---
name: session-intelligence-harvester
description: Use after a productive ARH-MAKAN session — corrections were made, a recurring failure pattern surfaced, a check would have caught something earlier, or the user asks to "harvest learnings" / "capture session intelligence" / "write a skill for this". Extracts what was learned and encodes it into this repo's actual files (GOTCHAS.md, AGENTS.md, docs/decisions/, scripts/arh-ci-doctor.mjs gates, RECIPES.md, .claude/skills/) so it's found automatically next time, not just retold in chat. Verifies "this is now fixed" claims against the current code before writing them down as settled.
---

# Session Intelligence Harvester — ARH-MAKAN

Tailored copy of the abstract `session-intelligence-harvester` skill, wired
to this repo's actual files. See the abstract version for the full
rationale; this file only fixes Step 0/2's routing table to what actually
exists here, confirmed by reading each file, not assumed.

## This repo's knowledge architecture (confirmed)

| Category | File(s) | Notes |
|---|---|---|
| Entry point / runtime orientation | `AGENTS.md` | "Prime Directives" list — add new standing rules here |
| Known traps | `GOTCHAS.md` | Numbered `## N. Title` entries, `Gotcha`/`Solution` or `Symptom`/`Root Cause`/`Permanent Fix` format — **both formats appear**, pick whichever the entry naturally fits and stay consistent within it |
| Open items / not-yet-decided | **No dedicated file exists.** | See "Gap to close" below — don't silently invent a GAPS-TO-REVISIT.md; flag it and ask, or add a scoped `## Unresolved / Next Steps` section to `HANDOFF.md` if volume stays small |
| Architectural decisions | `docs/decisions/000N-*.md` | Sequential ADRs, currently 0001–0007. Format: `# ADR-000N: Title` / `## Status` / `## Context` / `## Decision` / `## Consequences` |
| Build/roadmap phases | `PLAN.md` | 6-phase checklist — **stale**, still shows everything unchecked despite being built; don't trust its checkboxes as a status signal without cross-checking actual code |
| Infra/architecture snapshot | `HANDOFF.md` | Prose summary of current state — this is the file most likely to drift out of sync with reality since nothing forces it to stay current; **cross-check its claims against actual code before trusting it** (see Gate 1 below) |
| Automated checks | `scripts/*.mjs`, wired into `scripts/arh-ci-doctor.mjs` | Each gate is `run('node scripts/<file>.mjs', 'N. Description')` — currently 8 gates. Bump the "completed all N gates" message when adding one |
| This repo's skills | `.claude/skills/<name>/SKILL.md` | Folder-per-skill, optional `references/`, `checklists/`, `recipes/`, `schemas/`, `registries/`, `contracts/` subfolders (see `fnb-taste-palette-design/`, `flow-of-events-first/` for the pattern) |
| Copy-paste procedures | `RECIPES.md` (root) **and** `docs/recipes/*.md` | Two locations exist — check both before adding a third; root `RECIPES.md` is newer and more actively maintained as of this writing |
| Cross-repo integration gaps | Not tracked in this repo | Lives in `arh-fnb-tier-showroom/GAPS-TO-REVISIT.md` instead, since the gap is about *this* repo's connection to that one — route cross-repo learnings there, not here |

## Gap to close before this skill can fully rely on Step 0

This repo has no distinct "open items, not yet done" bucket the way
`arh-fnb-tier-showroom/GAPS-TO-REVISIT.md` does. `GOTCHAS.md` is for
things that already bit someone; an item that's simply *incomplete* (a
secret not yet rotated, a doc not yet reconciled) doesn't belong there.
Until this gets a home, harvested "open item" learnings should be flagged
explicitly to the operator rather than jammed into `GOTCHAS.md` or
silently dropped.

## Verified example from this repo, tonight (2026-08-17)

A real harvest already happened in this repo — commit `7827e2e`, "docs(intelligence):
harvest failure capsules and recipes into GOTCHAS.md and RECIPES.md" —
and it's a good worked example of both what this skill should do and the
one step it's easy to skip:

- **Good**: added `GOTCHAS.md` entries #4–#6 (JSONC comment-stripping regex
  destroying URL string literals, Cloudflare Assets-vs-Worker fetch
  precedence, plaintext secrets in `wrangler.jsonc`) — all in the file's
  existing `Symptom`/`Root Cause`/`Permanent Fix` format, all accurately
  describing real fixes made in the same session.
- **The gap**: entry #7 ("Edge Worker Verification Gate in CI") declares
  `scripts/test-worker-runtime.mjs` (Gate 8) the permanent fix for "checks
  never execute `worker.fetch()`" — without verifying that Gate 8's own
  test actually exercises the `HTMLRewriter` injection branch. It doesn't:
  that branch only runs under `typeof HTMLRewriter !== 'undefined'`, and
  `HTMLRewriter` is a Workers-runtime global absent under plain `node`, so
  the test silently falls through to the default path and passes either
  way. The harvest correctly captured the root cause (checkers only parse,
  never execute) but filed an unverified "permanent fix" claim about its
  own remedy — this is precisely Step 3's "verify claims before writing
  them as settled," skipped.
- Also unaddressed by that harvest: `HANDOFF.md` still names the SOPS
  vault path (`_ARH-AGENT-OS/ARH-OS-Central/arh-secrets-vault/sops/
  firebase.enc.yaml`, `cloudflare.enc.yaml`) — the same class of finding
  an earlier commit ("docs: scrub secrets metadata...") removed from
  `AGENTS.md` and `RECIPES.md`, but `HANDOFF.md` was introduced in the
  same original commit and never got the follow-up pass. A harvest that
  checked "does this class of finding recur anywhere else" (Step 1's
  pattern-identification question) would have caught it.

Use this as the calibration example: a harvest is not done when the doc
entry is written and matches the file's style — it's done when the claim
in the entry has actually been checked against current code.
