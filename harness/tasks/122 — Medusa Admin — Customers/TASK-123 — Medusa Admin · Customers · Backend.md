# TASK-123: Medusa Admin · Customers · Backend

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
Configure the Medusa v2 Customer Module in `medusa-config.ts`, create "retail" and "trade" customer groups, associate the trade group with the appropriate price list for interior designer and architect pricing, and implement a custom API route to deactivate a customer account (if not provided by Medusa built-in). This backend work powers both the Admin UI customer management screens and the trade pricing system across the storefront.

---

## Sub Tasks
- [ ] Verify `@medusajs/customer` module is registered in `medusa-config.ts`
- [ ] Create "retail" customer group via seed script or Medusa Admin
- [ ] Create "trade" customer group via seed script or Medusa Admin
- [ ] Associate the "trade" customer group with the trade price list (discounted pricing for interior designers and architects)
- [ ] Verify that adding a customer to the "trade" group applies the correct price list on the storefront
- [ ] Investigate whether Medusa v2 provides a built-in customer deactivation / account disable API
- [ ] If not built-in: create custom API route `POST /admin/customers/:id/deactivate` in `apps/backend/src/api/admin/customers/[id]/deactivate/route.ts`
- [ ] Deactivation route must: authenticate admin JWT, set a `metadata.deactivated: true` flag on the customer record, and return `200` with updated customer
- [ ] Deactivation route must be idempotent (re-deactivating an already-deactivated account is not an error)
- [ ] Ensure `pnpm type-check --filter=backend` passes after all changes

---

## Acceptance Criteria
- [ ] `medusa-config.ts` includes the customer module correctly registered
- [ ] "retail" and "trade" customer groups exist and are visible in Medusa Admin under Customer Groups
- [ ] Assigning a customer to the "trade" group causes the trade price list to apply on storefront product pricing
- [ ] `POST /admin/customers/:id/deactivate` returns `200` with `{ customer: { id, metadata: { deactivated: true } } }` for valid admin requests
- [ ] `POST /admin/customers/:id/deactivate` returns `401` for unauthenticated requests
- [ ] `POST /admin/customers/:id/deactivate` returns `404` for a non-existent customer ID
- [ ] Re-deactivating a customer that is already deactivated returns `200` without error
- [ ] `pnpm type-check --filter=backend` passes with no errors
- [ ] `pnpm dev --filter=backend` starts without errors with the new routes and module configuration

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/backend/medusa-config.ts (verify customer module registration)
apps/backend/src/api/admin/customers/[id]/deactivate/route.ts (create — custom deactivate endpoint if not built-in)
apps/backend/src/scripts/seed-customer-groups.ts (create — seed retail and trade groups with price list association)
```

---

## API Endpoints
- `POST /admin/customers/:id/deactivate` — Deactivate a customer account (admin auth required)

---

## UI Screens
- **—**

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-124, TASK-126

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Medusa Admin — Customers/TASK-123 — Medusa Admin · Customers · Backend.md
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
