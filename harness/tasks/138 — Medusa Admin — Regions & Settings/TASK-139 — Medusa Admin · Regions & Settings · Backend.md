# TASK-139: Medusa Admin · Regions & Settings · Backend

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
| **Start Date** | 2026-04-30 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-30 |

---

## Description
Configure `medusa-config.ts` with all required modules and providers to support Treasure Trove's three-region global setup. This includes the Razorpay payment provider module for India (INR), the Stripe payment provider module for UAE (AED) and SEA (USD), region and tax module configuration, and shipping module setup. Also includes writing the Razorpay and Stripe custom payment provider modules under `apps/backend/src/modules/` if they are not available as official Medusa v2 plugins, and providing a region-seeding script to pre-populate India, UAE, and SEA regions in the database.

---

## Sub Tasks
- [ ] Configure `@medusajs/region` module in `medusa-config.ts`
- [ ] Configure `@medusajs/tax` module in `medusa-config.ts`
- [ ] Configure `@medusajs/fulfillment` module in `medusa-config.ts` for shipping zone support
- [ ] Configure `@medusajs/payment` module in `medusa-config.ts` with Razorpay and Stripe providers
- [ ] Implement or install **Razorpay** payment provider module — `apps/backend/src/modules/razorpay/` — handles INR payment intent creation, webhook verification, and refund
- [ ] Implement or install **Stripe** payment provider module — `apps/backend/src/modules/stripe/` — handles USD/AED payment intent creation, webhook verification, and refund
- [ ] Add Razorpay env vars to `.env`: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- [ ] Add Stripe env vars to `.env`: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- [ ] Write region seed script `apps/backend/src/scripts/seed-regions.ts`: creates India (INR, IN), UAE (AED, AE), SEA (USD, SG/MY/TH/PH/ID/VN) regions with correct tax rates
- [ ] Write shipping zone seed script or document manual Admin setup steps for shipping options
- [ ] Verify all module migrations run cleanly against PostgreSQL 16 — no errors on `medusa migrations run`
- [ ] Add Winston-structured logging for payment provider events (intent created, webhook received, refund issued)

---

## Acceptance Criteria
- [ ] `pnpm dev --filter=backend` starts without errors with Razorpay and Stripe modules registered
- [ ] Seed script creates three regions in PostgreSQL — verified via `GET /admin/regions` returning India, UAE, SEA
- [ ] A test payment intent can be created via the Razorpay provider for an INR cart — Razorpay dashboard shows the order
- [ ] A test payment intent can be created via the Stripe provider for a USD cart — Stripe dashboard shows the payment intent
- [ ] Razorpay webhook endpoint at `/webhooks/razorpay` accepts a signed event and updates the Medusa order status
- [ ] Stripe webhook endpoint at `/webhooks/stripe` accepts a signed event and updates the Medusa order status
- [ ] Tax module correctly applies 18% to INR carts, 5% to AED carts, 0% to USD SEA carts
- [ ] Medusa API key module is registered and `POST /admin/api-keys` creates a publishable key successfully
- [ ] All payment provider environment variables are documented in `apps/backend/.env.example`

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/backend/medusa-config.ts                          (region, tax, payment, fulfillment module config)
apps/backend/src/modules/razorpay/index.ts             (Razorpay payment provider module)
apps/backend/src/modules/razorpay/razorpay-service.ts  (payment intent, capture, refund, webhook)
apps/backend/src/modules/stripe/index.ts               (Stripe payment provider module)
apps/backend/src/modules/stripe/stripe-service.ts      (payment intent, capture, refund, webhook)
apps/backend/src/api/webhooks/razorpay/route.ts        (Razorpay webhook handler)
apps/backend/src/api/webhooks/stripe/route.ts          (Stripe webhook handler)
apps/backend/src/scripts/seed-regions.ts               (seed India, UAE, SEA regions)
apps/backend/.env.example                              (add Razorpay and Stripe env vars)
```

---

## API Endpoints
- `POST /webhooks/razorpay` — Razorpay payment webhook (custom route)
- `POST /webhooks/stripe` — Stripe payment webhook (custom route)
- `GET /admin/regions` — list regions (Medusa Admin API)
- `POST /admin/regions` — create region (Medusa Admin API, used by seed)
- `POST /admin/api-keys` — create publishable API key (Medusa Admin API)

---

## UI Screens
- **—**

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-140, TASK-142

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Medusa Admin — Regions & Settings/TASK-139 — Medusa Admin · Regions & Settings · Backend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| — | No updates yet |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
