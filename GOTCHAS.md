# GOTCHAS & Hard-Learned Engineering Lessons

> Real failure modes encountered across F&B webapp development and how they are permanently prevented in **ARH-MAKAN**.

---

### 1. The "Invisible Dialog" Query Selector Bug
* **Incident (2026-08-04 in Showroom)**: `openItem()` wrote modifier choices into the DOM, but `document.querySelector('[data-item-detail]')` matched an invisible template element first. The rendered modal stayed empty, yet JS state tests passed.
* **Rule**: Always target unique ID selectors (`#item-modal`) or verify rendered element visibility (`offsetParent !== null`) before attaching event handlers or writing innerHTML.

---

### 2. Browser AudioContext Autoplay Blocking
* **Incident (`amogha-cafe`/KDS)**: Browsers block synthesized Web Audio chimes on page load without a user gesture.
* **Rule**: The KDS surface initializes `AudioContext` in a suspended state and renders an amber "Tap to Activate Kitchen Audio" banner on first load. Once tapped, audio unlocks permanently for that session.

---

### 3. Dropped Table Session on Customer Page Reload
* **Incident (`ChefOS`/Customer)**: Refreshing the menu after navigating back from the cart dropped the `?table=Txx` query param, causing subsequent orders to submit as `table: undefined`.
* **Rule**: Table context from query parameter is immediately cached in `sessionStorage` (`arh_table_id`) and `localStorage`. All cart and checkout mutations pull from the persistent table session manager.

---

### 4. ESC/POS Thermal Receipt Character Width Overflow
* **Incident (`amogha-cafe`/POS)**: Long menu item names (e.g. *"Double Smoked Brisket Cheese Burger"*) caused price columns to wrap onto the next line on 58mm thermal rolls.
* **Rule**: Receipt text formatter enforces strict line widths: 32 columns for 58mm, 48 columns for 80mm, with left-aligned truncated item names and right-aligned prices.

---

### 5. Multi-Tab State Desynchronization
* **Incident (Showroom preview)**: Modifying an order in POS didn't immediately update KDS in another tab without a full page refresh.
* **Rule**: All surfaces subscribe to a unified `BroadcastChannel('arh_makan_channel')`. Every order state change publishes an immediate broadcast payload with timestamp and action type.
