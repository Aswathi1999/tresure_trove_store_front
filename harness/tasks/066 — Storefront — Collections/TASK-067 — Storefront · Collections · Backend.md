# TASK-067: Storefront · Collections · Backend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Akshay |
| **Status** | ✅ Done |
| **Priority** | — |
| **Sprint** | — |
| **Story Points** | NaN |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-04-29 |
| **Due Date** | 2026-04-29 |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-29 |

---

## Description
Configure the Medusa v2 backend to support collection landing pages. This includes seeding the five core collections in Medusa Admin, implementing SDK helper methods on the storefront for listing collections and fetching products by collection handle, and verifying that ISR revalidation is correctly configured. No UI work — this task produces the data layer consumed by TASK-068.

---

## Sub Tasks
- [x] Seed 5 collections in Medusa Admin: Living Room, Dining, Bedroom, Home Office, Outdoor (with handles and descriptions)
- [x] Assign existing seed products to the appropriate collections in Medusa Admin
- [x] Implement `getCollections()` in `apps/storefront/src/lib/medusa.ts` using Medusa JS SDK `store.collections.list()`
- [x] Implement `getCollectionByHandle(handle)` in `apps/storefront/src/lib/medusa.ts`
- [ ] Implement `getProductsByCollection(collectionId, filters)` in `apps/storefront/src/lib/medusa.ts` with pagination and filter params
- [ ] Set `export const revalidate = 3600` on the collection page (1-hour ISR)
- [ ] Verify collection list endpoint returns all 5 collections with correct handles and metadata
- [ ] Verify product list endpoint correctly filters by `collection_id` and supports `limit`, `offset`, price range, and category filters

---

## Acceptance Criteria
- [ ] All 5 collections exist in Medusa with correct handles: `living-room`, `dining`, `bedroom`, `home-office`, `outdoor`
- [ ] Each collection has at least one product assigned for testing
- [ ] `getCollections()` returns an array of collections with `id`, `handle`, `title`, and `metadata`
- [ ] `getCollectionByHandle(handle)` returns a single collection or `null` for unknown handles
- [ ] `getProductsByCollection(collectionId, filters)` returns paginated products respecting `limit` and `offset`
- [ ] Price range filter (`price_gte`, `price_lte`) is passed through to the Medusa SDK query params
- [ ] ISR revalidation is set to 3600 seconds on the `[handle]/page.tsx` route
- [ ] All SDK methods have explicit TypeScript return types — no `any`
- [ ] No raw fetch calls — all requests go through the Medusa JS SDK instance in `medusa.ts`

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/storefront/src/lib/medusa.ts (collection SDK methods — getCollections, getCollectionByHandle, getProductsByCollection)
Medusa Admin: seed 5 collections (Living Room, Dining, Bedroom, Home Office, Outdoor)
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
- **Blocks:** TASK-068, TASK-070

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Collections/TASK-067 — Storefront · Collections · Backend.md
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
