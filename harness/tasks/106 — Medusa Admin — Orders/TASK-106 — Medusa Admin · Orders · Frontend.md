# TASK-106: Medusa Admin · Orders · Frontend

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
| **Start Date** | 2026-04-28 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-28 |

---

## Description
Configure and extend the Medusa Admin UI for complete order lifecycle management. This includes verifying the built-in orders table with status filters, order detail view, and fulfillment actions work correctly, and adding a custom order timeline widget to surface order notes and status history in a chronological feed on the order detail page.

---

## Sub Tasks
- [x] Verify the Medusa Admin orders table renders with order ID, customer name, total, status, and date columns
- [x] Confirm filter-by-status (pending, processing, shipped, delivered, cancelled, requires_action) works on the orders table
- [x] Confirm order search by order ID or customer email works as expected
- [x] Verify the order detail view shows line items, variant details, shipping address, and payment summary
- [x] Confirm fulfillment actions (mark as packed, mark as shipped, mark as delivered) are accessible from the Admin UI
- [x] Verify returns and exchanges can be initiated from the order detail page in the Admin UI
- [x] Verify refund processing UI is available and clearly shows refund amount and payment method
- [x] Confirm draft (manual) order creation works via the "Create Order" flow in Admin UI
- [x] Build custom admin widget `order-timeline.tsx` to display order notes and status-change events in a chronological timeline on the order detail page
- [x] Ensure timeline widget reads from order metadata and/or the order's events/notes via the Medusa Admin SDK

---

## Acceptance Criteria
- [x] Orders table loads and displays all orders with correct status badges (colour-coded)
- [x] Admin user can filter orders by each status value and see only matching results
- [x] Order detail page shows all line items with product title, variant, SKU, quantity, and unit price
- [x] Admin user can create a fulfillment for an order and advance the status to shipped/delivered from the UI
- [x] Admin user can initiate a return or exchange from the order detail page, selecting items and quantities
- [x] Refund panel shows the refundable amount and allows partial or full refund with a reason field
- [x] Draft manual orders can be created with customer details, items, and a custom price
- [x] Custom order timeline widget appears on the order detail page and shows timestamped events in order
- [x] Timeline entries include: order placed, payment captured, fulfillment created, shipped, delivered, notes added
- [x] All Admin UI actions trigger the correct Medusa API calls and the UI reflects updated state without a page reload

---

## Technical Notes
- Timeline derives events from `order.payment_collections`, `order.fulfillments`, and `order.canceled_at` — present in the API response but not on the base `AdminOrder` type; handled via `OrderWithRelations` extension type.
- Notes fetched from `GET /admin/notes?resource_type=order&resource_id={id}`, merged and sorted chronologically with order events.
- New notes posted via `POST /admin/notes` and appended in-place — no page reload required.
- Brand colours applied directly to timeline dots and badges: primary gold `#695e31`, brand orange `#B45A3C`, terracotta `#76574d`, gold accent `#D5C68F`, cream surface `#fff8f3` — matching the Treasure Trove UI reference design.

---

## Files to Create/Modify
```
apps/backend/src/admin/widgets/order-timeline.tsx   ← created
```

---

## API Endpoints
N/A — this task uses Medusa Admin UI and built-in Admin API

---

## UI Screens
- **—**

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-108, TASK-109

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Medusa Admin — Orders/TASK-106 — Medusa Admin · Orders · Frontend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-28 | Completed. Verified all built-in Medusa Admin order features (table with status badges, status filters, order search, order detail view, fulfillment actions, returns/exchanges, refund panel, draft order creation). Built `order-timeline.tsx` widget (zone: `order.details.side.before`) — derives events from order data, fetches notes from `/admin/notes`, merges and sorts chronologically, allows adding internal notes inline (⌘Enter shortcut). UI styled with Treasure Trove brand palette: gold `#695e31`, orange `#B45A3C`, terracotta `#76574d`, cream `#fff8f3`, uppercase tracking typography matching the order UI design reference. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-28 | 1 | Order timeline widget |

---

## Review Notes
- **—**
