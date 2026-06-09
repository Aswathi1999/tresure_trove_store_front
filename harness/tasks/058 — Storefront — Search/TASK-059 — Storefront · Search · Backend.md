# TASK-059: Storefront · Search · Backend

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
| **Completed** | 2026-04-24 |

---

## Description
Configure the Medusa v2 Search module to power the global product search feature. This involves setting up MeiliSearch (or Medusa's built-in search) as the search provider in `medusa-config.ts`, ensuring products are indexed on create/update/delete, and verifying that the Medusa Search API returns relevant results and autocomplete suggestions for given query strings.

---

## Sub Tasks
- [x] Choose and install the search provider — MeiliSearch adapter or Medusa built-in search module
- [x] Configure the search module in `apps/backend/medusa-config.ts` with provider credentials and index settings
- [x] Define the product index schema — index fields: id, title, handle, thumbnail, description, collection, price range
- [x] Verify products are automatically indexed when created or updated via Medusa Admin
- [x] Verify products are removed from the index when deleted
- [x] Confirm `GET /store/products?q=<query>` returns relevant product results filtered by search query
- [x] Confirm autocomplete suggestions endpoint returns results within acceptable latency
- [x] Configure result ranking rules — prioritise title match over description match
- [x] Add CORS configuration to allow search API calls from the storefront origin
- [x] Document the search provider setup and any required environment variables

---

## Acceptance Criteria
- [x] Search module is configured in `medusa-config.ts` with the chosen provider
- [x] All existing products are indexed in the search provider after running the index sync command
- [x] New products created via Medusa Admin appear in search results within 5 seconds
- [x] Deleted products are removed from search results within 5 seconds
- [x] `GET /store/products?q=<query>` returns relevant products ranked by title relevance
- [x] Autocomplete suggestions return within 100ms for a single-word query
- [x] Search results include: product id, title, handle, thumbnail URL, and lowest variant price
- [x] Empty query returns no results (not all products)
- [x] CORS is correctly configured for storefront origin

---

## Technical Notes
- MeiliSearch chosen as the search provider (`meilisearch@0.57.0`)
- Module conditionally loaded — only active when `MEILISEARCH_HOST` env var is set
- `POST /admin/meilisearch/sync` triggers a full paginated re-index (batch size 50)
- `product.created` / `product.updated` events trigger `syncProductsToMeilisearchWorkflow`
- `product.deleted` events trigger `deleteProductsFromMeilisearchWorkflow`
- Only published products are indexed; draft/unpublished are removed from the index on sync
- INR prices used for `min_price` / `max_price` fields
- Title ranked above description via `searchableAttributes` order in `setupIndex`

---

## Files to Create/Modify
```
apps/backend/medusa-config.ts (search module config, provider, index settings)
apps/backend/.env.example (MEILISEARCH_HOST, MEILISEARCH_API_KEY, MEILISEARCH_PRODUCT_INDEX_NAME)
apps/backend/src/modules/meilisearch/service.ts
apps/backend/src/modules/meilisearch/index.ts
apps/backend/src/subscribers/product-upsert.ts
apps/backend/src/subscribers/product-delete.ts
apps/backend/src/workflows/sync-products-to-meilisearch.ts
apps/backend/src/workflows/delete-products-from-meilisearch.ts
apps/backend/src/workflows/steps/sync-products-to-meilisearch.ts
apps/backend/src/workflows/steps/delete-products-from-meilisearch.ts
apps/backend/src/api/admin/meilisearch/sync/route.ts
```

---

## API Endpoints
- `GET /store/products?q=<query>` — full-text product search
- `GET /store/products?q=<query>&limit=5` — autocomplete suggestions (top 5 matches)
- `POST /admin/meilisearch/sync` — trigger full product re-index (admin only)

---

## UI Screens
- **—**

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-060, TASK-062

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Search/TASK-059 — Storefront · Search · Backend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-24 | Completed — MeiliSearch module, subscribers, workflows, sync route, and .env.example all in place |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
