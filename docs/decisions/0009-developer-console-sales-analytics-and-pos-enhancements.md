# ADR-0009: Developer Console (DevCon), In-App Sales Analytics Governance, and POS Enhancements

## Status
Accepted (2026-08-18)

## Context
As `ARH-MAKAN` scaled into a full commercial multi-surface suite, store operators and developers required:
1. High-density observability into sales velocity, Average Order Value (AOV), best-seller leaderboards, and peak dining heatmaps.
2. A governance mechanism where developers can toggle sales analytics visibility on the manager Admin Hub (`/admin/`) while keeping it permanently accessible in a dedicated Developer Console (DevCon).
3. Self-hosted Beacon/Flight-Recorder style error telemetry and exception grouping.
4. Operational cashier features absorbed from top open-source benchmarks (URY-inspired Table SLA Timers, Table Transfer protocol, and daily cash float reconciliation).
5. A desktop native shell scaffold under `operator-plane/desktop-devcon/` for Tauri v2 desktop viewing.

## Decision
1. **Dedicated Developer Console (`/devcon/`)**:
   - Implemented a separate operator HUD featuring permanent In-App Sales & Velocity Analytics, Root-Cause Error Telemetry, 3-Tier State Engine Inspector, and Scenario Injector.
2. **Feature Gate & Admin Visibility Toggle**:
   - DevCon hosts the master toggle for `show_admin_analytics`. When enabled, the Admin Hub (`/admin/`) displays the sales velocity and heatmap section; when disabled, Admin hides the section. DevCon retains permanent visibility regardless of toggle state.
3. **Table SLA Attention Aging & Transfer (URY Protocol)**:
   - Cashier POS (`/pos/`) table nodes calculate elapsed time since order creation. Active tickets $>30\text{m}$ pulse with an amber `⚠️ Attention` badge; $>60\text{m}$ pulse with a red `🚨 Overdue` badge.
   - Cashier POS supports moving open tickets between tables with 1 click via the Table Transfer modal.
4. **Daily Cash Float Reconciliation**:
   - Added shift opening float logging and closing drawer reconciliation with automatic Over/Short discrepancy calculation.
5. **Operator Plane Desktop DevCon Scaffold (`operator-plane/desktop-devcon/`)**:
   - Scaffolded a lightweight Tauri v2 desktop shell mirroring the local `/devcon/` interface.

## Consequences
- Enhanced operational awareness for managers and zero-friction telemetry debugging for developers.
- Real-time floor staff SLA alerts prevent forgotten tables during peak rush hours.
- Clear financial drawer accountability for cash transactions.
