# F&B Taste and Palette Design Skill

This skill turns vague F&B visual requests into reviewable design decisions.

It is intended for agent use inside `ARH-FNB-Webapp`, especially when changing customer-facing menu aesthetics, owner/admin theme controls, food media, motion, lightboxes, or palette behavior.

## Why this exists

Agents often know how to change CSS but struggle with taste. The common failure is treating taste as a subjective color preference instead of a bounded design system.

This skill makes taste operable by separating:

```text
owner intent
→ resolved vibe
→ palette tokens
→ typography roles
→ layout behavior
→ media/motion policy
→ validation gates
```

## Core outputs

- `SKILL.md` — runtime routing and non-negotiable floor.
- `registries/` — stable vibe and palette registries.
- `schemas/` — owner-facing design config contract.
- `recipes/` — how agents translate requests into changes.
- `contracts/` — component-level taste and safety contracts.
- `checklists/` — review gates for contrast, media, lightboxes, and owner controls.
- `references/` — GitHub-native governance alternatives.
- `route-index.yml` — trigger-to-resource loading map.

## Primary rule

```text
The owner chooses vibe.
The platform resolves design.
The developer owns the adapter.
The agent follows the registry.
Validation protects trust.
```

## Scope

This PR adds documentation and skill assets only. It does not modify production app files, version folders, Firebase structure, Cloudflare configuration, or active workflows.

## Suggested future integration

After review, consider adding:

1. a schema validation job for `fnb.design.config.json`;
2. a pull request checklist for design changes;
3. CODEOWNERS review for `.claude/skills/` and `design-templates/`;
4. a non-blocking GitHub Actions workflow for JSON syntax and skill structure checks;
5. branch protection requiring the checks above before merge.

Do not wire this skill into owner-facing UI until the agent/reviewer loop approves the registry and schema vocabulary.