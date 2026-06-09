# TASK-019: Storefront · Products Listing · Backend

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
| **Start Date** | 2026-04-16 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-16 |

---

## Description
Verify and configure the Medusa v2 store products list endpoint to support the filtering, sorting, and pagination requirements of the Products Listing page. Medusa's built-in `/store/products` route must be confirmed to accept filter params for collection, material (product tag or custom attribute), and price range, as well as standard sort and pagination query params. Confirm CORS settings allow storefront origin. Document any custom middleware or additional API route needed to expose material filtering if not natively supported by Medusa.

---

## Sub Tasks
- [x] Verify `/store/products` route is active and accessible from storefront origin
- [x] Confirm pagination params (`limit`, `offset`) work as expected
- [x] Confirm sort params (`order`) work for created_at desc — price sort is client-side (see Technical Notes)
- [x] Confirm collection filter (`collection_id[]`) works natively
- [x] Verify material/tag filter — confirmed as `tag_id[]` (native Medusa v2 param)
- [x] Verify price range filter — not natively supported; client-side in ISR architecture (see Technical Notes)
- [x] Confirm publishable API key is required and correctly scoped — enforced by Medusa framework automatically
- [x] Document final query param contract for integration task (see Technical Notes)

---

## Acceptance Criteria
- [x] `GET /store/products?limit=16&offset=0` returns paginated product list with `count`, `offset`, `limit`
- [x] `GET /store/products?order=-created_at` returns products newest first (price sort: client-side — see Technical Notes)
- [x] `GET /store/products?collection_id[]=<id>` filters products by collection
- [x] `GET /store/products?tag_id[]=<id>` filters products by material tag
- [x] Price range filtering: handled client-side using variant prices in ISR page data
- [x] All responses include variant prices when `region_id` is provided (INR paise for IN region)
- [x] CORS allows `http://localhost:3000` (dev) — production domains configurable via `STORE_CORS` env (comma-separated)
- [x] Publishable API key (`x-publishable-api-key`) validated automatically by Medusa framework on all `/store/*` routes

---

## Technical Notes

### Query Param Contract — `GET /store/products`

All requests must include header: `x-publishable-api-key: <key>` (created in Medusa Admin → Settings → API Key Management, scoped to Default Sales Channel).

| Param | Type | Notes |
|-------|------|-------|
| `limit` | number | Products per page. Use `16` for listing grid. Default: 50 |
| `offset` | number | Pagination offset. Default: 0 |
| `order` | string | Field name, prefix `-` for desc. Supported: `created_at`, `-created_at`, `title`, `-title` |
| `collection_id[]` | string[] | Filter by Medusa collection ID(s) |
| `tag_id[]` | string[] | Filter by material tag ID(s) — fetch tag IDs from `/store/product-tags` |
| `q` | string | Full-text search (title + description) |
| `region_id` | string | Required to receive calculated variant prices in response |
| `currency_code` | string | ISO 4217 code (e.g. `INR`) — pair with `region_id` |
| `fields` | string | Comma-separated field selection to reduce payload size |

### Price Sorting (`price_asc` / `price_desc`)
Medusa's `order` param maps to database columns; calculated prices are per-variant and per-region and are not a sortable database field. **Price sort is applied client-side** after the storefront receives variant prices from the ISR page data. The integration task (TASK-020) should sort `product.variants[].calculated_price.calculated_amount` on the client.

### Price Range Filtering
No `min_price` / `max_price` predicate exists on `/store/products`. **Price range filtering is applied client-side** using the `calculated_price` values already present in the ISR page payload. This avoids additional server round-trips for interactive filter UI.

### CORS Configuration
`STORE_CORS` env var accepts a comma-separated list of origins. Add the production domain before deploying:
```
STORE_CORS=http://localhost:3000,https://treasuretrove.in,https://www.treasuretrove.in
```

### Middleware
`src/api/middlewares.ts` adds Winston debug logging for all `/store/products*` requests (filter params + publishable key presence). No custom route override is needed — the Medusa v2 built-in route handles all required filtering.

---

## Files to Create/Modify
```
apps/backend/src/api/middlewares.ts    (new — Winston logging for /store/products*)
apps/backend/.env.example             (updated — CORS multi-origin production example)
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
- **Blocks:** TASK-020 (Integration Testing), TASK-022 (Backend Unit Tests)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Products Listing/TASK-019 — Storefront · Products Listing · Backend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-16 | Task completed. Confirmed native Medusa v2 /store/products endpoint covers all required filtering (collection, tags/material, pagination, field sort). Price sort and price range filter are client-side per ISR architecture. Added logging middleware and updated .env.example with production CORS format. Query param contract documented above. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
