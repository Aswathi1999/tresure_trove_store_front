# TASK-085: Storefront · Materials Showcase · Frontend Unit Tests

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
| **Start Date** | 2026-05-04 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-05-04 |

---

## Description
Write Vitest + Testing Library unit tests for the Materials Showcase frontend components, covering MaterialCard, SustainabilityRating, MaterialDetail, and RelatedProductsByMaterial rendering and prop behaviour using mock material data.

---

## Sub Tasks
- [x] Write `SustainabilityRating.test.tsx` — rating display, 5 leaf icons, label toggle (8 tests)
- [x] Write `MaterialCard.test.tsx` — card structure, links, image, origin, badge, CTA (13 tests)
- [x] Write `MaterialDetail.test.tsx` — hero image, name, badge, origin, rating, short description, paragraph rendering, edge cases (12 tests)
- [x] Write `RelatedProductsByMaterial.test.tsx` — null return, section headings, product cards, links, images (12 tests)

---

## Acceptance Criteria
- [x] `SustainabilityRating` — renders container, 5 leaf SVG icons, correct label text per rating, no label by default
- [x] `MaterialCard` — renders article testid, title, origin, wood type badge, sustainability rating, short description, image src/alt, all three links to `/materials/[slug]`, CTA text
- [x] `MaterialDetail` — renders article testid, material name, wood type badge, origin, sustainability rating, short description, description paragraphs, image src/alt, "Material Story" eyebrow, empty description edge case
- [x] `RelatedProductsByMaterial` — returns null for empty products, renders section testid, "Featured Pieces" heading, "Made with [material]" label, product cards with testids, titles, prices, links using `product.href`, images with correct alt text
- [x] All tests use `vi.mock('next/image')` and `vi.mock('next/link')` per project conventions
- [x] All tests import live types (`StorefrontMaterialStory`, `HomepageProduct`) — no mock types
- [x] Tests use co-located `*.test.tsx` pattern matching the rest of the `src/components/` directory

---

## Technical Notes
- `next/link` mock passes `data-testid` through explicitly — required because MaterialCard and RelatedProductsByMaterial place `data-testid` directly on `<Link>` elements
- `StorefrontMaterialStory` imported from `@/lib/payload` (live type, not mock) — confirms components work with real API shape
- `HomepageProduct` imported from `@/lib/medusa` — confirms RelatedProductsByMaterial is fully wired to live types
- lucide-react (Leaf, MapPin icons) renders SVG natively in jsdom — no mock needed
- SustainabilityRating has no Next.js imports — no mocks needed, simplest test file

---

## Files to Create/Modify
```
apps/storefront/src/components/materials/SustainabilityRating.test.tsx (created — 8 tests)
apps/storefront/src/components/materials/MaterialCard.test.tsx         (created — 13 tests)
apps/storefront/src/components/materials/MaterialDetail.test.tsx       (created — 12 tests)
apps/storefront/src/components/materials/RelatedProductsByMaterial.test.tsx (created — 12 tests)
```

---

## API Endpoints
N/A — this task has no API endpoints

---

## UI Screens
- **—**

---

## Related Test Cases
- `src/components/materials/SustainabilityRating.test.tsx` — 8 tests
- `src/components/materials/MaterialCard.test.tsx` — 13 tests
- `src/components/materials/MaterialDetail.test.tsx` — 12 tests
- `src/components/materials/RelatedProductsByMaterial.test.tsx` — 12 tests

## Dependencies
- **Blocked by:** TASK-082 (Frontend)
- **Blocks:** None

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Materials Showcase/TASK-085 — Storefront · Materials Showcase · Frontend Unit Tests.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-05-04 | Task completed. Created 4 Vitest + Testing Library test files with 45 tests total. `SustainabilityRating.test.tsx` (8), `MaterialCard.test.tsx` (13), `MaterialDetail.test.tsx` (12), `RelatedProductsByMaterial.test.tsx` (12). All tests use live `StorefrontMaterialStory` / `HomepageProduct` types, mock `next/image` and `next/link` per project conventions. `next/link` mock passes `data-testid` explicitly to support component-level testid attributes on Link elements. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
