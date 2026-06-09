# TASK-028: Storefront · Product Detail Page · Integration Testing

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
| **Start Date** | 2026-04-23 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-23 |

---

## Description
Replace all mock product detail and material story functions with real Medusa JS SDK v2 and Payload REST API calls, then write Playwright E2E tests covering the full PDP flow — gallery interaction, variant selection, price update, add to cart, material story link, related products, and all edge-case states.

---

## Sub Tasks
- [x] Remove mock imports from all PDP components (`ImageGallery`, `VariantSelector`, `MaterialStoryLink`, `RelatedProducts`)
- [x] Wire `getProductByHandle` (Medusa) into the PDP page, replacing the mock
- [x] Wire `getMaterialStory` (Payload) into the PDP page, replacing the mock
- [x] Wire `getRelatedProducts` (Medusa) into the PDP page
- [x] Map Medusa generic option system (id/title/values) to component prop shapes
- [x] Pull metadata-driven fields (specifications, careInstructions, detailText, rating, reviewCount) from product metadata
- [x] Wrap Payload call in try-catch so PDP renders even when CMS is offline
- [x] Write 25 Playwright E2E tests covering all PDP flows and edge cases

---

## Acceptance Criteria
- [x] PDP page fetches product from Medusa via `getProductByHandle` — no mock data
- [x] Material story fetched from Payload via `getMaterialStory` — no mock data
- [x] Related products fetched from Medusa via `getRelatedProducts`
- [x] All PDP components (`ImageGallery`, `VariantSelector`, `MaterialStoryLink`, `RelatedProducts`) import no types from `@/lib/mock/*`
- [x] TypeScript type-check passes with zero errors
- [x] Playwright E2E tests cover: page structure, gallery interaction, variant selection, price display, quantity controls, add-to-cart, related products, material story link, 404 edge case, back navigation
- [x] Tests skip gracefully when no products exist in the catalogue (safe for empty dev DB)

---

## Technical Notes
- Medusa's generic option system (options by title: "Size", "Finish", "Material") is mapped to the VariantSelector's material/size/finish structure in the page layer — components remain UI-only
- `getMaterialStory` is wrapped in try-catch in the page; Payload being offline does not crash the PDP
- `RelatedProducts` now accepts `PdpRelatedProduct` (price as pre-formatted string, `href` instead of `handle`) — compatible with `HomepageProduct` returned by `getRelatedProducts`
- Metadata keys used: `specifications`, `careInstructions`, `detailText`, `rating`, `reviewCount`, `material`, `finishColors`
- Rating block is conditionally rendered (hidden when `rating === 0`, since Medusa has no native rating field)
- Specifications and Care sections are conditionally rendered (hidden when metadata arrays are empty)

---

## Files to Create/Modify
```
apps/storefront/src/app/products/[handle]/page.tsx          — modified: real API calls, data mapping
apps/storefront/src/components/pdp/ImageGallery.tsx         — modified: inline type, no mock import
apps/storefront/src/components/pdp/VariantSelector.tsx      — modified: inline type, no mock import
apps/storefront/src/components/pdp/MaterialStoryLink.tsx    — modified: inline type, no mock import
apps/storefront/src/components/pdp/RelatedProducts.tsx      — modified: inline type, pre-formatted price, href
apps/storefront/e2e/pdp/product-detail.spec.ts              — created: 25 Playwright E2E tests
```

---

## API Endpoints
- `GET /store/products?handle={handle}&fields=*variants,*variants.prices,*images,*collection,*options,*options.values,*tags` — Medusa product detail
- `GET /store/products?collection_id={id}&limit=5` — Medusa related products
- `GET /api/material-stories?where[material][equals]={material}&where[status][equals]=published` — Payload material story

---

## UI Screens
- **PDP** — `/products/[handle]`

---

## Related Test Cases
- `apps/storefront/e2e/pdp/product-detail.spec.ts` — 25 E2E tests (structure, gallery, variants, price, quantity, cart, related, story, 404)

## Dependencies
- **Blocked by:** TASK-026 (Frontend), TASK-027 (Backend)
- **Blocks:** TASK-031 (Frontend Performance Testing), TASK-032 (Backend Performance Testing), TASK-033 (Security & Vulnerability Testing)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Product Detail Page/TASK-028 — Storefront · Product Detail Page · Integration Testing.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-23 | Task completed. Removed all mock imports from PDP components and page. Wired real Medusa (`getProductByHandle`, `getRelatedProducts`) and Payload (`getMaterialStory`) APIs. Mapped Medusa's generic option model to component prop shapes. Wrote 25 Playwright E2E tests in `e2e/pdp/product-detail.spec.ts` covering the full PDP flow and edge cases. TypeScript type-check passes with zero errors. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-23 | — | Integration + E2E tests |

---

## Review Notes
- `/collections` pages confirmed intentional — TASK-066 through TASK-073 are the dedicated Collections feature. Not removed.
- Mock files in `@/lib/mock/` are preserved (other features may still reference them) — only the PDP imports were cut.
