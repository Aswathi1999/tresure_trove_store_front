# TASK-012: Storefront · Homepage · Integration Testing

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | athulgopal-adviciya |
| **Status** | ✅ Done |
| **Priority** | High |
| **Sprint** | Sprint 1 |
| **Story Points** | 5 |
| **PRD Reference** | Homepage |
| **Architecture Ref** | Storefront data flow — Medusa JS SDK, Payload REST API |
| **Start Date** | 2026-04-22 |
| **Due Date** | 2026-04-22 |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-22 |

---

## Description
Wire the homepage frontend components to the real Medusa JS SDK v2 and Payload REST API, replacing all mock functions with live data fetches in Server Components. Write Playwright E2E tests covering all homepage sections, edge cases (product load failure, CMS unavailable), and ISR revalidation behaviour against a running local environment.

---

## Sub Tasks
- [x] Extend `HomepageContent` Payload global with missing fields (`heroEditorPickTitle`, `heroEditorPickLink`, `brandPhilosophyEyebrow`, `brandPhilosophyCtaText`, `brandPhilosophyCtaLink`); change `brandPhilosophyBody` from richText to textarea
- [x] Add canonical types (`HeroContent`, `BlogPreviewItem`, `BrandPhilosophyContent`) and real fetchers (`getHeroContent`, `getMarqueeText`, `getBlogPreviews`, `getBrandPhilosophy`) to `lib/payload.ts`
- [x] Add canonical types (`HomepageProduct`, `HomepageCollection`) and real fetchers (`getFeaturedProducts`, `getNewArrivals`, `getCollections`) to `lib/medusa.ts` — use raw `fetch` with `next: { revalidate: 3600 }` for ISR
- [x] Update all five homepage components to import types from real libs (`HeroSection`, `BlogPreview`, `BrandPhilosophy`, `CollectionsGrid`, `FeaturedProducts`)
- [x] Update `CollectionsGrid` to handle `imageUrl: string | null` (Medusa collections have no images)
- [x] Update `page.tsx` to import from `@/lib/payload` and `@/lib/medusa`; add `export const revalidate = 3600`
- [x] Write Playwright E2E tests: `e2e/homepage/homepage.spec.ts`

---

## Acceptance Criteria
- [x] `page.tsx` imports from `@/lib/payload` and `@/lib/medusa` — no mock imports remain on the page
- [x] `getHeroContent`, `getMarqueeText`, `getBlogPreviews`, `getBrandPhilosophy` fetch `/globals/homepage-content?depth=1` and `/blog-posts` from Payload REST API with 3600s ISR
- [x] `getFeaturedProducts`, `getNewArrivals`, `getCollections` fetch from Medusa `/store/products` and `/store/collections` via raw `fetch` with `next: { revalidate: 3600 }`
- [x] All fetch failures are caught gracefully — page renders with empty sections, not a 500 error
- [x] `HomepageContent` Payload global has all fields the storefront needs (hero, marquee, brand philosophy with eyebrow/cta)
- [x] Playwright E2E test file exists at `e2e/homepage/homepage.spec.ts`
- [x] E2E tests cover: section visibility, product card links, collection card links, blog card links, category tile navigation, brand philosophy CTA, ISR webhook (401 on bad secret, 200 on good secret)
- [x] `export const revalidate = 3600` on homepage page for time-based ISR

---

## Technical Notes
- **Medusa collections have no image field** — `HomepageCollection.imageUrl` is `string | null`; `CollectionsGrid` renders a plain background when `imageUrl` is null
- **Next.js fetch deduplication** — `getHeroContent`, `getMarqueeText`, `getBrandPhilosophy` all fetch the same Payload URL; Next.js deduplicates within a single render, so only one HTTP request is made
- **Mock files preserved** — `lib/payload.mock.ts` and `lib/medusa.mock.ts` remain as reference/dev-seed data; they are no longer imported by the production page
- **ISR revalidation** — `/api/revalidate` route calls `revalidatePath('/')` when Payload publishes homepage content; product changes require a separate Medusa webhook subscriber (deferred to TASK-015)
- **Price formatting** — uses `formatPrice` from `@TreasureTrove/utils`; INR prices display as "₹X,XXX" via `Intl.NumberFormat`

---

## Files Created/Modified
```
apps/cms/src/globals/HomepageContent.ts               ← added missing fields; richText → textarea
apps/storefront/src/lib/payload.ts                    ← added types + 4 homepage fetchers
apps/storefront/src/lib/medusa.ts                     ← added types + 3 homepage fetchers
apps/storefront/src/components/home/HeroSection.tsx   ← type import: payload.mock → payload
apps/storefront/src/components/home/BlogPreview.tsx   ← type import: payload.mock → payload
apps/storefront/src/components/home/BrandPhilosophy.tsx ← type import: payload.mock → payload
apps/storefront/src/components/home/CollectionsGrid.tsx ← type import + null imageUrl handling
apps/storefront/src/components/home/FeaturedProducts.tsx ← type import: medusa.mock → medusa
apps/storefront/src/app/page.tsx                      ← real imports + export const revalidate = 3600
apps/storefront/e2e/homepage/homepage.spec.ts         ← new — Playwright E2E suite
```

---

## API Endpoints
- `GET /api/globals/homepage-content?depth=1` (Payload CMS) — hero, marquee, brand philosophy
- `GET /api/blog-posts?where[status][equals]=published&sort=-publishedAt&limit=3&depth=1` (Payload CMS) — blog previews
- `GET /store/products?limit=4` (Medusa) — featured products
- `GET /store/products?limit=4&order=-created_at` (Medusa) — new arrivals
- `GET /store/collections?limit=4` (Medusa) — collections grid
- `POST /api/revalidate` (Next.js route handler) — ISR webhook from Payload CMS

---

## UI Screens
- Homepage `/` — all 11 sections wired to live API

---

## Related Test Cases
- `e2e/homepage/homepage.spec.ts` — section render, product/collection/blog links, category tiles, brand philosophy CTA, ISR webhook (401/200), CMS unavailable graceful fallback

## Dependencies
- **Blocked by:** TASK-010 (homepage frontend), TASK-011
- **Blocks:** TASK-015, TASK-016, TASK-017

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Homepage/TASK-012 — Storefront · Homepage · Integration Testing.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-22 | Task implemented: CMS global extended, real API fetchers added to lib/payload.ts and lib/medusa.ts, all component type imports updated, page.tsx wired to live data with ISR, Playwright E2E suite written at e2e/homepage/homepage.spec.ts |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-22 | 3 | API wiring + E2E tests |

---

## Review Notes
- CMS must have `homepage-content` global document saved before hero/marquee/brand-philosophy render live data
- Medusa must have products seeded for FeaturedProducts/NewArrivals sections to show cards
- Collections from Medusa will render without images until images are attached via a future CMS editorial feature
