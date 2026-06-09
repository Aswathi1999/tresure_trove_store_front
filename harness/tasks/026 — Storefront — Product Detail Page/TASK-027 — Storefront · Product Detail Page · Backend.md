# TASK-027: Storefront · Product Detail Page · Backend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Akshay |
| **Status** | ✅ Done |
| **Priority** | P0 |
| **Sprint** | Sprint 1 |
| **Story Points** | NaN |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-04-16 |
| **Due Date** | 2026-04-16 |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-16 |

---

## Description
Verify and configure the Medusa v2 product retrieval by handle endpoint and the Payload CMS material story REST endpoint required by the Product Detail Page. The Medusa route must return full product data including all variants with prices, images, and inventory quantities. The Payload endpoint must return material story content filtered by wood type slug. Confirm the Medusa JS SDK client (`apps/storefront/src/lib/medusa.ts`) and Payload REST client (`apps/storefront/src/lib/payload.ts`) are correctly initialised and ready for the integration task.

---

## Sub Tasks
- [x] Verify `GET /store/products?handle=<handle>` returns full product with variants, images, inventory
- [x] Confirm variant prices are returned in INR (paise) with correct region/currency context
- [x] Confirm inventory quantity is included in variant response (`inventory_quantity`)
- [x] Verify Payload `GET /api/material-stories?where[material][equals]=<slug>` returns correct fields
- [x] Initialise or verify `apps/storefront/src/lib/medusa.ts` (Medusa JS SDK v2 client instance)
- [x] Initialise or verify `apps/storefront/src/lib/payload.ts` (Payload REST fetch helper with `next.revalidate`)
- [x] Confirm ISR revalidation webhook from Payload triggers storefront revalidation on material story publish

---

## Acceptance Criteria
- [x] `GET /store/products?handle=okura-lounge-chair` returns a single product with all variants, images array, and `inventory_quantity` per variant
- [x] Variant prices include `calculated_price` in INR paise for the correct region
- [x] `GET /api/material-stories?where[material][equals]=teak` returns a docs array with title, excerpt, slug, and material fields
- [x] `apps/storefront/src/lib/medusa.ts` exports a configured Medusa JS SDK client with the publishable key and backend URL from env vars
- [x] `apps/storefront/src/lib/payload.ts` exports a fetch helper that sets `next: { revalidate: 60 }` on all requests
- [x] ISR revalidation is triggered when a material story is published or updated in Payload

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/storefront/src/lib/medusa.ts (SDK client — product by handle)
apps/storefront/src/lib/payload.ts (REST client — material story fetch)
apps/backend/medusa-config.ts (verify region/currency config for INR)
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
- **Blocks:** TASK-028 (Integration Testing), TASK-030 (Backend Unit Tests)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Product Detail Page/TASK-027 — Storefront · Product Detail Page · Backend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-16 | Verified medusa.ts and payload.ts clients. Fixed payload.ts default revalidate to 60s. Added getMaterialStory helper. Confirmed ISR revalidation hook in material-stories collection. All sub-tasks complete. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
