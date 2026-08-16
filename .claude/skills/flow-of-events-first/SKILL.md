---
name: flow-of-events-first
description: Use at the start of any new project or major feature to define objectives, before implementing/reviewing/claiming done any change that touches what a real actor (customer, store owner, platform operator, CLI agent) does end-to-end, and when designing a governing/gating mechanism (hooks, validation, permission checks) that must survive cases it didn't anticipate. Route through this before writing a workflow doc or code, before reporting a UI change as working, and before treating a project's objectives as final. Trigger on "add a feature", "fix the flow", "is this done", "test this", "what should this project achieve", "design this hook/check", or any moment about to claim a rendered UI change is verified.
---

# Flow of Events First

This is the foundation every project here is built on, not one technique
among others. Every line of code, every UI decision, every skill, every
governing script should trace back to it.

## Core stance

A workflow is not the starting point, and neither is a stated objective on
its own. Both are already abstractions -- someone's modeled version of what
a real actor needs or does. Start there and you inherit whatever gaps or
wrong assumptions are baked into that model, including the ones in your own
prior docs, code, and stated goals.

The starting point is the **flow of events**: what actually happens, to a
real person, in the real business, regardless of whether any software
exists for it. From the flow of events you derive the **required actions**
-- what must be made possible for that flow to complete. From the required
actions you design a **workflow** that caters to them. You do this per
entrypoint, and you repeat it until every event has a tailored solution.
Implementation realizes the workflow. Verification closes the loop by
rehearsing the *original* flow of events against the *rendered* result --
not against the code that was supposed to produce it.

```text
flow of events --> required actions --> workflow --> implementation --> verification
(ground truth,     (what must be       (designed     (code that          (rehearse the
 per entrypoint,     made possible,      to cater to   realizes the        SAME flow of
 software-           derived, not        the actions,  workflow)           events against
 independent)        assumed)            per                               rendered pixels,
                                          entrypoint)                       not code/state)
```

Skipping straight to "here's the workflow" (or straight to "here's the
objective") risks designing around whatever's already built, already
documented, or already assumed, instead of around what's actually true.
Skipping the last arrow -- verifying against rendered pixels instead of
code or state -- risks shipping a workflow that is correctly *specified*
and still completely non-functional. Both failures are the same mistake at
different ends of the pipeline: substituting an abstraction for the thing
it's supposed to represent.

## Why this is a real rule, not a platitude

2026-08-04, this repo: item modifiers were implemented across three tiers.
Every step was done in the right order -- the canonical menu was grounded in
real photographed prices before any workflow was written, the workflow was
documented per persona, the code was written to match it, and it was tested:
`node --check` passed, a Playwright suite clicked through the flow and read
back correct cart totals and validation payloads out of JavaScript state.
It was reported as verified.

Premium's storefront was still completely broken. `openItem()` wrote the
item's name, price, and modifier choices into the DOM -- into the wrong
element, because `document.querySelector('[data-item-detail]')` matched a
different, invisible element first. The real dialog stayed empty forever.
No amount of reading the code would surface this: the code reads as a normal,
correct selector call. No amount of reading JS state would surface it either
-- the *event listener* was attached to the wrong node, so the state-reading
checks that clicked buttons via `document.querySelector(...).click()` never
even exercised the real path a mouse would take through a rendered page.
It was only found by looking at a screenshot, because a screenshot is the
only check that verifies what the last layer exists to verify: that a human
can actually see and complete the flow of events this was all supposed to
serve.

The lesson generalizes past this one bug: a clean diff, a passing type
check, and a green test suite are necessary and prove the *workflow* was
implemented. None of them prove the *flow of events* still completes for a
real person. Only rehearsing it against a render does.

## The entrypoints, for this project

Every layer below runs once per entrypoint. For this webapp, the
entrypoints are:

- **Customer** -- orders food, chooses items and their real-world variants,
  pays, expects status.
- **Store owner** -- manages the menu, availability, pricing, theme,
  handles feedback and incidents.
- **Platform operator** -- deploys, monitors health, rotates secrets,
  confirms things are actually live.
- **CLI agent** -- a cold-start coding session (human or Claude) that has
  to find its footing in this repo without re-deriving everything from
  scratch.

A change that only considers one entrypoint when it actually touches
several (a menu change touches customer *and* store owner *and* the
agent session that has to keep `data/menu.json` truthful) is incomplete by
construction, not by oversight.

## Layer 1 -- capture the flow of events, per entrypoint

Before writing a workflow doc or touching code, write down the flow of
events in plain language, sourced from something outside your own prior
work: the real product, real photos, the operator's own words, a real
conversation -- not from `data/menu.json`, not from an existing workflow
doc, not from the current code. Those are all *someone's prior abstraction*
and may be stale or wrong (this repo's canonical menu data was; it took
reading the actual menu photos to find out).

For each entrypoint touched, ask:

- What does this person actually do, want, or decide, independent of any
  screen? (a customer chooses beef or chicken regardless of whether an app
  exists to capture that choice)
- What real-world constraint governs it? (a price, a required choice, an
  hours-of-operation cutoff, a physical inventory limit)
- What triggers this flow, and what real-world state change ends it? (an
  order is placed -> the kitchen has a ticket -> food changes hands)

Write this down. It doesn't need to be formal -- a few sentences per
entrypoint is enough -- but it must exist as text before layer 2, and it
must be traceable to a source outside your own code/docs.

## Layer 2 -- derive the required actions

Before designing anything, state plainly what must be made *possible* for
each flow of events to complete -- not yet how. "A customer must be able to
declare a protein choice before an order can be placed" is a required
action. "Render a radio button group in the item modal" is not a required
action, it's already a workflow decision -- it belongs in layer 3.

Separating this out matters because it's the layer that keeps you honest:
if you can't state the required action in one sentence without describing a
UI element, you've skipped straight to designing a solution for a need you
never actually wrote down.

## Layer 3 -- design the workflow, repeat per entrypoint

Only now map the required actions onto this system: which screens, which
steps, which data changes hands, in what order, for *this* entrypoint. This
is what `WORKFLOW-REHEARSAL.md`-style docs capture. Every workflow step
should trace back to a specific required action from layer 2, which traces
back to a specific item in the flow of events from layer 1.

Repeat layers 1-3 for every entrypoint the change touches, not just the
easiest or most obvious one, until every event you captured has a tailored
solution -- an event with no corresponding workflow step is a gap, not
something to leave implicit.

## Layer 4 -- implement

Standard engineering. Nothing special here except: implement against the
workflow from layer 3, and keep the flow of events from layer 1 in reach --
you'll need it again in layer 5, verbatim, not reconstructed from memory.

## Layer 5 -- verify by rehearsing, not by reading

Non-negotiable, and it is a *different activity* from layers 1-4, not a
lighter version of them:

- Re-walk the exact flow of events from layer 1 against the **rendered**
  UI. Click what a customer would click, in the order they'd click it.
  Screenshot it, or watch it live. See the full checklist in
  `checklists/rehearsal-verification-checklist.md`.
- A check that only reads code, reads a diff, or reads JS/DOM state
  (`node --check`, a state dump, a unit test asserting on a function's
  return value) is necessary but never sufficient on its own for anything
  with a UI. Pair it with at least one check that watches a render.
- If the check can't run in a browser at all (a batch job, an API-only
  service), the equivalent is: exercise it exactly the way its real caller
  does, and observe the real output that caller would see -- not an
  internal function's return value.
- A working flow of events beats a clean implementation. If forced to
  choose between shipping code that is elegant but produces a blank screen,
  and code that is a mess but a real customer can complete their order
  through it, ship the one the customer can use, then clean it up. A
  hexagonal architecture behind a blank checkout screen has shipped
  nothing.

See `recipes/worked-example-modifiers.md` for this exact ordering worked
through on a real feature in this repo, including the bug that layer 5
caught.

## Objectives are not fixed at the start -- iterate the destination

The default way most projects get worked is: state the objective, then
work from it to finish. That's fine as far as it goes, but it has a real
failure mode -- defining *that* you want something is easy; defining
precisely *what shape* it should take is often not possible up front,
because you genuinely don't know yet. That's not a planning failure, it's
the normal condition of building something that involves discovery.

So: the destination itself is allowed to be iterated, not just the path to
it. Redefine the end goal as you learn what you actually need -- that's
not scope creep, it's the mechanism by which layer 1-3 above stay grounded
in reality instead of in an earlier, less-informed guess. Two consequences
follow from taking this seriously:

- **Every design is a compromise, on purpose.** A good design is not the
  one that does everything -- it's the one that correctly chooses what to
  leave out in service of what's genuinely needed. You frequently can't see
  what's genuinely needed until you've iterated once and looked at the
  result, which is exactly why layer 5 (rehearse against the render) feeds
  back into layer 1-3, not just into a bug tracker.
- **Don't wait for a perfect upfront spec before starting.** Start from the
  clearest statement of intent you have, run it through layers 1-5, and let
  what you learn from rehearsing the result refine the objective for the
  next pass. A precise initial definition is not a prerequisite for
  starting; it is a *product* of iterating.

## Design for imperfection: absorb the unforeseen without redesigning

No flow-of-events capture is complete. Some real event will always turn up
that layer 1 didn't anticipate. The question is not how to prevent that --
you can't -- it's how the system responds when it happens.

The wrong response is treating every uncovered case as a reason to go back
to the drawing board and redesign the governing logic from scratch. Done
repeatedly, that produces fatigue and discourages ever tightening the
system in the first place, because tightening it feels expensive every
time reality doesn't match the model.

The better response: design governing/gating mechanisms (permission checks,
validation, pre-tool-use hooks, anything that blocks an action based on a
rule) with a built-in, explicit exception path from day one -- not added
later under pressure. Concretely, for a hook or check that blocks actions
by rule: let it accept a structured exception (e.g. a JSON allowlist entry
naming the specific command/action/actor it applies to) instead of forcing
a change to the rule's core logic every time a legitimate case turns up
that the rule didn't foresee. The exception is scoped to the one case, is
easy to grant, and doesn't touch the rule everyone else still relies on.

This is not a permanent exemption from good design -- it's a deliberate
choice about *when* to pay the redesign cost. An exception that's granted
once and never needed again was a five-minute fix. An exception that keeps
getting re-requested in slightly different shapes is a signal: that's a
real pattern the original rule missed, and *that's* the point to fold it
back into the core logic properly -- not before, when you'd just be
guessing at what the pattern even is.

The same principle applies one level up, past individual hooks: expect
layer 1's flow-of-events capture to be incomplete too, expect layer 3's
workflow to miss an entrypoint's edge case, and build in the equivalent of
an exception path (a documented gap in `GAPS-TO-REVISIT.md`, a clearly
labeled fallback, a kill switch) rather than treating every gap discovered
in layer 5 as proof the whole design needs to be redone.

See `recipes/exception-over-redesign.md` for the concrete shape of this
pattern and two places it's already applied in this repo
(`RELEASE_STATE`, `foundation`'s kill switch).

## Fast trigger map

```yaml
route:
  new_project_or_major_feature:
    do_first: "state the clearest current objective, then run it through
      layers 1-5 -- don't wait for a perfect upfront spec"
    load:
      - checklists/rehearsal-verification-checklist.md
    forbid:
      - treating the first stated objective as final before at least one
        layer-1-through-5 pass has fed back into it

  new_feature_or_flow_change:
    do_first: "write layer 1 (flow of events) and layer 2 (required
      actions), per entrypoint touched, before any workflow doc or code"
    load:
      - checklists/rehearsal-verification-checklist.md
    forbid:
      - deriving the workflow from existing code/docs alone
      - starting implementation before layers 1-2 are written down
      - addressing only one entrypoint when the change touches several

  about_to_report_done:
    do_first: "re-walk layer 1's flow of events against the rendered UI"
    load:
      - checklists/rehearsal-verification-checklist.md
    forbid:
      - reporting a UI change as verified from a code read, a passing type
        check, or a JS-state assertion alone
      - claiming "done" without at least one screenshot or live observation
        per entrypoint/surface touched

  designing_a_governing_mechanism:
    do_first: "build the exception path in from the start, not after the
      first uncovered case forces a redesign"
    forbid:
      - a gating rule with no scoped override/exception mechanism
      - rewriting core rule logic for a single uncovered case instead of
        granting a scoped exception first

  reviewing_someone_elses_change:
    do_first: "ask what flow of events this was supposed to serve, then
      rehearse it yourself against the render -- don't just read the diff"
```

## Output contract

When using this skill, report:

```yaml
flow_first_result:
  entrypoints_touched: []
  flow_of_events: ""          # plain language, per entrypoint, sourced outside own prior work
  required_actions: []        # what must be possible, one per flow-of-events item, pre-UI
  workflow_derived: ""        # the system steps, each traced to a required action
  implementation_summary: ""
  rehearsal_performed: []     # what was actually watched/screenshotted, per entrypoint/surface
  rehearsal_gaps: []          # any entrypoint/surface NOT rehearsed against a render, and why
  bugs_found_by_rehearsal: [] # anything a code/state-only check would have missed
  objective_revised: ""       # if layer 5 changed what "done" means, say what changed and why
```

Do not report a UI-touching change as done until `rehearsal_performed`
covers every entrypoint/surface the change touches.
