# TASK-099: Medusa Admin · Products · Backend

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
| **Start Date** | — |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-29 |

---

## Description
Configure the Medusa v2 backend to fully support Treasure Trove's product catalogue requirements. This includes enabling and configuring the Product Module in `medusa-config.ts`, setting up the S3 file plugin for product image storage, ensuring `wood_type`, `dimensions`, and `warranty` metadata fields are supported on the product entity, and building a bulk CSV import workflow so the client can seed initial product data.

---

## Sub Tasks
- [ ] Verify Product Module is enabled and correctly configured in `medusa-config.ts`
- [ ] Configure `@medusajs/file-s3` (or equivalent) plugin for product image uploads pointing to `treasure-trove-media` S3 bucket
- [ ] Confirm CloudFront URL generation is applied to file URLs returned by the file plugin
- [ ] Document the `product.metadata` schema for `wood_type` (string), `dimensions` ({width, depth, height, unit}), and `warranty` (string) — no custom migration needed as metadata is a JSONB field
- [ ] Create product collections via seed script or admin API: Living Room, Bedroom, Dining, Office, Outdoor
- [ ] Create product categories via seed script or admin API to mirror site taxonomy
- [ ] Build a bulk CSV import workflow (`apps/backend/src/workflows/bulk-import-products.ts`) that accepts a parsed CSV payload and creates products with variants via Medusa's product service
- [ ] Build a custom API route (`apps/backend/src/api/admin/products/import/route.ts`) to accept CSV file upload, parse rows, and invoke the bulk import workflow
- [ ] Write a seed script (`apps/backend/src/scripts/seed-products.ts`) for initial sample product data
- [ ] Confirm Medusa Admin CORS settings in `medusa-config.ts` allow the Admin UI origin

---

## Acceptance Criteria
- [ ] Product Module is active and Medusa Admin product CRUD operations work end-to-end against the PostgreSQL database
- [ ] Images uploaded via Admin UI are stored in S3 and accessible via CloudFront CDN URL
- [ ] S3 bucket URL is never exposed — only CloudFront URLs are returned in API responses
- [ ] `product.metadata` correctly persists `wood_type`, `dimensions`, and `warranty` fields as JSONB
- [ ] Bulk import API route accepts a CSV file with columns: title, handle, description, variant_sku, price_inr, price_usd, stock, material, size, finish, wood_type, dimensions, warranty
- [ ] Bulk import workflow creates products idempotently (skips or updates if handle already exists)
- [ ] Seed script creates at least 5 sample products with variants, options, and metadata
- [ ] All custom API routes return the standard error format defined in `claude.md`
- [ ] No raw SQL — all database operations go through Medusa's service layer / MikroORM

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/backend/medusa-config.ts
apps/backend/src/workflows/bulk-import-products.ts
apps/backend/src/api/admin/products/import/route.ts
apps/backend/src/scripts/seed-products.ts
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
- **Blocks:** TASK-100, TASK-102

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Medusa Admin — Products/TASK-099 — Medusa Admin · Products · Backend.md
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
