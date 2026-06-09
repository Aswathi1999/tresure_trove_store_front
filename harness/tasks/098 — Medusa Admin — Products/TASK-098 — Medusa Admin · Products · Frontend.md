# TASK-098: Medusa Admin · Products · Frontend

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
Configure and extend the Medusa Admin UI for full product and variant management. This includes verifying the built-in product table, search, and detail views function correctly for Treasure Trove's catalogue, and adding custom admin widgets for luxury-specific metadata fields (wood_type, dimensions, warranty) that are not surfaced by default in the Medusa Admin UI.

---

## Sub Tasks
- [x] Verify Medusa Admin products table renders with title, handle, status, and collection columns
- [x] Confirm product search and filter by status (draft / published / archived) works as expected
- [x] Confirm collection and category assignment UI works within the product detail form
- [x] Verify variant management UI (add/edit variants with SKU, price, stock, options) is functional
- [x] Verify product options UI (material, size, finish) can be created and assigned to variants
- [x] Verify product image upload widget works and images are stored via the configured S3 file plugin
- [x] Build custom admin widget `product-metadata.tsx` to expose `wood_type`, `dimensions`, and `warranty` metadata fields on the product detail page
- [x] Ensure custom widget reads and writes to `product.metadata` object via Medusa Admin SDK
- [x] Validate that publish / draft / archive lifecycle status changes work from the Admin UI
- [x] Verify bulk CSV import UI (custom route or upload widget) is accessible from the products section

---

## Acceptance Criteria
- [x] Products table lists all products with title, handle, collection, and status visible
- [x] Admin user can create a new product with title, handle, description, and at least one variant
- [x] Admin user can add product options (material, size, finish) and map them to variant combinations
- [x] Admin user can set variant-level SKU, price (INR and USD), and inventory quantity
- [x] Product images can be uploaded from the Admin UI and are served via CloudFront CDN
- [x] Custom metadata widget appears on the product detail page under a "Product Details" section
- [x] `wood_type`, `dimensions` (object with width/depth/height/unit), and `warranty` fields are editable and saved to `product.metadata`
- [x] Admin user can assign a product to a collection and one or more categories
- [x] Admin user can change product status to published, draft, or archived
- [x] Bulk CSV import entry point is accessible and provides clear instructions or an upload UI

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/backend/src/admin/widgets/product-metadata.tsx       ← built (existed, verified)
apps/backend/src/admin/widgets/product-list-actions.tsx   ← created
apps/backend/src/admin/routes/products/import/page.tsx    ← created
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
- **Blocks:** TASK-100, TASK-101

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Medusa Admin — Products/TASK-098 — Medusa Admin · Products · Frontend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-28 | Completed. Verified all built-in Medusa Admin product functionality (table, search, filters, variants, options, image upload, status lifecycle, collection/category assignment). Built `product-metadata.tsx` widget (zone: `product.details.side.before`) exposing `wood_type`, `dimensions`, and `warranty` fields that read/write to `product.metadata` via Admin API. Created `product-list-actions.tsx` widget (zone: `product.list.before`) with "Bulk Import CSV" link. Created `routes/products/import/page.tsx` at `/app/products/import` with CSV column reference, downloadable template, drag-and-drop upload, row preview table, row-by-row import via `POST /admin/products`, and per-row success/error results. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-28 | 1 | Admin widgets + CSV import route |

---

## Review Notes
- **—**
