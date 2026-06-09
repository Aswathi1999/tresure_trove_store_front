# TASK-107: Medusa Admin · Orders · Backend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Completed |
| **Priority** | — |
| **Sprint** | — |
| **Story Points** | — |
| **Story Points** | — |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-04-29 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | — |

---

## Description
Configure Medusa v2 modules, workflows, subscribers, and API routes to support the full order lifecycle for Treasure Trove. This includes creating Medusa Workflows for fulfillment progression (packed → shipped → delivered), returns, exchanges, and refunds, and adding an order-placed subscriber to trigger transactional email notifications via the configured email provider.

---

## Sub Tasks
- [ ] Verify the Order Module is enabled and configured in `medusa-config.ts`
- [ ] Confirm fulfillment provider is configured in `medusa-config.ts` (manual fulfillment or courier integration)
- [ ] Build `create-fulfillment-workflow.ts` — creates a fulfillment, transitions order status, and emits a fulfillment-created event
- [ ] Build `mark-shipped-workflow.ts` — updates fulfillment with tracking info and transitions order to shipped status
- [ ] Build `mark-delivered-workflow.ts` — transitions order to delivered status and triggers post-delivery actions
- [ ] Build `return-workflow.ts` — validates return items, creates a return record, and initiates restocking
- [ ] Build `exchange-workflow.ts` — processes exchanges by linking a return to a new draft order
- [ ] Build `refund-workflow.ts` — validates refund amount against captured payment and initiates refund via the payment provider
- [ ] Build `order-placed.ts` subscriber — listens to `order.placed` event and triggers a transactional email (template: order confirmation with line items, total, delivery address)
- [ ] Confirm draft order creation via the Admin API is functional end-to-end

---

## Acceptance Criteria
- [ ] Fulfillment workflows correctly transition order status at each step (pending → processing → shipped → delivered)
- [ ] `create-fulfillment-workflow` creates a fulfillment record linked to the order with correct line item quantities
- [ ] `mark-shipped-workflow` stores tracking number and carrier on the fulfillment record
- [ ] `return-workflow` creates a return with correct status and restores inventory quantity for returned variants
- [ ] `exchange-workflow` links the return to a new draft order and adjusts totals correctly
- [ ] `refund-workflow` does not allow refunding more than the captured payment amount and logs the refund reason
- [ ] `order-placed` subscriber fires on `order.placed` event and sends a confirmation email with correct order details
- [ ] All workflows use Medusa's `createStep` / `createWorkflow` primitives — no direct DB access
- [ ] All subscribers registered in `medusa-config.ts` or via the subscriber directory convention
- [ ] Custom API routes follow the standard error format from `claude.md` and require admin authentication

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/backend/medusa-config.ts
apps/backend/src/workflows/create-fulfillment-workflow.ts
apps/backend/src/workflows/mark-shipped-workflow.ts
apps/backend/src/workflows/mark-delivered-workflow.ts
apps/backend/src/workflows/return-workflow.ts
apps/backend/src/workflows/exchange-workflow.ts
apps/backend/src/workflows/refund-workflow.ts
apps/backend/src/subscribers/order-placed.ts
```

---

## API Endpoints
- Medusa built-in Admin API for orders, fulfillments, returns, refunds (no custom routes needed unless extending)

---

## UI Screens
- **—**

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-108, TASK-110

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Medusa Admin — Orders/TASK-107 — Medusa Admin · Orders · Backend.md
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
