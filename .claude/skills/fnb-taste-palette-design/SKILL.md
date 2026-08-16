---
name: fnb-taste-palette-design
description: Use when designing, reviewing, or modifying F&B webapp aesthetics, customer vibes, palettes, contrast, typography, menu layout, hero banners, item lightboxes, food media, motion, or owner-facing design controls. Route vague requests such as "make it classy", "make it premium", "soften contrast", "fix the dark lightbox", or "add video tastefully" through this skill before changing UI/theme files.
---

# F&B Taste and Palette Design

## Core stance

F&B design is not decoration.

An F&B frontend is a digital service counter. It must create appetite, communicate menu facts, expose clear actions, and preserve order reliability.

Taste is translated through:

1. contrast discipline;
2. palette roles;
3. typography responsibility;
4. layout hierarchy;
5. media and motion control;
6. owner-safe design choices;
7. validation gates.

## When to use

Use this skill when a request includes:

- make it classy, premium, warmer, modern, more energetic, or more homemade;
- improve contrast or reduce glare;
- fix lightbox depth, modal contrast, or dark-on-dark flatness;
- choose or repair a palette;
- choose fonts or layout density;
- improve food media treatment;
- add video, shorts, Ken Burns, or motion;
- create owner/admin design controls;
- review F&B frontend taste issues.

## Do not start from colors

First classify the situation:

```yaml
situation_scan:
  store_type: "home_business | cafe | street_food | dessert_drinks | office_lunch | premium_specialty | family_casual | unknown"
  customer_rhythm: "repeat_quick_order | browse_before_order | compare_many_items | order_set_or_package | ask_on_whatsapp_first | unknown"
  menu_size: "small | medium | large | unknown"
  order_path: "whatsapp | qr_payment | pickup | delivery | mixed | unknown"
  media_quality: "basic_phone_photos | good_photos | strong_photos_and_videos | unknown"
  customer_group: "students_youth | working_adults | families | office_customers | premium_customers | mixed_local_customers | unknown"
  desired_vibe: ""
  failure_risk: ""
```

Then resolve design:

```yaml
resolved_design:
  customer_vibe: ""
  palette_id: ""
  typography_id: ""
  layout_archetype: ""
  menu_density: ""
  media_policy: ""
  motion_level: ""
  contrast_policy: "wcag_aa_minimum"
  validation_required: true
```

## Non-negotiable floor

- Body text must pass WCAG AA contrast.
- CTA text must pass WCAG AA contrast.
- Focus states must remain visible.
- Menu facts must not be hidden inside images.
- Prices, variants, availability, and the order path must remain clear.
- Reduced motion must be respected.
- Grid autoplay video is forbidden by default.
- Owner choices must not break checkout reliability.
- Lightboxes must have visible plane separation: backdrop, shell, media, controls.

## Owner / system boundary

The owner chooses business intent:

```yaml
owner_controls:
  - customer_vibe
  - premium_level
  - contrast_comfort
  - menu_density
  - media_intensity
  - video_behavior
  - hero_style
  - photo_style
  - font_mood
  - checkout_emphasis
```

The platform resolves safe implementation:

```yaml
platform_resolves:
  - palette_tokens
  - typography_pairing
  - layout_variant
  - component_density
  - media_policy
  - motion_policy
  - contrast_validation
  - state_preview
  - rollback_requirement
```

The owner controls expression. The repo owner controls platform safety.

## Classy rule

Classy is not dark mode. Classy is not gold. Classy is restraint plus clarity:

```text
low noise
clear hierarchy
rich but restrained palette
high-quality spacing
controlled accents
quiet confidence
no desperate decoration
```

A design may only be called classy when it is accessible, comfortable, layered, restrained, and mood-correct.

## Contrast doctrine

Contrast is not brightness difference. Contrast is responsibility separation:

- Text separates from its surface.
- Cards separate from the page.
- Lightboxes separate from the overlay.
- CTAs separate from neutral actions.
- Menu facts separate from decorative prose.
- Food media separates from text overlays.
- Motion separates moments of focus from moments of rest.

## Fast route map

```yaml
route:
  make_it_classy:
    load:
      - registries/fnb-vibe-registry.json
      - registries/fnb-palette-registry.json
      - recipes/resolve-owner-vibe-to-design.recipe.md
      - checklists/fnb-taste-review-checklist.md
    default_resolution:
      customer_vibe: premium_editorial
      premium_level: premium
      media_intensity: gentle
      video_behavior: lightbox_only
      contrast_comfort: standard
    forbid:
      - gold_on_black_by_default
      - tiny_faint_text
      - grid_autoplay_video

  fix_lightbox:
    load:
      - contracts/item-lightbox.contract.md
      - checklists/fnb-taste-review-checklist.md
    required:
      - backdrop_shell_separation
      - shell_media_separation
      - visible_close_control
      - stable_add_to_cart_action

  add_video:
    default_resolution:
      video_behavior: lightbox_only
    forbid:
      - autoplay_video_in_every_card
      - audio_autoplay
      - video_without_poster
```

## Output contract

When using this skill, report:

```yaml
design_result:
  interpreted_request: ""
  selected_vibe: ""
  resolved_palette: ""
  resolved_typography: ""
  resolved_layout: ""
  resolved_media_policy: ""
  component_changes: []
  validation_required: []
  safety_locks_applied: []
  anti_patterns_avoided: []
  remaining_risks: []
```

Do not claim a design is ready until the relevant checklist passes.