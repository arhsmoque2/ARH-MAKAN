# Recipe — Resolve Owner Vibe to Design

## Purpose

Convert owner/business-language requests into bounded F&B design choices.

Use this when the user says things like:

```text
make it classy
make it premium
make it warmer
make this home business feel trustworthy
make this menu more energetic
soften contrast
add short videos tastefully
```

## Step 1 — Classify business context

```yaml
business_context:
  store_type: ""
  customer_rhythm: ""
  menu_size: ""
  order_path: ""
  media_quality: ""
  customer_group: ""
  owner_words: ""
```

## Step 2 — Select stable vibe ID

Use only IDs from `registries/fnb-vibe-registry.json`.

Do not invent a new vibe unless the request clearly cannot be represented by the registry. If a new vibe is necessary, propose it as a registry addition, not a one-off CSS decision.

## Step 3 — Resolve owner controls

```yaml
owner_controls:
  customerVibe: "classic_cafe | premium_editorial | street_favourite | home_kitchen_warmth | modern_minimal | night_cafe | family_friendly | artisan_craft"
  premiumLevel: "simple | balanced | premium | luxury"
  contrastComfort: "soft | standard | strong"
  menuDensity: "compact | balanced | airy"
  mediaIntensity: "still | gentle | expressive"
  videoBehavior: "off | lightbox_only | hero_feature | best_seller_strip"
  heroStyle: "compact_status | editorial_photo | featured_item | promo_banner | trust_intro"
  photoStyle: "natural | warm | clean | dramatic"
  fontMood: "classic_serif | modern_sans | friendly_rounded | bold_street | artisan_editorial"
  checkoutEmphasis: "browsing_first | balanced | conversion_first"
```

## Step 4 — Apply safety locks

Always enforce:

```yaml
safety:
  wcagTarget: "AA"
  reducedMotion: true
  gridAutoplayVideo: false
  textOverImageRequiresSafeZone: true
  focusRingVisible: true
```

Soft contrast cannot mean unreadable text. Expressive motion cannot mean autoplay video in every menu card. Premium cannot mean black-and-gold by default.

## Step 5 — Preview important states

Review at least:

- first screen;
- menu grid;
- item with photo;
- item without photo;
- sold-out item;
- item with variants;
- item lightbox;
- sticky cart;
- closed store;
- failed image or offline state.

## Step 6 — Report bounded result

```yaml
design_result:
  interpreted_request: ""
  selected_vibe: ""
  owner_controls: {}
  resolved_palette: ""
  resolved_typography: ""
  resolved_layout: ""
  resolved_media_policy: ""
  safety_locks_applied: []
  validation_required: []
  anti_patterns_avoided: []
  remaining_risks: []
```

## Common resolutions

### "Make it classy"

```yaml
customerVibe: premium_editorial
premiumLevel: premium
contrastComfort: standard
menuDensity: airy
mediaIntensity: gentle
videoBehavior: lightbox_only
heroStyle: editorial_photo
photoStyle: warm
fontMood: classic_serif
checkoutEmphasis: balanced
```

### "Make it warmer / homemade"

```yaml
customerVibe: home_kitchen_warmth
premiumLevel: balanced
contrastComfort: standard
menuDensity: balanced
mediaIntensity: gentle
videoBehavior: lightbox_only
heroStyle: trust_intro
photoStyle: warm
fontMood: friendly_rounded
checkoutEmphasis: balanced
```

### "Make it energetic / street favourite"

```yaml
customerVibe: street_favourite
premiumLevel: simple
contrastComfort: strong
menuDensity: compact
mediaIntensity: expressive
videoBehavior: lightbox_only
heroStyle: featured_item
photoStyle: clean
fontMood: bold_street
checkoutEmphasis: conversion_first
```

## Fail conditions

Reject or revise the design if it:

- hides price or cart clarity;
- uses low-contrast text for meaningful information;
- uses decorative fonts on prices, variants, checkout, warnings, or states;
- relies on text baked into images;
- makes lightbox planes indistinguishable;
- autoplays video in every menu card;
- weakens reduced-motion support;
- cannot explain what customer feeling it serves.