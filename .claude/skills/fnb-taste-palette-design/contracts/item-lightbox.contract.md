# Item Lightbox Contract

## Purpose

The item lightbox helps the customer inspect one menu item and decide whether to add it to cart.

It is not a generic gallery viewer.

## Required content

- Item image or poster.
- Optional short video.
- Item name.
- Description.
- Price.
- Variants, if available.
- Add-ons, if available.
- Quantity control.
- Add-to-cart CTA.
- Close button.

## Plane separation

A tasteful lightbox has four visible planes:

```text
page content
→ overlay / scrim
→ lightbox shell
→ media / content surface
→ controls
```

The backdrop suppresses the page. The shell separates from the backdrop. The media separates from the shell. Controls separate from media.

Dark-on-dark without border, shadow, warmth, blur, or elevation is invalid because the modal loses sophistication and depth.

## Contrast rules

- Backdrop must suppress the page without becoming the design.
- Lightbox shell must be distinct from the backdrop.
- Media must remain the focal object.
- Controls must remain readable and touch-safe.
- CTA text must pass contrast.
- Close button must be visible, keyboard reachable, and not hidden behind media.

## Media rules

- Grid cards should use still image or slow Ken Burns.
- Video may play only after the customer opens the item detail.
- Video must be muted by default.
- Video must have a poster image.
- Video must pause on close.
- Reduced-motion mode must use poster image by default.

## Forbidden

- Autoplay audio.
- Autoplay video in every menu card.
- Animated prices.
- Moving checkout instructions.
- Text-only close affordance with poor visibility.
- CTA hidden below long content.
- Modal surface blending into overlay.
- Food photos over-darkened until they stop looking appetizing.

## Mobile layout

```text
media top
item name + price
short description
variants / add-ons
quantity
sticky add-to-cart action inside sheet
```

## Desktop layout

```text
media left
decision panel right
CTA near bottom of decision panel
```

## Review question

Can the customer answer these in five seconds?

```text
What item is this?
How much is it?
What options are available?
Can I add it now?
How do I close this?
```