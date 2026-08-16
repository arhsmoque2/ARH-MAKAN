# GitHub-Native Governance Options

This reference lists more official GitHub facilities that can reduce custom scripts and make agent changes easier to review.

## 1. GitHub Actions

Use Actions for declarative repository checks triggered by pull requests.

Good first checks for this repo:

```yaml
checks:
  json_syntax:
    files:
      - versions.json
      - design-templates/**/*.json
      - .claude/skills/**/*.json
  markdown_presence:
    files:
      - AGENTS.md
      - README.md
      - .claude/skills/**/SKILL.md
  static_contract:
    command: uv run --script recipes/ubap-check.py
  html_static_contract:
    command: uv run --script recipes/verify-html-static-contract.py
```

Recommendation: start with non-deploying checks only. Do not let a workflow mutate store branches until governance is mature.

## 2. Branch protection rules / rulesets

Use protected branches or repository rulesets so `main` requires passing checks and review before merge.

Suggested rule intent:

```yaml
main:
  require_pull_request: true
  require_status_checks:
    - json syntax
    - ubap check
    - html static contract
  block_force_push: true
  require_linear_history: optional
```

## 3. CODEOWNERS

Use CODEOWNERS to request review from the right owner when sensitive paths change.

Example policy:

```text
# Design and agent skills
.claude/skills/                 @arhsmoque

design-templates/               @arhsmoque

# Deployment and billing surfaces
.github/workflows/              @arhsmoque
billing-ledger/                 @arhsmoque
wrangler.jsonc                  @arhsmoque

# Version packages
v*/                             @arhsmoque
```

## 4. Pull request templates

Use `.github/pull_request_template.md` to force every agent PR to state:

- purpose;
- affected surface;
- risk class;
- files changed;
- validation performed;
- rollback path;
- reviewer focus.

This gives agents a governance envelope without needing more scripts.

## 5. Issue forms

Use GitHub Issue Forms for structured requests:

- New store onboarding;
- Design/theme change;
- Feature request;
- Bug report;
- Store owner content update;
- Operator incident.

Issue Forms convert vague human input into typed fields that agents can consume more safely.

## 6. Environments and deployment protection

Use GitHub Environments for deployment gates.

Example:

```yaml
environments:
  preview:
    reviewers: []
  production:
    required_reviewers:
      - repo_owner
```

This is useful before allowing GitHub Actions to deploy to Cloudflare or mutate production-adjacent state.

## 7. Required reviewers and draft PRs

Make agent PRs draft by default when they touch:

- `.github/workflows/`;
- `billing-ledger/`;
- `recipes/` that mutate external services;
- store provisioning workflows;
- Firebase rules;
- version propagation scripts.

## 8. Dependabot

Use Dependabot for dependency update PRs where applicable, especially if the repo grows Node or workflow dependencies later.

This repo is currently largely zero-build-step, so Dependabot value is higher for GitHub Actions and any future package manifests than for the static app itself.

## 9. Code scanning and secret scanning

Use GitHub Advanced Security features where available, or lighter alternatives, to catch accidental secret exposure and risky patterns.

For this repo, secret scanning matters because store, billing, Cloudflare, Firebase, OpenRouter, and Imgur configuration boundaries exist.

## 10. Releases and tags

Use GitHub Releases or tags for stable version package milestones.

Possible convention:

```text
fnb-skill-v0.1
v6-candidate-qr-payment
registry-multitenancy-milestone-1
```

Do not use releases as a replacement for `versions.json`; use them as external audit milestones.

## 11. GitHub Projects

Use GitHub Projects for roadmap governance:

- Ideation;
- Ready for design;
- Ready for build;
- In PR;
- Needs review;
- Approved;
- Released;
- Deferred.

This can replace scattered TODOs when many agents are working across the repo.

## Recommended adoption order

```text
1. Pull request template
2. CODEOWNERS
3. JSON/Markdown-only GitHub Actions check
4. Branch protection requiring that check
5. Issue forms
6. Environment-gated deployment workflows
7. Projects for roadmap and operator visibility
8. Release tags for version milestones
```

## Design rule

Prefer GitHub-native governance when the rule is repository-wide, review-oriented, or lifecycle-oriented.

Prefer repo scripts when the rule needs domain-specific inspection, local dry-run behavior, external service probing, or deterministic transformation.