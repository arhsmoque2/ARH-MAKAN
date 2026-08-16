# Recipe: exception path over redesign, for governing mechanisms

The general pattern from "Design for imperfection" in `SKILL.md`, made
concrete, plus where it already exists in this repo as a precedent.

## The pattern

A governing/gating mechanism -- a permission check, a validation rule, a
pre-tool-use hook, anything that blocks an action by rule -- will
eventually meet a legitimate case it didn't foresee. Design the escape
hatch in from day one:

1. The rule blocks by default, as designed.
2. A structured, scoped exception can be granted for one specific
   case -- naming exactly the command/action/actor/item it applies to, not
   a blanket bypass. A JSON allowlist entry is a reasonable shape: specific
   enough to audit, cheap enough to grant without a redesign.
3. The exception is logged somewhere visible (a tracked file, not a
   private memory) so it can be reviewed later.
4. When the *same shape* of exception gets requested again, that's the
   signal -- not the first request -- that the rule itself is missing a
   real case. Fold it into the rule's core logic then, once you're folding
   in a proven pattern instead of guessing at one from a single data point.

The cost this avoids: redesigning core governing logic under pressure,
every single time reality doesn't match the model, which produces fatigue
and creates pressure to under-design the rule in the first place so it
never has to be revisited.

## Where this pattern already exists in this repo

Two real precedents, both worth reusing as templates rather than
reinventing the shape next time a governing mechanism is needed:

- **`RELEASE_STATE = { status: "mockup" }`** (every storefront tier). The
  default rule blocks real checkout. The escape hatch is a single flag,
  flipped per-store when that store is promoted -- not a rewrite of the
  checkout code path. See `governance/pilot-agreement-summary.md` for the
  documented steps to grant that exception for one store.
- **`foundation`'s kill switch** (`POST /kill-switch/:slug`,
  `foundation/worker.mjs`). The default rule is "orders flow normally."
  The exception -- block a specific store's ordering regardless of its
  release status -- is a scoped, auditable, single-store override
  (`developer_audit_log` records who flipped it and when), not a
  redeployment of `/validate-order`'s logic.

Both share the shape the general pattern calls for: narrowly scoped,
cheap to grant, logged, and reversible without touching the rule everyone
else relies on.

## Applying it to a new governing mechanism

If a future session adds a pre-tool-use hook, a new validation gate, or
any other rule that blocks by default (in this repo's `.claude/settings.json`,
in `foundation`, or elsewhere): design the exception path in the same PR
that adds the rule, not after the first uncovered case forces a scramble.
At minimum: how is a scoped exception granted, where is it recorded, and
what does the audit trail look like when someone asks "why was this
allowed?" six months later.
