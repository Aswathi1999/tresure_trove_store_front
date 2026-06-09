# TASK-034: Storefront · Cart · Frontend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Completed |
| **Priority** | — |
| **Sprint** | — |
| **Story Points** | — |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | — |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-20 |

---

## Description
Build the slide-in cart drawer UI for the Treasure Trove storefront. This includes the CartDrawer panel (Framer Motion slide-in animation), CartItem rows (product image, title, variant, quantity controls, remove button), CartSummary (subtotal, estimated total, taxes note), and edge-case states for an empty cart, out-of-stock items, and price changes. All cart operations use mock functions — no real Medusa API calls yet. Cart open/close state lives in the Zustand store at `@/stores/cart.ts`.

---

## Sub Tasks
- [x] Create Zustand cart store at `@/stores/cart.ts` with mock cart state and mock action functions (addItem, removeItem, updateQuantity, openDrawer, closeDrawer)
- [x] Create mock cart data file at `@/lib/cart.mock.ts` (mock line items, totals, currency)
- [x] Build `CartDrawer.tsx` — slide-in panel from the right using Framer Motion, overlay backdrop, close on backdrop click and ESC key
- [x] Build `CartItem.tsx` — product image (next/image), product title, variant label, quantity stepper (+/-), remove (trash) icon, line total price
- [x] Build `CartSummary.tsx` — subtotal row, shipping note, estimated total, "Proceed to Checkout" CTA button
- [x] Build `EmptyCart.tsx` — illustration or icon, "Your cart is empty" message, "Continue Shopping" link back to `/products`
- [x] Handle out-of-stock edge case in `CartItem.tsx` — show "Out of Stock" badge, disable quantity controls, highlight row in warning state
- [x] Handle price-changed edge case in `CartItem.tsx` — show old price struck through, new price highlighted, inline warning message
- [x] Integrate CartDrawer into the root layout so it is available on all pages
- [x] Add `data-testid` attributes to all interactive elements (drawer, items, quantity buttons, checkout CTA)

---

## Acceptance Criteria
- [x] CartDrawer slides in from the right with a smooth Framer Motion animation and a dimmed backdrop overlay
- [x] Clicking the backdrop or pressing ESC closes the drawer
- [x] Each CartItem displays product image, title, variant, quantity controls, unit price, and line total
- [x] Quantity stepper decrements to a minimum of 1 (remove button handles full removal)
- [x] Remove button deletes the item from the mock cart store and the item disappears from the drawer
- [x] CartSummary correctly sums all line item totals from the mock store and shows subtotal and estimated total
- [x] "Proceed to Checkout" CTA navigates to `/checkout`
- [x] When the cart is empty, `EmptyCart` is shown inside the drawer with a "Continue Shopping" link
- [x] Out-of-stock items display a badge and have quantity controls disabled
- [x] Price-changed items show the old price struck through and a new price alongside an inline warning
- [x] Drawer is fully responsive — full-height on mobile, 420px wide on desktop
- [x] All interactive elements have `data-testid` attributes
- [x] No real API calls — all data flows from Zustand store seeded from mock data

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/storefront/src/components/cart/CartDrawer.tsx
apps/storefront/src/components/cart/CartItem.tsx
apps/storefront/src/components/cart/CartSummary.tsx
apps/storefront/src/components/cart/EmptyCart.tsx
apps/storefront/src/stores/cart.ts
apps/storefront/src/lib/cart.mock.ts
```

---

## API Endpoints
N/A — this task has no API endpoints

---

## UI Screens
- **Cart Drawer** — slide-in panel, list of CartItem rows + CartSummary at the bottom
- **Empty Cart State** — shown inside the drawer when no items are present
- **Out of Stock in Cart** — CartItem row with disabled controls and "Out of Stock" badge
- **Price Changed Since Added** — CartItem row with old price struck through and inline warning

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-036 (Integration Testing), TASK-037 (Frontend Unit Tests)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Cart/TASK-034 — Storefront · Cart · Frontend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-20 | Task started and completed. Built full cart drawer UI with CartDrawer, CartItem, CartSummary, and EmptyCart components. Zustand store and mock data set up. CartDrawer integrated into root layout. All sub-tasks and acceptance criteria met. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
