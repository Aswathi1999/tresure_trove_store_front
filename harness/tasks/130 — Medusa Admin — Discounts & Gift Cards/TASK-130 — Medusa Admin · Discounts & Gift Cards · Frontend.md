# TASK-130: Medusa Admin · Discounts & Gift Cards · Frontend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Lijina-p |
| **Status** | ✅ Done |
| **Priority** | — |
| **Sprint** | Sprint 1 |
| **Story Points** | — |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-04-28 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-28 |

---

## Description
Configure the Medusa Admin promotions UI for Treasure Trove's discount and gift card workflows. This covers enabling and verifying the built-in promotions module UI, adding any India-specific promotion rule support (e.g. INR-only fixed-amount codes), and building a custom discount usage reporting widget in the Medusa Admin extension layer. The goal is for store operators to be able to create, manage, and monitor discount codes and gift cards entirely within the Admin dashboard without any custom back-office tooling.

---

## Sub Tasks
- [x] Verify Medusa Admin promotions module UI is accessible and fully functional at `/app/promotions`
- [x] Confirm discount code creation flow supports: percentage discounts, fixed-amount discounts (INR, USD, AED), free shipping discounts
- [x] Verify usage limit configuration per code (total uses, uses per customer)
- [x] Verify expiry date configuration per code
- [x] Verify regional applicability rules — restrict a code to India (INR), UAE (AED), or SEA (USD) region
- [x] Verify product-specific and customer-group-specific discount rule configuration
- [x] Confirm gift card creation flow: denomination setup for INR, USD, AED; balance tracking; code generation
- [x] Build custom admin discount usage report widget under `apps/backend/src/admin/widgets/discount-usage-report.tsx`
- [x] Widget displays: top 10 codes by redemption count, total discount value distributed, gift card liability outstanding
- [x] Widget renders on the promotions index page via Medusa Admin widget injection
- [x] Verify all Admin UI flows are accessible on standard admin credentials

---

## Acceptance Criteria
- [x] Admin operator can create a percentage discount code with usage limit, expiry date, and region restriction in under 2 minutes
- [x] Admin operator can create a fixed-amount discount code denominated in INR, USD, or AED and it applies only to the correct region's cart
- [x] Admin operator can create a free-shipping discount restricted to a specific shipping zone
- [x] Admin operator can generate gift cards in INR, USD, and AED denominations and see outstanding gift card liability
- [x] Discount codes can be restricted to specific product collections or customer groups via the Admin UI
- [x] The discount usage report widget is visible on the promotions page and displays accurate redemption data
- [x] Expired or fully-redeemed discount codes are shown with a clear "inactive" status in the list view
- [x] All Admin UI actions complete without console errors or broken UI states

---

## Technical Notes
- Promotions module is built into Medusa v2 by default — no `medusa-config.ts` changes required.
- Widget zone: `promotion.list.before` — renders at the top of `/app/promotions`.
- Data fetched from `GET /admin/promotions?limit=100` and `GET /admin/gift-cards?limit=100` on mount.
- Top 10 codes sorted by `usage_count` descending. Total discount calculated only for `fixed` type methods.
- Gift card liability = sum of `balance` across all active (non-disabled) gift cards.
- Currency displayed in INR (paise → rupees). All amounts formatted with `Intl.NumberFormat en-IN`.
- Brand colours: gold `#695e31` for stat cards, orange `#B45A3C` for discount value, green for gift card liability, cream `#FAF6EE` surfaces.

---

## Files to Create/Modify
```
apps/backend/src/admin/widgets/discount-usage-report.tsx   ← created
```

---

## API Endpoints
N/A — this task uses Medusa Admin UI, no custom API endpoints

---

## UI Screens
- **Medusa Admin → Promotions → Discount Code List**
- **Medusa Admin → Promotions → Create Discount Code**
- **Medusa Admin → Promotions → Gift Cards**
- **Medusa Admin → Promotions → (Custom) Discount Usage Report Widget**

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-132, TASK-133

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Medusa Admin — Discounts & Gift Cards/TASK-130 — Medusa Admin · Discounts & Gift Cards · Frontend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-28 | Completed. Verified built-in promotions UI at `/app/promotions` (percentage/fixed/free-shipping codes, usage limits, expiry, regional rules, product/group-specific rules, gift cards). Built `discount-usage-report.tsx` widget (zone: `promotion.list.before`) — 3 stat cards (total redemptions, discount distributed in INR, gift card liability), top-10 codes table with code, type, value, redemption count, and status badge. Data fetched live from Admin API. Brand colours: gold `#695e31`, orange `#B45A3C`, cream `#FAF6EE`. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-28 | 1 | Discount usage report widget |

---

## Review Notes
- **—**
