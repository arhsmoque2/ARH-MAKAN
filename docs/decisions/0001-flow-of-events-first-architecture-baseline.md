# ADR-0001: Flow-of-Events-First Architecture Baseline

## Status
Accepted (2026-08-17)

## Context
F&B software frequently suffers from catastrophic divergence between abstract software models and real-world restaurant floor dynamics. Common points of failure include:
- A customer at Table 5 orders, but the app lacks table binding or modifier enforcement, resulting in incomplete kitchen tickets.
- A cashier cannot quickly settle a bill during peak rush because the UI requires multiple nested modal confirmations.
- A kitchen chef misses orders because an external audio file fails to load or autoplays were blocked by browser permissions.
- Code passes unit tests and state assertions, but visual DOM bugs leave modal dialogs unclickable for real customers.

## Decision
1. **Flow of Events Precedes Code**: Every surface and feature must originate from the physical flow of events outside software:
   $$\text{Physical Reality} \longrightarrow \text{Required Actions} \longrightarrow \text{Workflow Design} \longrightarrow \text{Implementation} \longrightarrow \text{Rendered Pixel Verification}$$
2. **Multi-Entrypoint Separation**: The system is split into dedicated actor surfaces (`customer`, `kds`, `pos`, `admin`, `showroom`), ensuring each entrypoint has a specialized, frictionless layout.
3. **Rendered Pixel Proof**: Verification requires rehearsing the actual rendered DOM and screenshots rather than mocking JS state.

## Consequences
- **Positive**: Zero discrepancy between what the customer/staff sees and what the business enforces.
- **Guardrail**: Modifying an action requires reviewing all affected actor entrypoints (e.g. updating menu modifiers touches customer selection, POS grid, and KDS ticket rendering).
