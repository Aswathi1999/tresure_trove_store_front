# TASK-042: Storefront · Checkout · Frontend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Done |
| **Priority** | — |
| **Sprint** | Sprint 1 |
| **Story Points** | — |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-04-20 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-20 |

---

## Description
Build the multi-step checkout flow UI for the Treasure Trove storefront. The checkout has four steps: Step 1 — Delivery Address Form (React Hook Form + Zod validation), Step 2 — Shipping Method Selection (radio list of options with delivery estimates), Step 3 — Payment (Razorpay UI for INR, Stripe for USD/AED — UI integration only, payment provider SDKs initialised with mock keys), Step 4 — Order Confirmation (order summary, order ID, confirmation message, email notice). Edge cases include Payment Failed and Address Validation Error screens. No real Medusa API calls — all data flows from mock functions defined in `@/lib/checkout.mock.ts`.

---

## Sub Tasks
- [x] Create `@/lib/checkout.mock.ts` with mock functions: `mockGetShippingOptions`, `mockInitiatePayment`, `mockPlaceOrder`, and mock address/shipping/order data
- [x] Build `CheckoutStepper.tsx` — step indicator bar showing steps 1–4 with active/completed/pending states
- [x] Build `AddressStep.tsx` — full delivery address form with fields: full name, phone, address line 1, address line 2 (optional), city, state, pincode/zip, country selector. React Hook Form + Zod schema validation with inline error messages
- [x] Build `ShippingStep.tsx` — radio list of shipping options loaded from mock data, each showing carrier name, estimated delivery window, and price
- [x] Build `PaymentStep.tsx` — conditionally renders Razorpay checkout button (INR) or Stripe card element (USD/AED) based on cart currency. Uses mock payment functions — no live SDK calls
- [x] Build `ConfirmationStep.tsx` — order success state with order ID, itemised order summary, delivery address summary, and "Continue Shopping" link
- [x] Build payment failure edge case UI within `PaymentStep.tsx` — error message, retry button, and option to change payment method
- [x] Build address validation error state in `AddressStep.tsx` — server-side error message displayed inline beneath the form
- [x] Wire all steps together in `apps/storefront/src/app/checkout/page.tsx` using local state to track current step
- [x] Add `data-testid` attributes to all form fields, stepper items, payment buttons, and CTA buttons

---

## Acceptance Criteria
- [x] `CheckoutStepper` accurately reflects the current step (active) and completed steps with distinct visual states
- [x] `AddressStep` form validates all required fields on submit — shows inline Zod errors without page reload
- [x] Pincode/zip field validates format based on selected country (6 digits for India, 5–10 for others)
- [x] `ShippingStep` displays mock shipping options as a radio list; selecting one highlights it and enables the "Continue" button
- [x] `PaymentStep` renders the Razorpay button when cart currency is INR, and the Stripe card element otherwise
- [x] Clicking the mock payment action in `PaymentStep` transitions to `ConfirmationStep` with a mock order ID and summary
- [x] Payment failure state shows a descriptive error message and a "Try Again" button that re-renders the payment UI
- [x] `ConfirmationStep` displays the order ID, all ordered items, total amount, and the delivery address
- [x] "Continue Shopping" link on the confirmation step navigates to `/products`
- [x] Checkout page is a "use client" component — all step transitions are client-side without full page navigations
- [x] All form inputs and interactive elements carry `data-testid` attributes
- [x] No real API calls — all operations use mock functions from `@/lib/checkout.mock.ts`

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/storefront/src/app/checkout/page.tsx          ✅ created
apps/storefront/src/app/checkout/layout.tsx        ✅ created
apps/storefront/src/components/checkout/CheckoutStepper.tsx  ✅ created
apps/storefront/src/components/checkout/AddressStep.tsx      ✅ created
apps/storefront/src/components/checkout/ShippingStep.tsx     ✅ created
apps/storefront/src/components/checkout/PaymentStep.tsx      ✅ created
apps/storefront/src/components/checkout/ConfirmationStep.tsx ✅ created
apps/storefront/src/components/checkout/OrderSummary.tsx     ✅ created
apps/storefront/src/lib/checkout.mock.ts           ✅ created
```

---

## API Endpoints
N/A — this task has no API endpoints

---

## UI Screens
- **Step 1 — Address** — delivery address form with validation
- **Step 2 — Shipping** — shipping method radio selector
- **Step 3 — Payment** — Razorpay (INR) or Stripe (USD/AED) payment UI
- **Step 4 — Order Confirmation** — success state with order ID and summary
- **Payment Failed** — error state inside Step 3 with retry option
- **Address Validation Error** — server-side error state inside Step 1

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-044 (Integration Testing), TASK-045 (Frontend Unit Tests)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Checkout/TASK-042 — Storefront · Checkout · Frontend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-20 | Task started and completed. All 9 files created. Full 4-step checkout flow built: AddressStep (RHF + Zod, country-aware pincode validation), ShippingStep (mock options radio list), PaymentStep (Razorpay INR / Stripe USD-AED, failure state + retry), ConfirmationStep (order ID, itemised summary, delivery details, editorial image). CheckoutStepper shows active/completed/pending states. OrderSummary sticky sidebar with promo code field. All `data-testid` attributes added. TypeScript type check passes clean. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-20 | — | Full implementation — all sub-tasks and acceptance criteria completed |

---

## Review Notes
- Added `OrderSummary.tsx` as an additional component (not in original spec) to keep the sticky sidebar logic separate from step components
- `simulate-failure` checkbox included in PaymentStep for QA testing of the payment failure flow
- Mobile layout: order summary stacks above the form on screens below `lg` breakpoint
