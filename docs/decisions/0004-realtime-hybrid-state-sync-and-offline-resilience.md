# ADR-0004: Realtime Hybrid State Sync and Offline Resilience

## Status
Accepted (2026-08-17)

## Context
A restaurant floor requires instant multi-device coordination (Customer places order $\rightarrow$ KDS receives ticket $\rightarrow$ POS updates table status). However, restaurant Wi-Fi is notoriously unstable. If an internet blip drops an entire table's active cart or freezes the POS cashier, the business halts.

## Decision
We implement a 3-tier hybrid realtime sync architecture in `shared/realtime-adapter.js`:

1. **Tier 1: Browser `BroadcastChannel` (Instant Local Multi-Tab Sync)**:
   - All open browser tabs (Showroom, KDS, POS, Customer) communicate across an `arh_fnb_sync` channel with zero network latency (<5ms).
2. **Tier 2: `localStorage` / `IndexedDB` (Crash Resilience & Offline Queue)**:
   - Full active state (Orders, Table matrix, 86 inventory) is continuously serialized to persistent storage. If a device refreshes or loses connection, state is restored immediately.
3. **Tier 3: Cloud Realtime Provider (Firebase RTDB / WebSocket Gateway)**:
   - When configured, changes publish upstream to Firebase RTDB for cross-network restaurant synchronization. If offline, mutations queue locally and replay upon reconnection.

## Consequences
- Guaranteed sub-second responsiveness, seamless showroom demonstrations without requiring cloud setup, and rock-solid resilience against network dropouts.
