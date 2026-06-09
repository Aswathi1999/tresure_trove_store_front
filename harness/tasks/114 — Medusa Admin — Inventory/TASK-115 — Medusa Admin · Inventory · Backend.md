# TASK-115: Medusa Admin · Inventory · Backend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Done |
| **Priority** | — |
| **Sprint** | — |
| **Story Points** | — |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | — |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-29 |

---

## Description
Configure the Medusa v2 Inventory Module and Stock Location Module in `medusa-config.ts`, set up stock locations for Treasure Trove warehouse(s), link inventory levels to product variants, and implement a subscriber that fires when stock drops to or below a configurable low stock threshold. This backend work enables the Admin UI (TASK-114) to display real inventory data and powers low stock alerting.

---

## Sub Tasks
- [ ] Register `@medusajs/inventory-next` module in `medusa-config.ts`
- [ ] Register `@medusajs/stock-location-next` module in `medusa-config.ts`
- [ ] Create at least one stock location (e.g. "Treasure Trove Warehouse — Mumbai") via seed script or Medusa Admin
- [ ] Link product variant inventory items to the stock location so inventory levels are tracked per location
- [ ] Define low stock threshold constant (e.g. `LOW_STOCK_THRESHOLD = 5`) in a shared config or env variable
- [ ] Create `apps/backend/src/subscribers/low-stock-alert.ts` — subscribe to `inventory-level.updated` or equivalent Medusa event
- [ ] Subscriber logic: if `stocked_quantity` at a location drops to or below threshold, log a structured warning via Winston and optionally emit an internal notification event
- [ ] Ensure subscriber does not throw on edge cases (variant with no location, threshold not set)
- [ ] Write a Medusa seed/fixture to populate test inventory levels for local development
- [ ] Verify `medusa-config.ts` passes TypeScript strict mode without errors

---

## Acceptance Criteria
- [ ] `medusa-config.ts` includes both `inventoryModule` and `stockLocationModule` correctly typed and registered
- [ ] At least one stock location exists and is visible in Medusa Admin after seeding
- [ ] Inventory levels for all seeded product variants are linked to the stock location and visible in Admin
- [ ] `low-stock-alert.ts` subscriber is registered and triggers when stock is updated
- [ ] A Winston warning log is emitted with `{ sku, locationId, currentStock, threshold }` when stock drops at or below threshold
- [ ] Subscriber handles missing location or null quantity gracefully without crashing the Medusa server
- [ ] `pnpm type-check --filter=backend` passes with no errors
- [ ] `pnpm dev --filter=backend` starts without errors with the new module configuration

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/backend/medusa-config.ts (modify — register inventory and stock location modules)
apps/backend/src/subscribers/low-stock-alert.ts (create — low stock threshold subscriber)
apps/backend/src/scripts/seed-inventory.ts (create — seed stock locations and inventory levels)
```

---

## API Endpoints
N/A — this task configures modules and subscribers; no new custom API routes

---

## UI Screens
- **—**

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-116, TASK-118

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Medusa Admin — Inventory/TASK-115 — Medusa Admin · Inventory · Backend.md
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
