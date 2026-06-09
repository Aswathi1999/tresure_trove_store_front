# TASK-131: Medusa Admin · Discounts & Gift Cards · Backend

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
| **Start Date** | 2026-04-29 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-29 |

---

## Description
Configure the Medusa v2 Promotions module and Gift Card module in `medusa-config.ts` so that promo codes and gift cards work correctly across all three Treasure Trove regions (India/INR, UAE/AED, SEA/USD). This includes enabling the promotions module, defining promotion rule types (region-specific, product-specific, customer-group-specific), configuring gift card denomination logic for multi-currency, and ensuring the discount validation pipeline correctly rejects codes applied to wrong-region carts.

---

## Sub Tasks
- [ ] Enable and configure `@medusajs/promotion` module in `medusa-config.ts`
- [ ] Enable and configure `@medusajs/gift-card` module in `medusa-config.ts` (if separate from promotions module in v2)
- [ ] Define promotion rule types: `region_id` rule to restrict codes to India, UAE, or SEA regions
- [ ] Define promotion rule types: `product_collection_id` rule for collection-specific discounts
- [ ] Define promotion rule types: `customer_group_id` rule for VIP/wholesale customer-group discounts
- [ ] Configure fixed-amount discount support for INR, USD, AED (currency-aware application)
- [ ] Configure gift card denominations for INR (₹500, ₹1000, ₹2000, ₹5000), USD ($25, $50, $100), AED (AED 100, AED 250, AED 500)
- [ ] Verify promotion module database migrations run cleanly against PostgreSQL 16
- [ ] Add seed script or admin data fixture for at least one test discount code per region
- [ ] Confirm usage limit enforcement is handled at the Medusa module level (no custom middleware needed)
- [ ] Confirm expiry date enforcement is handled at the Medusa module level
- [ ] Write Winston-structured logs for promotion application and rejection events

---

## Acceptance Criteria
- [ ] `pnpm dev --filter=backend` starts cleanly with promotions module enabled — no migration or config errors
- [ ] A discount code created via Admin API with `region_id = india_region_id` is rejected by the cart API when applied to a UAE-region cart
- [ ] A fixed-amount INR discount code deducts the correct paise amount from an INR cart total
- [ ] A gift card created with AED denomination is accepted on an AED-region cart and correctly reduces the payable amount
- [ ] Usage limit of 1 per customer is enforced — second redemption attempt by same customer returns a 400 error
- [ ] Expired codes return a 400 with a clear error message — not a 500
- [ ] All promotion module tables are present in PostgreSQL after migrations: `promotion`, `promotion_rule`, `application_method`, `campaign`
- [ ] Gift card denominations for all three currencies are configurable without code changes

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/backend/medusa-config.ts          (promotions module config, gift card module config)
apps/backend/src/scripts/seed-promos.ts (optional — seed test discount codes per region)
```

---

## API Endpoints
- `POST /store/carts/:id/promotions` — apply discount code to cart (Medusa built-in)
- `DELETE /store/carts/:id/promotions/:code` — remove discount code from cart (Medusa built-in)
- `GET /admin/promotions` — list all promotions (Medusa Admin API)
- `POST /admin/promotions` — create promotion (Medusa Admin API)
- `GET /admin/gift-cards` — list gift cards (Medusa Admin API)
- `POST /admin/gift-cards` — create gift card (Medusa Admin API)

---

## UI Screens
- **—**

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-132, TASK-134

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Medusa Admin — Discounts & Gift Cards/TASK-131 — Medusa Admin · Discounts & Gift Cards · Backend.md
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
