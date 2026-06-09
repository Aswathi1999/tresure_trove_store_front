# TASK-043: Storefront · Checkout · Backend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Akshay |
| **Status** | ✅ Done |
| **Priority** | P0 |
| **Sprint** | Sprint 1 |
| **Story Points** | — |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-04-17 |
| **Due Date** | 2026-04-17 |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-18 |

---

## Description
Configure and verify all Medusa v2 Checkout API endpoints and backend dependencies required for the multi-step checkout flow. This includes shipping option configuration, payment provider setup (Razorpay for INR, Stripe for USD and AED), the order placement workflow, and the order confirmation email subscriber. Razorpay and Stripe payment providers must be registered in `medusa-config.ts`, and a custom Razorpay webhook handler must be added in `apps/backend/src/api/` to handle payment verification callbacks.

---

## Sub Tasks
- [x] Register Razorpay payment provider in `medusa-config.ts` with INR region assignment
- [x] Register Stripe payment provider in `medusa-config.ts` with USD and AED region assignments
- [ ] Confirm `POST /store/carts/:id/shipping-methods` — add shipping method to cart by option ID
- [ ] Confirm `POST /store/carts/:id/payment-sessions` — initialise payment session for the cart's region
- [ ] Confirm `POST /store/carts/:id/payment-sessions/:provider_id` — select active payment provider session
- [ ] Confirm `POST /store/orders` — place order from completed cart (complete cart endpoint)
- [x] Build Razorpay webhook handler at `apps/backend/src/api/webhooks/razorpay/route.ts` — verify HMAC signature, mark payment as captured in Medusa
- [x] Set up Medusa order confirmation email subscriber in `apps/backend/src/subscribers/` — fires on `order.placed` event and triggers transactional email
- [ ] Verify shipping options are seeded in the Medusa admin for all regions (INR, USD, AED) with correct prices
- [ ] Confirm `GET /store/shipping-options` returns available options filtered by cart region

---

## Acceptance Criteria
- [ ] Razorpay payment provider is active for the INR region and returns a valid payment session with `razorpay_order_id`
- [ ] Stripe payment provider is active for USD and AED regions and returns a valid `client_secret`
- [ ] `POST /store/carts/:id/shipping-methods` attaches a shipping option and recalculates the cart total
- [ ] `POST /store/orders` (complete cart) transitions the cart to an order with status `pending` and returns a full order object with `id`, `display_id`, and `items`
- [ ] Razorpay webhook endpoint validates HMAC signature — rejects requests with invalid signatures with a 400 response
- [ ] Razorpay webhook endpoint captures payment and triggers the `order.placed` event on successful verification
- [ ] Order confirmation subscriber fires on `order.placed` and logs the email dispatch (email provider can be a stub for this task)
- [ ] All checkout API endpoints return within 200ms p95 under normal conditions

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/backend/medusa-config.ts (Razorpay + Stripe provider registration)
apps/backend/src/api/webhooks/razorpay/route.ts
apps/backend/src/subscribers/order-confirmation.ts
```

---

## API Endpoints
N/A — this task has no API endpoints

---

## UI Screens
- **—**

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-044 (Integration Testing), TASK-046 (Backend Unit Tests)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Checkout/TASK-043 — Storefront · Checkout · Backend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-18 | Implemented Razorpay custom payment provider module, Stripe provider registration, Razorpay webhook handler with HMAC verification, order confirmation subscriber. Fixed tsconfig rootDir and moduleResolution paths. Branch: feature/TASK-043-checkout-backend |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
