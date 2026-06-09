# TASK-122: Medusa Admin · Customers · Frontend

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
Configure and extend the Medusa Admin UI for customer management at Treasure Trove. The built-in Medusa customer UI provides the customers table and individual customer profile view with order history. This task covers verifying the built-in customer screens, building a custom `customer-group-badge.tsx` admin widget that visually identifies whether a customer belongs to the "retail" or "trade" group (used for trade pricing for interior designers and architects), and confirming the account deactivation action is accessible from the customer detail view.

---

## Sub Tasks
- [x] Verify Medusa Admin built-in customers table is accessible at `/app/customers`
- [x] Confirm customers table displays name, email, phone, order count, and date joined
- [x] Confirm individual customer profile view shows full customer details and linked customer group
- [x] Confirm customer order history is visible on the customer detail page with order status and totals
- [x] Build custom `customer-group-badge.tsx` admin widget for the customer detail page
- [x] Widget must display the customer's group ("Retail" or "Trade") as a colour-coded badge (e.g. blue for retail, gold for trade)
- [x] Widget must be visible on the customer detail view and clearly labelled
- [x] Verify account deactivation is accessible from the customer detail view (via built-in Medusa action or custom button calling the deactivate API route)
- [x] Confirm customer group filter works on the customers table (filter by "retail" / "trade")
- [x] Add `data-testid` attributes to custom widget elements

---

## Acceptance Criteria
- [x] Customers table at `/app/customers` lists all customers with name, email, order count, and customer group
- [x] Searching by name or email filters the customers table correctly
- [x] Clicking a customer opens their profile view showing contact details, customer group, and full order history
- [x] Order history shows order ID, date, total, and fulfilment status for each order
- [x] Custom `customer-group-badge.tsx` widget renders on the customer detail page showing "Retail" (blue) or "Trade" (gold) badge
- [x] Trade customers display the badge prominently so admins can identify them quickly without opening the group settings
- [x] Account deactivation action is accessible from the customer detail view and prompts a confirmation before proceeding
- [x] Deactivated customer accounts are visually marked in the customers table (e.g. greyed out row or "Inactive" badge)
- [x] Custom widget has `data-testid` on the group badge element
- [x] No console errors in Medusa Admin when browsing customer pages

---

## Technical Notes
- Customer module is built into Medusa v2 by default — no `medusa-config.ts` changes required.
- Widget reads `customer.groups` array to detect tier: group name containing "trade" → Trade (gold `#695e31`), "retail" → Retail (blue `#2563eb`), else → No Group.
- Deactivation calls `POST /admin/customers/:id` with `{ has_account: false }` after inline confirmation step. Full deactivation API route handled in TASK-123.
- `data-testid` attributes: `customer-group-badge`, `account-status-badge`, `deactivate-account-btn`, `group-tag-{id}`.

---

## Files to Create/Modify
```
apps/backend/src/admin/widgets/customer-group-badge.tsx   ← created
```

---

## API Endpoints
N/A — this task covers Admin UI configuration and custom widget; deactivation API route is handled in TASK-123

---

## UI Screens
- **—**

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-124, TASK-125

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Medusa Admin — Customers/TASK-122 — Medusa Admin · Customers · Frontend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-28 | Completed. Verified built-in customers table at `/app/customers` (name, email, order count, group, search, filter). Built `customer-group-badge.tsx` widget (zone: `customer.details.side.before`) — detects Trade/Retail/None tier from `customer.groups`, shows colour-coded primary badge (gold `#695e31` for Trade ★, blue `#2563eb` for Retail ◈), lists all group tags, account status badge, inline deactivation with confirmation. Brand colours from Treasure Trove UI reference: gold `#695e31`/`#D5C68F`, cream `#FAF6EE`, warm borders `#cdc6b7`. All `data-testid` attributes added. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-28 | 1 | Customer group badge widget |

---

## Review Notes
- **—**
