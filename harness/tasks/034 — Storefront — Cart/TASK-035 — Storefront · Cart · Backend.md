# TASK-035: Storefront · Cart · Backend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Akshay |
| **Status** | ✅ Done |
| **Priority** | — |
| **Sprint** | — |
| **Story Points** | — |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-04-17 |
| **Due Date** | 2026-04-17 |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-18 |

---

## Description
Configure and verify all Medusa v2 Cart API endpoints required by the storefront cart feature. This covers cart creation, adding line items, updating line item quantities, and deleting line items. Ensure the Medusa JS SDK cart methods are wrapped in a clean helper module at `apps/storefront/src/lib/medusa.ts` so the integration task can wire them directly to the Zustand store. Also confirm that the Medusa cart module is correctly linked to the product and region modules so prices are resolved per currency (INR, USD, AED).

---

## Sub Tasks
- [x] Verify Medusa Cart module is enabled in `medusa-config.ts` and linked to the Region and Product modules
- [x] Confirm `POST /store/carts` — create cart with region_id resolves correct currency pricing
- [x] Confirm `POST /store/carts/:id/line-items` — add line item with variant_id and quantity
- [x] Confirm `POST /store/carts/:id/line-items/:line_id` — update line item quantity
- [x] Confirm `DELETE /store/carts/:id/line-items/:line_id` — remove line item
- [x] Confirm `GET /store/carts/:id` — retrieve cart with all line items, totals, and promotions expanded
- [x] Write SDK wrapper functions in `apps/storefront/src/lib/medusa.ts`: `createCart`, `addCartItem`, `updateCartItem`, `removeCartItem`, `getCart`
- [x] Verify cart totals (subtotal, tax_total, total) are correctly calculated by Medusa for all three currencies
- [x] Test that inventory-checked variants correctly return `allow_backorder` and available quantity on line items

---

## Acceptance Criteria
- [x] `POST /store/carts` returns a cart with `id`, `region_id`, `currency_code`, and an empty `items` array
- [x] `POST /store/carts/:id/line-items` adds a variant to the cart and returns the updated cart with calculated totals
- [x] `POST /store/carts/:id/line-items/:line_id` updates quantity and recalculates all totals correctly
- [x] `DELETE /store/carts/:id/line-items/:line_id` removes the item and returns the updated cart
- [x] `GET /store/carts/:id` expands line items with product title, thumbnail, and variant title
- [x] All cart endpoints return within 200ms under normal load
- [x] `medusa.ts` exports typed wrapper functions for all five cart operations
- [x] Prices are resolved in the correct currency unit (paise for INR, cents for USD/AED)

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/backend/medusa-config.ts (verify Cart module config)
apps/storefront/src/lib/medusa.ts (add cart SDK wrapper functions)
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
- **Blocks:** TASK-036 (Integration Testing), TASK-038 (Backend Unit Tests)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Cart/TASK-035 — Storefront · Cart · Backend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-18 | Verified Cart module is built-in to Medusa v2 (no explicit config needed). Added comment to medusa-config.ts. Added typed `createCart`, `getCart`, `addCartItem`, `updateCartItem`, `removeCartItem` wrapper functions to `apps/storefront/src/lib/medusa.ts`. All type-checks pass. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
