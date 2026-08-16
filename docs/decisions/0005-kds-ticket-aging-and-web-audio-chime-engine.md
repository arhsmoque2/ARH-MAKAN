# ADR-0005: Kitchen KDS Ticket Aging and Web Audio Chime Engine

## Status
Accepted (2026-08-17)

## Context
In a loud, fast-paced kitchen, cooks cannot constantly check visual screens for new orders. Relying on external audio files (`.mp3` / `.wav`) introduces network latency, missing asset errors, and browser autoplay blocks. Furthermore, cooks need immediate visual cues for tickets exceeding SLA prep times.

## Decision
1. **Web Audio Synthesized Chime Engine** (absorbed from `amogha-cafe/kitchen`):
   - Chimes are synthesized purely via browser `AudioContext` oscillators (sine/triangle waves at 880Hz $\rightarrow$ 1760Hz chime envelope). Zero external audio file download, zero latency.
   - Includes a visual "Audio Enabled" permission banner conforming to browser user-gesture policies.
2. **Visual Ticket Aging Algorithm**:
   - Tickets compute dynamic age from `created_at` timestamp:
     - **Green (`< 10 mins`)**: Normal prep window.
     - **Amber (`10 - 20 mins`)**: Warning / approaching SLA.
     - **Pulsing Red (`> 20 mins`)**: Overdue / high priority alert.
3. **Station Routing & Bump Bar**:
   - Items carry station tags (`grill`, `fry`, `bar`, `expo`). Chefs can filter KDS to display only relevant station items or view the complete master kitchen flow.
   - Interactive bump controls allow checking off individual items or marking the entire ticket `Ready for Runner`.

## Consequences
- 100% reliable audio alerting without external dependencies, instant visual prioritization for kitchen speed, and reduced food delivery delays.
