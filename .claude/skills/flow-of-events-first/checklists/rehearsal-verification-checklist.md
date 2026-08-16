# Rehearsal verification checklist

Run this before writing a workflow doc or code (items 1-4), and again
before reporting a UI-touching change as done (items 5-9). Both passes are
required; neither substitutes for the other.

## Before starting (layers 1-3)

1. [ ] The flow of events is written down in plain language, per entrypoint
       touched (customer / store owner / platform operator / CLI agent),
       before any workflow doc or code exists for this change.
2. [ ] It's sourced from something outside your own prior work -- the real
       product, real photos/screenshots, the operator's own words, a fresh
       read of the actual deployed thing -- not from existing docs or code,
       which may already be a stale or wrong abstraction.
3. [ ] The required actions are stated separately from the workflow -- each
       one describable in a sentence with no UI element in it. If you can't
       write the required action without naming a button or a screen,
       you've skipped straight to layer 3.
4. [ ] Every workflow step you're about to write or change traces back to a
       specific required action, which traces back to a specific item in
       the flow of events. If it doesn't, ask whether you're solving a
       real problem or just filling out a template. Every entrypoint the
       change touches has been walked through this, not just the easiest
       one.

## Before reporting done (layer 5)

5. [ ] You re-walked the *exact* flow of events from steps 1-4 against the
       **rendered** UI -- clicked what a real actor would click, in the
       order they'd click it -- not read the code that was supposed to
       produce it.
6. [ ] At least one artifact exists that a human can look at and confirm
       with their own eyes: a screenshot, a recording, or a live
       observation. A passing `node --check`, a clean diff, or a JS state
       dump read via `page.evaluate` does not count as this artifact --
       pair it with one, never substitute it.
7. [ ] Every entrypoint/surface the change touches has been rehearsed, not
       just the one that was easiest to test. (Example: a modifier feature
       touches the customer's add-to-cart flow AND the WhatsApp message
       text AND the server-side validation payload -- all three, not just
       the one with the clearest success signal.)
8. [ ] If something failed to render or respond, you know *why* before
       moving on -- not just that a retry or a different selector made the
       symptom go away. (Example: a click failing due to "element outside
       viewport" is a real signal worth 30 seconds of investigation before
       reaching for `force: true` -- sometimes it's a test artifact,
       sometimes it's the same layout bug a real user would hit.)
9. [ ] You checked whether the same rendering problem exists on the
       unmodified baseline (e.g. `main`, or the version before your change)
       before concluding your change caused it, or before concluding it
       didn't. Don't guess either way -- check.

## Red flags that a check is state-only, not rehearsal

- The check reads `element.textContent`, `state.cart`, `localStorage`, or a
  function's return value, but never looks at what actually painted to the
  screen.
- The check dispatches events via `element.click()` in `page.evaluate(...)`
  instead of a real simulated click, with no screenshot to confirm the
  click landed where a real cursor would.
- The check passed on the first try with no screenshot taken at all.
- The report says "verified" and lists only exit codes, JSON payloads, or
  green checkmarks -- no image, no description of what was visually
  observed.

## Red flags that a required action was skipped, not just a rehearsal

- A workflow step exists that you can't trace to a one-sentence,
  UI-free required action -- it may be solving an imagined problem.
- An entrypoint's flow of events was captured but never mapped to any
  workflow step -- that's a gap, and it should be named explicitly (in
  `GAPS-TO-REVISIT.md` or equivalent), not left implicit.
- The objective for the change hasn't changed at all since before layer 5
  ran, on a change substantial enough that rehearsing it should have
  taught you something. Treat that as worth a second look, not a sign the
  first guess was already perfect.
