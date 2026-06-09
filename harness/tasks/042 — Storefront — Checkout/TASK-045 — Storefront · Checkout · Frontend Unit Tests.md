# TASK-045: Storefront · Checkout · Frontend Unit Tests

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | athulgopal-adviciya |
| **Status** | ✅ Done |
| **Priority** | High |
| **Sprint** | Sprint 1 |
| **Story Points** | 5 |
| **PRD Reference** | Storefront — Checkout |
| **Architecture Ref** | harness/architecture.md |
| **Start Date** | 2026-04-21 |
| **Due Date** | 2026-04-21 |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-21 |

---

## Description
Write Vitest + Testing Library unit tests for all checkout step components (AddressStep, ShippingStep, PaymentStep, ConfirmationStep, CheckoutStepper) and the Zod address validation schema. All Medusa API calls and payment provider SDKs are mocked — tests operate purely at the component and form validation layer.

---

## Sub Tasks
- [x] AddressStep — render, Zod field validation, server action call, error handling, loading state
- [x] ShippingStep — render, option loading, auto-select, selection, action call, error/empty states, loading state
- [x] PaymentStep — render, INR/USD/AED method rendering, order placement, error/retry, loading state, back button
- [x] ConfirmationStep — render, order details, address display, shipping method, payment provider, pricing, CTA links
- [x] CheckoutStepper — render, active/completed/pending step states, accessible nav label
- [x] Shared mock factory (`checkout.mock.ts`) — reusable test data for all checkout tests

---

## Acceptance Criteria
- [x] All 5 checkout component test suites created under `apps/storefront/src/components/checkout/`
- [x] All Medusa server actions mocked via `vi.mock` — no real API calls
- [x] Razorpay and Stripe SDKs mocked where referenced
- [x] Zod address validation tested through AddressStep form submission (IN PIN code, US ZIP, email format, field lengths)
- [x] Each test file passes Vitest in isolation
- [x] No `any` types in test files
- [x] No `console.log` left in test files
- [x] PR merged to main — branch: `TASK-045-storefront-checkout-frontend-unit-tests`

---

## Technical Notes
- Validation logic is exercised through RHF form submission in AddressStep, not by importing the Zod schema directly
- `checkout.mock.ts` at `apps/storefront/src/lib/checkout.mock.ts` provides shared mock factories (cart, shipping options, confirmation data)
- `next/image` is mocked globally to render a plain `<img>` for test assertions
- `next/navigation` (`useRouter`) is mocked in files that need it
- INR → Razorpay, USD/AED → Stripe payment provider branching is tested in both PaymentStep and ConfirmationStep

---

## Files Created
```
apps/storefront/src/components/checkout/AddressStep.test.tsx       (224 lines)
apps/storefront/src/components/checkout/ShippingStep.test.tsx      (167 lines)
apps/storefront/src/components/checkout/PaymentStep.test.tsx       (330 lines)
apps/storefront/src/components/checkout/ConfirmationStep.test.tsx  (196 lines)
apps/storefront/src/components/checkout/CheckoutStepper.test.tsx   (87 lines)
apps/storefront/src/lib/checkout.mock.ts                           (123 lines)
```

---

## API Endpoints
N/A — this task has no API endpoints

---

## UI Screens
- Checkout flow — Address → Shipping → Payment → Confirmation

---

## Related Test Cases
- AddressStep: 12 test cases (render, validation, action, errors, loading)
- ShippingStep: 12 test cases (render, load, select, action, errors, loading)
- PaymentStep: 11 test cases (render, INR/USD/AED, order, error, retry, loading, back)
- ConfirmationStep: 16 test cases (render, address, shipping, payment, pricing, CTAs)
- CheckoutStepper: 9 test cases (render, step states, accessible nav)

## Dependencies
- **Blocked by:** TASK-042 (Frontend) ✅
- **Blocks:** None

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Checkout/TASK-045 — Storefront · Checkout · Frontend Unit Tests.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-21 | Task started. Created shared mock factory at `apps/storefront/src/lib/checkout.mock.ts` |
| 2026-04-21 | AddressStep tests written — 12 cases covering render, Zod field validation (IN/US postal, email, lengths), server action call, server error, and loading state |
| 2026-04-21 | ShippingStep tests written — 12 cases covering load, auto-select, option display, FREE label, selection, action call, back button, error and empty states, loading state |
| 2026-04-21 | PaymentStep tests written — 11 cases covering INR/USD/AED method rendering, order placement, error banner, retry button, processing state, back button |
| 2026-04-21 | ConfirmationStep tests written — 16 cases covering full order summary, address (with/without line 2), shipping method, payment provider (Razorpay/Stripe), pricing, complimentary shipping, CTAs |
| 2026-04-21 | CheckoutStepper tests written — 9 cases covering all 4 steps, active/completed/pending states, accessible nav label |
| 2026-04-21 | PR merged to main under branch `TASK-045-storefront-checkout-frontend-unit-tests` (commit b9937e4) |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-21 | 3 | Full implementation — all 5 test suites + mock factory |

---

## Review Notes
- 60 total test cases across 5 suites (1,004 lines of test code + 123 lines of shared mocks)
- Zod validation is tested end-to-end through RHF form submission rather than schema unit tests — more realistic coverage
- Razorpay/Stripe branching tested in PaymentStep and ConfirmationStep via currency prop
