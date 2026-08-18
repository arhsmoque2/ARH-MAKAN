# ADR-0012: 2-Way Static Malaysian DuitNow QR Proof & Real-Time Cashier Verification Handshake Engine

## Status
**Accepted & Implemented** (PR #8, Release v2.7.0)

## Context
Malaysian small-to-medium F&B operators (e.g. Woodfire Kulim) avoid third-party payment gateways (such as Stripe, ToyyibPay, or HitPay) because they levy a 1.5%–3.0% transaction fee and impose 2–3 day payout holding periods. Instead, operators rely on **Static DuitNow QR / MAE / Touch 'n Go** standees for 0% fee and instant bank settlement.

However, standard self-ordering systems typically lack a streamlined mechanism for customers to submit static QR transfer proof and for cashiers to verify bank transfers without manual table chaos.

## Decision
We implemented a **Zero-Dependency 2-Way Static DuitNow QR Proof & Handshake Engine** across the ARH-MAKAN platform:

1. **Merchant Profile & QR Configurator (`/admin/` & `/devcon/`)**:
   - Store owners can input Bank Name, Account Holder Name, Account Number/DuitNow ID, and WhatsApp Number.
   - Allows upload of custom laminated DuitNow QR standee images or generates ISO-compliant SVG QR codes on the fly.
2. **Client-Side High-Speed Canvas Image Compressor (`shared/image-compressor.js`)**:
   - Absorbed from `digital-menu` & `shutterorder` patterns.
   - Automatically compresses high-resolution smartphone camera screenshots down to ~60–80KB WebP/JPEG in <30ms before saving to local state, preventing storage overflow and enabling lightning-fast cross-surface synchronization.
3. **In-App Customer Checkout Flow (`/customer/`)**:
   - Displays store DuitNow QR, bank account details, exact payable amount with 1-tap copy, and order reference ID with 1-tap copy.
   - Provides an optional receipt screenshot uploader and a 1-tap `📲 Send Proof via WhatsApp` fallback.
   - Live Stepper shows `Verifying ⏳` status while waiting for cashier confirmation.
4. **Cashier POS Real-Time Verification Drawer (`/pos/`)**:
   - Displays glowing verification badge in topbar with notification chimes upon receipt submission.
   - Cashier can view the attached receipt thumbnail with 1-tap enlargement, verify bank credit, and tap `✅ Verify & Fire to KDS` (auto-printing ESC/POS thermal receipt).
5. **Kitchen KDS Gating (`/kds/`)**:
   - Tickets with unverified payment are automatically gated until cashier confirmation, preventing kitchen waste.

## Consequences
- **Zero Merchant Fees**: Complete payment sovereignty with 0% intermediary commission.
- **Instant Bank Settlement**: Funds land directly in the owner's bank account in real time.
- **Resilient Verification**: Dual verification paths (in-app compressed receipt image + WhatsApp fallback).
- **100% Green CI Gates**: All 12 devkit gates pass with zero regressions.
