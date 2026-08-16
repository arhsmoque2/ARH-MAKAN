# ADR-0006: Counter POS Multi-Tender Settlement and ESC/POS Thermal Printing

## Status
Accepted (2026-08-17)

## Context
During cashier checkout, friction occurs when handling mixed payment methods (e.g. paying part cash, part DuitNow QR, or splitting across friends) or when printing physical receipts on standard 58mm/80mm thermal printers.

## Decision
1. **High-Speed Touch Layout**: Left-hand category rail, center item grid with search & variant modal, and right-hand persistent order ticket with 1-tap quantity adjustments.
2. **Multi-Tender Engine**:
   - Cash: Quick numeric pad with change computation (e.g. RM50 tendered against RM38.50 $\rightarrow$ RM11.50 change).
   - DuitNow Dynamic QR: Instant QR generation with exact cents payload.
   - Split Tender: Support for splitting a single ticket across multiple payment methods or dividing by table seats.
3. **ESC/POS & Browser Thermal Printing**:
   - Generates formatted, monospace receipt canvas/text specifically styled for 58mm and 80mm roll widths with store logo, tax breakdown (SST), table number, and barcode/QR verification footer.

## Consequences
- Ultra-rapid checkout turnaround (<5 seconds per transaction), full payment flexibility, and seamless hardware printer compatibility.
