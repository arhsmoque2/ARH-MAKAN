# Manifest — fnb-taste-palette-design

## Package

```yaml
name: fnb-taste-palette-design
surface: skill
risk_class: read_only
status: proposed
repo: ARH-FNB-Webapp
branch: agent/fnb-taste-palette-design-skill
```

## Files

```text
SKILL.md
README.md
MANIFEST.md
route-index.yml
registries/fnb-vibe-registry.json
registries/fnb-palette-registry.json
schemas/fnb.design.config.schema.json
recipes/resolve-owner-vibe-to-design.recipe.md
contracts/item-lightbox.contract.md
checklists/fnb-taste-review-checklist.md
references/github-native-governance-options.md
```

## Review focus

Reviewers should check:

1. Whether the skill name is inferable and compatible with existing `.claude/skills/` naming.
2. Whether owner-facing options are business-readable.
3. Whether platform safety locks are strict enough.
4. Whether palette and vibe IDs are stable enough for future config.
5. Whether the skill overlaps with `design-templates/` or complements it.
6. Whether the schema should eventually live nearer to `design-templates/` or remain inside the skill.
7. Whether an actual GitHub Actions workflow should be added in a later PR.

## Non-goals in this PR

- No live template application.
- No config.js mutation.
- No Firebase writes.
- No branch/version propagation.
- No Cloudflare workflow change.
- No active CI workflow added yet.

## Suggested validation

Manual review:

```bash
find .claude/skills/fnb-taste-palette-design -type f | sort
python3 -m json.tool .claude/skills/fnb-taste-palette-design/registries/fnb-vibe-registry.json >/dev/null
python3 -m json.tool .claude/skills/fnb-taste-palette-design/registries/fnb-palette-registry.json >/dev/null
python3 -m json.tool .claude/skills/fnb-taste-palette-design/schemas/fnb.design.config.schema.json >/dev/null
```

Agent review:

```text
Ask a fresh agent to use this skill to resolve:
- make this menu classy
- fix the dark lightbox
- add a Spanish Latte lightbox video safely
- create a Home Kitchen Warmth owner setting
```

Pass condition: the agent produces bounded design decisions rather than raw CSS guesses.