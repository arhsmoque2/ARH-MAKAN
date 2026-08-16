# Worked example: item modifiers, 2026-08-04

A concrete pass through all five layers on a real feature in this repo,
including where layer 5 caught something layers 1-4 could not.

## Layer 1 -- flow of events

Source: the actual photographed Woodfire Kulim menu
(`reference/woodfire-menu-source/menu-photo-0{0-3}.jpg`), not
`data/menu.json`, which turned out to be an incomplete abstraction of it.

- **Customer**: stands at the counter or orders remotely, wants a Stuffed
  Cheese burger. The physical menu board says "(BEEF OR CHICKEN)" -- the
  customer must communicate which, before the order can be made. If they
  also want extra cheese or a pickle, that's a real physical add-on with a
  real extra cost (RM1-RM19 depending on the item), independent of any app.
- **Store owner**: receives the order and must know the protein choice and
  any extras before cooking -- a WhatsApp message that only says "Stuffed
  Cheese" is missing information a real kitchen ticket needs.
- **Platform operator**: needs the price charged to match the real menu,
  including add-on deltas, or the business loses money silently.

## Layer 2 -- required actions

Stated separately from any UI, one sentence each, before any workflow was
designed:

1. A customer must be able to declare which real-world variant they want,
   when an item has one, before the order can proceed.
2. A customer must be able to optionally add real physical extras, each
   with its own real price.
3. Whatever the customer declared must reach the store owner's order
   handoff intact -- not just the item name.
4. The price charged must reflect the declared choice/extras, verified
   somewhere the customer's own device doesn't control alone.

## Layer 3 -- workflow, derived from the required actions

Each system step below traces to a required action above:

1. Tapping an item with a real-world choice presents that choice before it
   can be added to cart (serves required action 1).
2. A required choice blocks confirming until made; add-ons are optional
   (serves required actions 1 and 2).
3. Selected choices/add-ons modify the line price (serves required
   action 2).
4. The final order handoff (WhatsApp text) includes the choices, not just
   the item name (serves required action 3).
5. The server-side price revalidation includes the choice deltas (serves
   required action 4).

## Layer 4 -- implementation

Modifier-selection UI on all three tiers; cart lines carry
`{modifierId, optionLabel}`; `foundation`'s existing `selectedOptions`
pricing consumed by all three `/validate-order` calls.

## Layer 5 -- rehearsal, and what it caught

First pass (insufficient, though it didn't feel insufficient at the time):
`node --check` on every touched file, and a Playwright script that clicked
buttons and read `cart`/`state.cart` back via `page.evaluate`. All three
tiers reported correct cart contents and correct `/validate-order` payload
shapes. This was reported as verified.

Second pass, prompted by being asked "did u playwright the ui" (i.e. did
you actually *look*, not just assert): took an actual screenshot of
Premium's item-detail modal. It was blank -- no image, no price, no
modifier groups, nothing but a close button.

Root cause, found only because the blank screenshot demanded an
explanation: `openItem()` called `document.querySelector('[data-item-detail]')`
to find the container to fill with the modal's content. A *different*
element -- every menu card's invisible "view details" hit-button -- shared
that exact attribute name. `querySelector` returns the first match in the
document, which was a card button, not the modal's container. The rich
modifier HTML was being written into an absolutely-positioned, invisible
button inside the first menu card. The actual dialog stayed empty forever.
The event listener for "Add to cart" was attached to that same wrong
element too, so even the first-pass Playwright clicks -- which dispatched
`.click()` directly on `[data-item-add]` via `page.evaluate` -- happened to
still work, because that specific button *was* real (just visually
mislocated); the failure was purely visual, invisible to any check that
never rendered a pixel.

Confirmed via a second screenshot, checked out from the commit before this
feature branch existed, that the exact same blank modal was already there
-- this bug predated the modifiers work and had been shipping to real
customers the whole time, undetected, because nothing had ever rehearsed
this flow of events against a render before.

Fix: rename the container's attribute to something that doesn't collide
(`data-item-detail-panel`). Two-line change. Re-screenshotted: modal now
shows the image, price, description, and both modifier groups; add-to-cart
now closes the dialog and updates the total correctly.

## Takeaway

Layers 1-4 were done correctly and in the right order. Layer 5, done as a
*state-reading* check instead of a *rendering* check, still missed a bug
that made required action 1 -- the entire reason this feature existed --
impossible to complete for a real customer. The fix for the process, not
just the bug: layer 5 must include at least one screenshot or live
observation per entrypoint/surface touched, every time, not just when
someone asks for it.
