# Security Policy for ARH-MAKAN

## 🛡️ Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## 🔒 Reporting a Vulnerability

If you discover a security vulnerability in ARH-MAKAN:

1. **Do not create a public issue.**
2. Report the vulnerability privately via the ARH Autonomous Agent Operator security channel or open an encrypted security advisory.
3. Include clear reproduction steps, affected surfaces (Admin, POS, KDS, Customer, Showroom, Edge Worker), and potential impact.

## 🔐 Automated Security Standards

- **Zero Secret Commits**: Pre-commit hooks enforce local credential and private token scanning.
- **Actions Budget & Least Privilege**: All CI workflows enforce `permissions: contents: read` and explicit `timeout-minutes` ceilings.
- **Unguarded Handler Auditing**: Static linters prevent raw `eval`, dangerous string injections into event handlers, and unvalidated payloads.
- **Edge Worker CORS & Sanitization**: Cloudflare Worker runtimes validate incoming payloads and strip unauthorized mutation requests.
