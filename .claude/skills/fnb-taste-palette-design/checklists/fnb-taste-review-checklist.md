# F&B Taste Review Checklist

Use this checklist before calling a taste, palette, lightbox, media, or owner-design change complete.

Score each lens as `Pass`, `Risk`, or `Fail`.

## 1. Situation fit

- Store archetype is clear.
- Customer group is clear.
- Vibe matches business context.
- Primary action is visible within three seconds.
- Design supports appetite and ordering, not decoration alone.

## 2. Contrast

- Body text passes contrast.
- Muted text is still readable when meaningful.
- CTA text passes contrast.
- Focus ring is visible.
- Cards separate from page.
- Modal/lightbox separates from backdrop.
- Text over image has a safe zone.
- "Soft" contrast does not mean faint text.

## 3. Typography

- Display font carries identity only.
- Body font carries menu facts.
- Price is immediately clear.
- Variants and checkout use readable utility type.
- Decorative font is not used for transaction facts.
- Font count is limited and intentional.

## 4. Layout

- Menu is not hidden below excessive hero height.
- Category navigation is visible.
- Menu cards scan quickly.
- Price and add action are visible.
- Sticky cart does not block important content.
- Desktop enhances; mobile remains primary.

## 5. Media

- Food photos remain appetizing.
- Food texture and true color are preserved.
- Image crop keeps item recognizable.
- Text is not baked into essential menu images.
- Grid video autoplay is absent.
- Lightbox video is user-intent-based.
- Reduced-motion has a still fallback.

## 6. Lightbox

- Backdrop, shell, media, and controls are distinguishable.
- Close button is visible and reachable.
- Price stays visible.
- Add-to-cart remains available.
- Video pauses on close.
- Dark-on-dark flatness is avoided.

## 7. Owner/admin adapter

- Owner choices are business-facing.
- Raw unsafe primitives are not exposed first.
- Preview includes menu, lightbox, cart, closed, sold-out, and error states.
- Publish requires validation.
- Rollback or previous snapshot is planned.

## 8. Anti-pattern scan

Fail if any of these are present:

- fake premium black-and-gold default;
- tiny luxury text;
- low-contrast beige/gray text;
- animated prices;
- video autoplay in every card;
- hover-only critical action;
- hidden cart after item added;
- text directly over busy food photo without overlay/panel;
- lightbox blends into backdrop;
- owner can disable focus ring or checkout visibility.

## Verdict shape

```yaml
fnb_taste_review:
  verdict: "Pass | Risk | Fail"
  selected_vibe: ""
  strongest_match: ""
  highest_risk_issue: ""
  required_fixes: []
  optional_polish: []
  validation_needed: []
```