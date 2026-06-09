# TASK-184: Revamping · Category & Collection Images + Homepage Offer Carousel · Full-Stack

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Done |
| **Priority** | High |
| **Sprint** | Sprint 2 — Revamping |
| **Story Points** | — |
| **PRD Reference** | Client Feedback #7 — Category & Collection Image Authoring + Homepage Offer Carousel |
| **Architecture Ref** | — |
| **Start Date** | — |
| **Due Date** | — |
| **Created** | 2026-05-18 |
| **Completed** | 2026-05-18 |

---

## Description
The storefront's "Shop by Category" section (`apps/storefront/src/components/home/CategorySection.tsx`) and "Our Collections" section (`apps/storefront/src/components/home/CollectionsGrid.tsx`) both render an image alongside the name for each tile. However, the Medusa Admin dashboard's create/edit forms for Product Categories and Product Collections have no provision to upload an image — the underlying `product_category` and `product_collection` entities do not expose an image field in the create UI. As a result, the storefront has nowhere to source an authored image from, and the "Shop by Category" homepage row is currently hardcoded as a static array of 8 categories with hand-pasted CDN URLs in `apps/storefront/src/app/page.tsx` (lines 16–73).

Additionally, the horizontally-scrollable promo carousel rendered between "Our Collections" and "Bestsellers" — built by `apps/storefront/src/components/home/OfferCarousel.tsx` — is currently hardcoded as a 6-item `OFFER_CARDS` constant in the component file itself (with badge / title / link / CDN image per card, e.g. "FESTIVE READY — Decor up to 30% off — SHOP DECOR"). Marketing wants to edit these cards without a code deploy.

This task resolves all four issues together:
1. Extend `product_category` with an image field and add an upload widget to the admin Create/Edit Category forms.
2. Extend `product_collection` with an image field and add an upload widget to the admin Create/Edit Collection forms.
3. Replace the hardcoded `categories` array in the storefront homepage with a live, dynamic fetch from Medusa — driven by the new image field — so adding/renaming/reordering categories in the admin is immediately reflected on the home page.
4. Move the `OfferCarousel` cards into a Payload CMS collection (or global) so the marketing team can author badge / title / link text / link href / image per card from the CMS — and have the homepage fetch them live.

The admin upload should use the existing Medusa file provider (the same one used for product images), so storage configuration is reused. The /store/product-categories and /store/collections endpoints must return the new image URL so the storefront can consume it without backend changes per-page. The Offer Carousel content is editorial / promotional and belongs in Payload alongside hero, marquee, and blog content — not in Medusa.

---

## Sub Tasks

### Backend — Category image
- [ ] Add an `image_url` (string, nullable) field to `product_category` via a custom module link or admin-side schema extension in `apps/backend/src/modules/` — match the approach used elsewhere in the backend for custom entity fields
- [ ] Expose the new field on the admin POST/PATCH `/admin/product-categories` payload via API middleware in `apps/backend/src/api/middlewares.ts` (allow it through validation)
- [ ] Surface the field on the storefront GET `/store/product-categories` response so `getCategories()` consumers can read it
- [ ] Add a unit test verifying the field round-trips through create → fetch in `apps/backend/src/__tests__/`

### Backend — Collection image
- [ ] Add an `image_url` field to `product_collection` (use the same extension pattern as Category, or store via the existing `metadata` bag if simpler — pick one and document the choice)
- [ ] Expose the field on admin POST/PATCH `/admin/collections` payload
- [ ] Surface the field on storefront GET `/store/collections` response (verify `getCollections()` in `apps/storefront/src/lib/medusa.ts:136` already maps it correctly — it currently reads from a `thumbnail`/`metadata.image` style field)
- [ ] Add a unit test verifying the field round-trips through create → fetch

### Admin UI — Category form
- [ ] Override or extend the admin Create Category form (vendored route from `@medusajs/dashboard` under `categories/category-create`) — add a file-upload widget that posts to the existing file-upload endpoint and stores the resulting URL on `image_url`
- [ ] Add the same widget to the Edit Category form (`categories/category-edit`) — pre-populate with the existing image and allow replace/remove
- [ ] Use the existing admin file-upload component (the same one used by Product image upload) — do not introduce a new uploader

### Admin UI — Collection form
- [ ] Override or extend the admin Create Collection form (`collections/collection-create`) — add a file-upload widget for `image_url`
- [ ] Add the same widget to the Edit Collection form (`collections/collection-edit`) — pre-populate, replace, remove
- [ ] Same uploader component as Category — share if practical

### Storefront — Dynamic Shop by Category
- [ ] Remove the hardcoded `categories` array in `apps/storefront/src/app/page.tsx` (lines 16–73)
- [ ] Extend `getCategories()` in `apps/storefront/src/lib/medusa.ts:154` to return `imageUrl` and `href` (mapped from the new backend field and `/collections/${handle}`)
- [ ] Add `getCategories()` to the `Promise.all` block in `HomePage()` alongside the other fetchers
- [ ] Pass the fetched categories to `<CategorySection>` for both the mobile and desktop renders
- [ ] Implement graceful fallback: if `getCategories()` returns an empty array (backend down / no categories seeded), the section should render nothing (or a small empty state) — not crash, not show broken images
- [ ] Confirm category ordering uses Medusa's `rank` / `position` field for stable sort
- [ ] Update `revalidate` if needed so newly-uploaded category images appear without a full hour wait

### Payload CMS — Homepage Offer Carousel
- [ ] Create a new Payload collection (or global) named `homepage-offers` in `apps/payload/src/collections/` (or wherever existing homepage globals live — match the pattern used by `hero`, `marquee`, `brand-philosophy`) with fields: `badge` (text), `title` (text), `linkLabel` (text, e.g. "SHOP DECOR"), `linkHref` (text — relative URL), `image` (upload → media collection), `order`/`sort` (number), `enabled` (checkbox)
- [ ] Configure Payload access control so anonymous read is allowed (same pattern as hero/marquee)
- [ ] Seed the collection with the 6 existing cards from `OFFER_CARDS` in `OfferCarousel.tsx` so the live site is not blank after the cutover
- [ ] Add a `getOfferCards()` fetcher in `apps/storefront/src/lib/payload.ts` that returns `OfferCard[]` shaped to match the existing `OfferCard` type
- [ ] Remove the `OFFER_CARDS` constant from `OfferCarousel.tsx` — the component should take `cards` as a required prop and have no hardcoded fallback (keep the existing optional `intervalMs`)
- [ ] In `apps/storefront/src/app/page.tsx`, add `getOfferCards()` to the `Promise.all` block and pass the result to `<OfferCarousel cards={offerCards} />`
- [ ] Handle empty / error state: if Payload returns zero enabled cards, render nothing (no empty carousel)
- [ ] Wire Payload's `afterChange` hook on the new collection to call `POST /api/revalidate` on the storefront so edits appear immediately, matching the pattern used by other Payload collections
- [ ] Extend the type-generation if applicable (`@TreasureTrove/types`) so `OfferCard` is generated, not duplicated

### Migration / seed
- [ ] Update `apps/backend/src/scripts/seed-store.ts` (and any category/collection seed) to populate the new `image_url` field with the same CDN URLs currently hardcoded in `page.tsx`, so dev environments are not blank after the migration
- [ ] Add a database migration for the new column(s) — runnable via the existing Medusa migration tooling
- [ ] Add a Payload seed script entry for the `homepage-offers` collection

---

## Acceptance Criteria
- [ ] Admin → Categories → "Create Category" form shows an image upload widget; the uploaded image persists and appears in the category list and detail views
- [ ] Admin → Categories → editing an existing category shows the current image and allows replace/remove
- [ ] Admin → Collections → "Create Collection" form shows an image upload widget; uploaded image persists end-to-end
- [ ] Admin → Collections → editing an existing collection shows the current image and allows replace/remove
- [ ] `GET /store/product-categories` returns the new `image_url` field for each category
- [ ] `GET /store/collections` returns the new `image_url` field for each collection
- [ ] The storefront homepage "Shop by Category" row is populated live from `getCategories()` — no hardcoded array remains in `page.tsx`
- [ ] Creating a new category in the admin causes it to appear on the home page within the storefront's revalidate window (or sooner via the existing revalidate webhook)
- [ ] Uploading or replacing a category/collection image in the admin causes the new image to appear on the storefront within the revalidate window
- [ ] If the backend returns zero categories, the section renders gracefully (no crash, no broken layout)
- [ ] No regressions in `CollectionsGrid.tsx` — collections still render with the image they had before, plus any newly-uploaded ones
- [ ] Payload Admin → new `homepage-offers` collection visible, editable, supports image upload, reorder, enable/disable
- [ ] The homepage OfferCarousel is populated from Payload — no `OFFER_CARDS` constant remains in `OfferCarousel.tsx`
- [ ] Editing an offer card in Payload (or creating/disabling one) is reflected on the storefront within the revalidate window
- [ ] If zero enabled offer cards exist, the carousel section renders nothing (not a broken empty container)
- [ ] Existing unit / e2e tests pass; new tests cover the field round-trip and the storefront dynamic render
- [ ] TypeScript strict mode — no `any`; types extended in `@TreasureTrove/types` if shared
- [ ] Passes lint and type-check with zero new errors

---

## Technical Notes
- Medusa's default `product_category` and `product_collection` entities do not have an image field — both must be extended. The simplest path is a custom module link with a single `image_url` column; the more conservative path is to store the URL inside the existing `metadata` JSON bag and adapt the admin form to write into metadata. Pick one and stay consistent across Category and Collection.
- The admin form override pattern in this repo uses route extensions under `apps/backend/src/admin/routes/` — follow the same convention as other admin overrides in the project.
- The admin file uploader integrates with whatever Medusa file provider is configured in `medusa-config.ts` (local, S3, etc.) — no new file-storage code should be needed.
- `CollectionsGrid.tsx` already conditionally renders the image (`{collection.imageUrl ? ... : null}`) — once the backend populates `image_url`, the storefront side needs no changes.
- `CategorySection.tsx` always renders an `<Image>`, so the storefront-side fallback for missing images must be handled either in the component (skip the image element if `imageUrl` is null) or by guaranteeing every category has an image post-seed.
- The hardcoded `categories` array in `page.tsx` is the source of the current 8 round tiles — the dynamic version must preserve the same visual ordering (use Medusa rank or a hand-set sort field).
- Storefront revalidation: if a "category-upsert" event isn't already wired, consider piggy-backing on the existing `/api/revalidate` webhook used by the product subscriber (`apps/backend/src/subscribers/product-upsert.ts`) — add a sibling category/collection subscriber so newly-uploaded images appear immediately.
- The Offer Carousel is editorial/marketing content (not commerce data) — it belongs in Payload alongside the other homepage content (`hero`, `marquee`, `brand-philosophy`, `blog`). Do NOT model it as a Medusa entity.
- `OfferCarousel.tsx` already takes `cards?: OfferCard[]` as an optional prop with a hardcoded fallback — the refactor is to make `cards` required and remove the fallback, then pass live data from `page.tsx`.
- The Payload `homepage-offers` collection should sort by an explicit `order` field (ascending) so marketing can re-order cards from the CMS without touching code.

---

## Files to Create/Modify
```
apps/backend/src/modules/<category-image-extension>/                     (create — module link adding image_url to product_category)
apps/backend/src/modules/<collection-image-extension>/                   (create — module link adding image_url to product_collection)
apps/backend/src/api/middlewares.ts                                      (modify — allow image_url in admin payloads)
apps/backend/src/admin/routes/categories/                                (create — admin form override with file uploader)
apps/backend/src/admin/routes/collections/                               (create — admin form override with file uploader)
apps/backend/src/subscribers/category-upsert.ts                          (optional — revalidate storefront on category change)
apps/backend/src/subscribers/collection-upsert.ts                        (optional — revalidate storefront on collection change)
apps/backend/src/scripts/seed-store.ts                                   (modify — seed image_url for existing categories/collections)
apps/storefront/src/lib/medusa.ts                                        (modify — extend getCategories() to return imageUrl + href)
apps/storefront/src/app/page.tsx                                         (modify — remove hardcoded categories array, fetch dynamically)
apps/storefront/src/components/home/CategorySection.tsx                  (modify — handle missing imageUrl gracefully)
apps/storefront/src/components/home/OfferCarousel.tsx                    (modify — remove OFFER_CARDS constant, make cards prop required)
apps/storefront/src/lib/payload.ts                                       (modify — add getOfferCards() fetcher)
apps/payload/src/collections/HomepageOffers.ts                           (create — new Payload collection / global)
apps/payload/src/payload.config.ts                                       (modify — register HomepageOffers collection)
apps/storefront/src/app/api/revalidate/route.ts                          (verify — handles `category`/`collection`/`offer` types if subscribers added)
packages/types/                                                          (modify — extend Category/Collection types with image_url, add OfferCard type)
```

---

## API Endpoints
- `POST /admin/product-categories` — admin: now accepts `image_url`
- `PATCH /admin/product-categories/:id` — admin: now accepts `image_url`
- `GET /store/product-categories` — storefront: response includes `image_url`
- `POST /admin/collections` — admin: now accepts `image_url`
- `PATCH /admin/collections/:id` — admin: now accepts `image_url`
- `GET /store/collections` — storefront: response includes `image_url`
- `GET /api/homepage-offers?where[enabled][equals]=true&sort=order&depth=1` (Payload) — storefront: list active offer cards in display order
- `POST /api/revalidate` (storefront) — extend types to include `category`, `collection`, and `offer` if not present

---

## UI Screens
- Admin → Categories → Create / Edit (new image upload field)
- Admin → Collections → Create / Edit (new image upload field)
- Payload Admin → Homepage Offers → list / create / edit (new collection with badge, title, link, image, order, enabled)
- Storefront `/` — "Shop by Category" row (now dynamic)
- Storefront `/` — "Our Collections" grid (unchanged visually; image source now authored in admin)
- Storefront `/` — Offer Carousel between Our Collections and Bestsellers (now CMS-driven)

---

## Related Test Cases
- Unit: backend — `apps/backend/src/__tests__/category-image.test.ts` (create + fetch round-trip)
- Unit: backend — `apps/backend/src/__tests__/collection-image.test.ts` (create + fetch round-trip)
- Unit: storefront — `apps/storefront/src/components/home/TC-027-CategorySection.test.tsx` (dynamic render + empty state)
- Unit: storefront — extend `apps/storefront/src/components/home/TC-023-CollectionsGrid.test.tsx` (image from new field)
- Unit: storefront — `apps/storefront/src/components/home/TC-028-OfferCarousel.test.tsx` (renders cards from prop, hides when empty)
- E2E: admin upload a category image → verify it appears on `/`
- E2E: edit an offer card in Payload → verify it updates on `/`

## Dependencies
- **Blocked by:** None
- **Blocks:** None
- **Note:** Sub-task ordering — complete the backend Category image work before the storefront dynamic-fetch sub-task, since the storefront depends on the new field being present.

---

## Claude Code Context
```
harness/claude.md
harness/tasks/178 — Revamping — Client Feedback/TASK-184 — Revamping · Category & Collection Images · Full-Stack.md
harness/architecture.md
apps/storefront/src/app/page.tsx
apps/storefront/src/components/home/CategorySection.tsx
apps/storefront/src/components/home/CollectionsGrid.tsx
apps/storefront/src/components/home/OfferCarousel.tsx
apps/storefront/src/lib/medusa.ts
apps/storefront/src/lib/payload.ts
apps/backend/src/api/middlewares.ts
apps/backend/src/scripts/seed-store.ts
apps/backend/src/subscribers/product-upsert.ts
apps/payload/src/payload.config.ts
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-05-18 | Task created. Client flagged that the admin has no image upload for Category or Collection while the storefront renders an image for each — and that "Shop by Category" is currently hardcoded in `page.tsx`. Three-part fix scoped: extend both entities with `image_url`, add upload widgets to admin forms, and make the homepage Category section consume the new field dynamically. |
| 2026-05-18 | Scope expanded to a fourth concern: the `OfferCarousel` between Our Collections and Bestsellers is also hardcoded (`OFFER_CARDS` in `OfferCarousel.tsx`). Adding a Payload CMS `homepage-offers` collection (badge / title / linkLabel / linkHref / image / order / enabled), a `getOfferCards()` fetcher, and rewiring the component to consume live data — same pattern as hero/marquee/blog. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|

---

## Review Notes
- **—**
