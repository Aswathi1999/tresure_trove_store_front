# TASK-185: Revamping · Homepage Full CMS Content (Static → Dynamic) · Full-Stack

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Done |
| **Priority** | High |
| **Sprint** | Sprint 2 — Revamping |
| **Story Points** | — |
| **PRD Reference** | Client Feedback — Full homepage content must be editable from the CMS |
| **Architecture Ref** | — |
| **Start Date** | — |
| **Due Date** | — |
| **Created** | 2026-05-25 |
| **Completed** | 2026-05-25 |

---

## Description
The client wants **every piece of editorial content on the homepage to be editable from the Payload CMS**, with the **current hardcoded values preserved as fallback defaults**. Behaviour required:

- If a field has **not** been edited in the CMS → the storefront shows the **same content it shows today** (the existing static value).
- If a field **has** been edited in the CMS → the storefront shows the **CMS value**.

Several homepage sections are already correctly driven by live data and **must not be changed** (see "Out of Scope"). The remaining sections are still hardcoded — either as constants inside the component files or as static props passed from `apps/storefront/src/app/page.tsx`. This task wires those remaining sections to the Payload `homepage-content` global (`apps/cms/src/globals/HomepageContent.ts`, slug `homepage-content`), adds the missing CMS fields, and routes them through the existing fetch layer in `apps/storefront/src/lib/payload.ts` with static fallbacks.

There is also a **latent bug to fix as part of this work**: `getHeroContent()` (`apps/storefront/src/lib/payload.ts:116`) already fetches `headline`, `subtext`, `ctaText`, `ctaHref`, and `imageUrl` from the CMS, but `HeroSection` (`apps/storefront/src/components/home/HeroSection.tsx`) **never renders any of them** — the visible hero is the fully-static `HeroCarousel` (`HERO_SLIDES` constant). So editors can change hero fields in Payload today and nothing happens. This task makes the hero genuinely CMS-driven.

The whole change must compile cleanly — **`pnpm lint`, `pnpm type-check`, and `pnpm build` from the repo root must pass with zero new errors** (TypeScript strict, no `any`, `next/image` only).

---

## Current State Audit (do this first — confirm before coding)

### Already dynamic — **OUT OF SCOPE, DO NOT TOUCH**
| Section | Component | Source | Fallback today |
|---|---|---|---|
| Marquee bar | `MarqueeBar.tsx` | CMS `marqueeItems` via `getMarqueeText()` | `DEFAULT_MARQUEE_ITEMS` |
| Shop by Category (tiles) | `CategorySection.tsx` | Medusa categories (TASK-184) | — |
| Our Collections (tiles) | `CollectionsGrid.tsx` | Medusa collections | — |
| Offer carousel | `OfferCarousel.tsx` | CMS `offerCards` via `getOfferCards()` (TASK-184) | hidden when empty |
| Bestsellers / New Arrivals (product cards) | `FeaturedProducts.tsx` | Medusa `getFeaturedProducts()` / `getNewArrivals()` | empty-state UI |
| Blog cards | `BlogPreview.tsx` | Payload `getBlogPreviews()` | empty list |
| Brand Philosophy | `BrandPhilosophy.tsx` | CMS via `getBrandPhilosophy()` | `DEFAULT_BRAND_PHILOSOPHY` |

> Only the **product cards / collection tiles / blog cards / marquee items / offer cards / brand philosophy** are dynamic. Their **surrounding section headings and static copy are NOT** — those are in scope below.

### Still static — **IN SCOPE**
| # | What | Where it's hardcoded |
|---|---|---|
| 1 | Hero carousel slides (badge, title, subtitle, CTA label, href, image) ×3 | `HeroCarousel.tsx:17-46` (`HERO_SLIDES`); `HeroSection.tsx:23` renders `<HeroCarousel>` with no slides prop |
| 2 | Hero "Editor's Pick" image | `HeroSection.tsx:10-11` (`EDITOR_PICK_IMAGE`) — note `editorPickTitle` / `editorPickHref` are already CMS-driven |
| 3 | Hero fields fetched but discarded | `payload.ts:116-131` returns `headline/subtext/ctaText/ctaHref/imageUrl`; `HeroSection` ignores them |
| 4 | Trust strip badges (label + sub, ×4) | `TrustStrip.tsx:3-8` (`items`) — icons are Lucide components |
| 5 | Shop by Price buckets (label, href, dark) ×4 + heading "Shop by Price" | `ShopByPrice.tsx:3-8` + line 18 |
| 6 | Bestsellers section title/subtitle/viewAll | `page.tsx:80-86` (static props) |
| 7 | New Arrivals section title/subtitle/viewAll | `page.tsx:88-94` (static props) |
| 8 | "Our Collections" heading + subtitle | `CollectionsGrid.tsx:16-19` |
| 9 | "Shop by Category" eyebrow/heading/subtitle | `CategorySection.tsx:50-60` |
| 10 | "From Our Journal" eyebrow/heading/subtitle | `BlogPreview.tsx:16-24` |

---

## Design / Approach

**Fallback contract (applies to every field below).** Each fetcher in `payload.ts` returns the CMS value when present and non-empty, otherwise the existing static constant. Move today's hardcoded values into named `DEFAULT_*` constants (mirroring the existing `DEFAULT_MARQUEE_ITEMS` / `DEFAULT_BRAND_PHILOSOPHY` pattern) so "unedited CMS = current site". Empty string / null / empty array from the CMS = "not edited" = use default.

**Where content lives.** All new fields go on the existing `homepage-content` global (`apps/cms/src/globals/HomepageContent.ts`). Do **not** create a second global. Delete the orphaned legacy global instead (see cleanup).

**Data flow stays server-side.** `page.tsx` remains an async Server Component; it fetches via `payload.ts` and passes plain props down. Client components (`HeroCarousel`, `MarqueeBar`, `OfferCarousel`) keep their interactivity but receive data as props — no client-side Payload calls (per `harness/claude.md` rule).

**Icons (Trust strip).** Lucide icon components can't be stored in the CMS. Store an `icon` enum/select per trust item (e.g. `truck` | `returns` | `lock` | `cod`) and map the string → Lucide component in `TrustStrip.tsx`. Label + sub text become CMS fields.

**Images.** CMS-uploaded images resolve to CloudFront URLs via `resolveMediaUrl()` (already used). Verify `next.config` `images.remotePatterns` already permits the CloudFront host (existing CMS images render, so it should). The static fallback images are `googleusercontent.com` URLs already whitelisted — keep them as defaults.

**Revalidation.** The `homepage-content` global already fires `revalidateStorefront('homepage')` on `afterChange`, and `payload.ts` tags homepage fetches with `['homepage']`. No new webhook needed — confirm edits appear within the revalidate window.

---

## Sub Tasks

### CMS — extend `homepage-content` global (`apps/cms/src/globals/HomepageContent.ts`)
- [ ] Add a **`heroSlides`** array field (replaces the single hero scalar concept): `badge` (text, req), `title` (text, req), `subtitle` (textarea), `ctaLabel` (text), `ctaHref` (text), `image` (upload → media, req), `order` (number). This drives the hero carousel.
- [ ] Add **`heroEditorPickImage`** (upload → media) next to the existing `heroEditorPickTitle` / `heroEditorPickLink`.
- [ ] Add a **`trustBadges`** array: `icon` (select: `truck` | `returns` | `lock` | `cod`), `label` (text, req), `sub` (text), `order` (number).
- [ ] Add a **`priceBuckets`** array: `label` (text, req), `href` (text, req), `dark` (checkbox), `order` (number); plus `shopByPriceHeading` (text).
- [ ] Add **section-heading** text fields: `bestsellersTitle`, `bestsellersSubtitle`, `bestsellersViewAllLabel`, `bestsellersViewAllHref`; `newArrivalsTitle`, `newArrivalsSubtitle`, `newArrivalsViewAllLabel`, `newArrivalsViewAllHref`; `collectionsHeading`, `collectionsSubtitle`; `categoryEyebrow`, `categoryHeading`, `categorySubtitle`; `journalEyebrow`, `journalHeading`, `journalSubtitle`.
- [ ] Add `admin.description` to each new field so editors understand what it controls.
- [ ] Keep the field config under the 150-line limit — if `HomepageContent.ts` grows too large, split field groups into `apps/cms/src/globals/fields/*.ts` and compose (per `harness/claude.md` file-size rule).
- [ ] Run `pnpm --filter cms generate:types` (or the project's payload type-gen) to regenerate `packages/types/src/payload-types.ts`.

### CMS — cleanup
- [ ] Delete the orphaned `apps/cms/src/globals/homepage.ts` (slug `homepage`) — it is **not** registered in `payload.config.ts` and is dead code. Confirm nothing imports it before removing.

### Storefront — fetch layer (`apps/storefront/src/lib/payload.ts`)
- [ ] Extend the internal `HomepageGlobalDoc` interface with all new fields (typed, no `any`).
- [ ] Add `DEFAULT_HERO_SLIDES` (port the 3 objects from `HERO_SLIDES`), `DEFAULT_TRUST_BADGES`, `DEFAULT_PRICE_BUCKETS`, `DEFAULT_EDITOR_PICK_IMAGE`, and default section-heading constants — these are the "unedited" fallbacks.
- [ ] Add `getHeroSlides(): Promise<HeroSlide[]>` — map CMS `heroSlides` (sorted by `order`, image via `resolveMediaUrl`, drop slides with no image), fall back to `DEFAULT_HERO_SLIDES` when empty/error.
- [ ] Update `getHeroContent()` to also return `editorPickImageUrl` (CMS `heroEditorPickImage` → fallback `DEFAULT_EDITOR_PICK_IMAGE`). Keep existing fields.
- [ ] Add `getTrustBadges()`, `getPriceBuckets()` (+ heading), and `getHomepageSectionCopy()` (returns the bestsellers/new-arrivals/collections/category/journal heading bundle) — each with fallback.
- [ ] Export new TS interfaces (`HeroSlide`, `TrustBadge`, `PriceBucket`, `HomepageSectionCopy`) from `payload.ts`. Reuse the existing `OfferCardItem`/`HeroContent` style.
- [ ] All new fetchers wrapped in try/catch returning the default (match existing resilience pattern) so a Payload outage never blanks the homepage.

### Storefront — wire the page (`apps/storefront/src/app/page.tsx`)
- [ ] Add the new fetchers to the existing `Promise.all` concurrent block.
- [ ] Pass `slides` to the hero, `editorPickImageUrl` into `HeroSection`, and the section-copy bundle into the relevant components.
- [ ] Replace the hardcoded Bestsellers / New Arrivals string props (lines 80-94) with values from `getHomepageSectionCopy()`.

### Storefront — components
- [ ] `HeroSection.tsx` — accept `slides` + `editorPickImageUrl` props; pass `slides` into `<HeroCarousel slides={slides} />` (both desktop + mobile); use `editorPickImageUrl` for the `<Image src>` (remove the `EDITOR_PICK_IMAGE` constant).
- [ ] `HeroCarousel.tsx` — keep `HERO_SLIDES` only as the optional default if you prefer, but the canonical default now lives in `payload.ts`; `slides` is supplied by the server. Keep all carousel interactivity unchanged.
- [ ] `TrustStrip.tsx` — accept `badges: TrustBadge[]` prop; build an `icon` string → Lucide component map; render label + sub from props.
- [ ] `ShopByPrice.tsx` — accept `buckets` + `heading` props; render dynamically (preserve the `dark` styling and `data-testid` derivation).
- [ ] `CollectionsGrid.tsx` — accept optional `heading` / `subtitle` props (default to current strings) for the section title.
- [ ] `CategorySection.tsx` — accept optional `eyebrow` / `heading` / `subtitle` props (default to current strings).
- [ ] `BlogPreview.tsx` — accept optional `eyebrow` / `heading` / `subtitle` props (default to current strings).
- [ ] Keep every component a Server Component unless it already uses `"use client"`; pass data top-down (no prop drilling > 2 levels — bundle section copy into one object if needed).

### Seed (so dev/live aren't blank after migration)
- [ ] Add/extend a Payload seed script (pattern: `apps/cms/src/scripts/seed-offer-cards.ts`) to populate `homepage-content` with the current static values (hero slides, trust badges, price buckets, section headings) so existing environments render identically post-deploy. Seeding is optional for correctness (defaults cover it) but recommended so editors see editable starting content.

### Verification
- [ ] `pnpm lint` — zero new errors.
- [ ] `pnpm type-check` — zero new errors (strict, no `any`).
- [ ] `pnpm build` — succeeds; no RSC boundary violations, no `next/image` host errors.
- [ ] Manual: with an empty/unseeded `homepage-content`, the homepage looks **identical to today**.
- [ ] Manual: edit each field in Payload Admin → confirm it appears on `/` after revalidation.
- [ ] Update/extend unit tests for the touched components (`TrustStrip`, `ShopByPrice`, `HeroSection`, `BlogPreview`, `CollectionsGrid`) to cover the default-fallback path and the CMS-provided path.

---

## Acceptance Criteria
- [ ] With **no** CMS edits (empty global), every homepage section renders **exactly** the content it renders today (hero slides, editor-pick image, trust badges, price buckets, all section headings).
- [ ] Editing **hero slides** in Payload changes the homepage hero carousel (badge, title, subtitle, CTA, image) live.
- [ ] The hero is genuinely CMS-driven — the previously-discarded `getHeroContent()` fields are now either rendered or intentionally removed; no fetched-but-ignored hero fields remain.
- [ ] Editing the **Editor's Pick image** in Payload updates the desktop hero right panel.
- [ ] Editing **trust badges** (label/sub/icon) in Payload updates the trust strip; icon selection maps to the correct Lucide glyph.
- [ ] Editing **price buckets** and the "Shop by Price" heading in Payload updates that section; `dark` styling still works.
- [ ] Editing **Bestsellers / New Arrivals** titles, subtitles, and "View All" label/href in Payload updates those sections.
- [ ] Editing the **Collections**, **Category**, and **Journal** section headings/eyebrows/subtitles in Payload updates them.
- [ ] Sections already driven by live data (marquee, category tiles, collection tiles, offer carousel, product cards, blog cards, brand philosophy) are **unchanged** — no regressions.
- [ ] A Payload outage or empty field never blanks or crashes the homepage — defaults render.
- [ ] `packages/types/src/payload-types.ts` regenerated; no duplicated/hand-written homepage types.
- [ ] The orphaned `globals/homepage.ts` is removed (or a note explains why it must stay).
- [ ] `pnpm lint`, `pnpm type-check`, `pnpm build` all pass from repo root with zero new errors.

---

## Technical Notes
- **Fallback semantics:** treat empty string, `null`, and empty array from Payload as "not edited" → use the static default. This is what makes "unedited CMS == current site" true.
- **Hero is the highest-value item:** the visible hero today is the static `HeroCarousel` (`HERO_SLIDES`), NOT the `getHeroContent()` data — which is fetched and thrown away. Modelling hero as a `heroSlides` **array** matches the existing 3-slide carousel better than the legacy single-hero scalar fields. Decide whether to keep the legacy `heroHeadline`/`heroSubtext`/etc. scalar fields (for a possible single-hero layout) or retire them; if retired, remove them from `HomepageGlobalDoc` and `getHeroContent()` too so nothing is fetched-but-unused.
- **Trust strip icons:** store a constrained `select` (`truck`/`returns`/`lock`/`cod`), map to `Truck`/`RotateCcw`/`Lock`/`Banknote` in the component. Don't try to store React components.
- **richText caveat:** `brandPhilosophyBody` is a Payload `richText` field but `HomepageGlobalDoc` types it as `string` and `BrandPhilosophy.tsx` renders it directly. That section is out of scope (already "working"), but if you touch the global's types, do **not** regress it — leave its handling as-is.
- **File-size rule:** `HomepageContent.ts` will exceed 150 lines with all new fields — split field groups into `apps/cms/src/globals/fields/` and compose, per `harness/claude.md`.
- **No new global:** add fields to `homepage-content`; the second global `homepage` is dead and should be deleted, not extended.
- **Revalidation already wired:** `revalidateStorefront('homepage')` on `afterChange` + `tags: ['homepage']` on fetch. Verify, don't rebuild.
- **next/image hosts:** confirm `images.remotePatterns` covers the CloudFront host (CMS uploads) — existing CMS imagery renders, so this should already be set; verify to avoid a build/runtime image error.

---

## Files to Create/Modify
```
apps/cms/src/globals/HomepageContent.ts                       (modify — add heroSlides, heroEditorPickImage, trustBadges, priceBuckets, section-copy fields)
apps/cms/src/globals/fields/*.ts                              (optional create — split field groups if file exceeds 150 lines)
apps/cms/src/globals/homepage.ts                              (delete — orphaned legacy global, not registered)
apps/cms/src/scripts/seed-homepage-content.ts                 (create — seed current static values into the global)
packages/types/src/payload-types.ts                           (regenerate — payload generate:types)
apps/storefront/src/lib/payload.ts                            (modify — DEFAULT_* constants, getHeroSlides, extend getHeroContent, getTrustBadges, getPriceBuckets, getHomepageSectionCopy, new interfaces, extend HomepageGlobalDoc)
apps/storefront/src/app/page.tsx                              (modify — fetch + pass new props; replace hardcoded Bestsellers/New Arrivals props)
apps/storefront/src/components/home/HeroSection.tsx           (modify — slides + editorPickImageUrl props; remove EDITOR_PICK_IMAGE)
apps/storefront/src/components/home/HeroCarousel.tsx          (modify — consume slides prop; default sourced from payload.ts)
apps/storefront/src/components/home/TrustStrip.tsx            (modify — badges prop + icon map)
apps/storefront/src/components/home/ShopByPrice.tsx           (modify — buckets + heading props)
apps/storefront/src/components/home/CollectionsGrid.tsx       (modify — optional heading/subtitle props)
apps/storefront/src/components/home/CategorySection.tsx       (modify — optional eyebrow/heading/subtitle props)
apps/storefront/src/components/home/BlogPreview.tsx           (modify — optional eyebrow/heading/subtitle props)
apps/storefront/src/components/home/*.test.tsx                (modify — cover default + CMS-provided paths)
```

---

## API Endpoints
- `GET /api/globals/homepage-content?depth=1` (Payload) — storefront: now returns `heroSlides`, `heroEditorPickImage`, `trustBadges`, `priceBuckets`, and the section-copy text fields, in addition to existing hero/marquee/offer/brand-philosophy fields.
- `POST /api/revalidate` (storefront) — already triggered by the global's `afterChange` hook; no change.

---

## UI Screens
- Payload Admin → Globals → "Homepage Content" — new field groups: Hero Slides (array), Editor's Pick image, Trust Badges (array), Shop by Price (array + heading), Section Headings (Bestsellers / New Arrivals / Collections / Category / Journal).
- Storefront `/` — Hero carousel, Editor's Pick panel, Trust strip, Shop by Price, and all section headings now reflect CMS content (or defaults when unedited).

---

## Related Test Cases
- Unit: `apps/storefront/src/components/home/TC-0XX-HeroSection.test.tsx` — renders CMS slides; falls back to defaults when slides empty.
- Unit: `TC-0XX-TrustStrip.test.tsx` — renders CMS badges + correct icon mapping; default fallback.
- Unit: `TC-0XX-ShopByPrice.test.tsx` — renders CMS buckets + heading; default fallback; `dark` styling.
- Unit: extend `BlogPreview` / `CollectionsGrid` / `CategorySection` tests — CMS heading vs. default.
- E2E: empty global → homepage matches baseline; edit each field → reflected on `/` after revalidate.

## Dependencies
- **Blocked by:** None (independent of TASK-184, but both touch `page.tsx` and `payload.ts` — coordinate merges; TASK-184 makes category tiles + offer cards dynamic, this task makes the remaining copy/hero/trust/price dynamic).
- **Blocks:** None.
- **Note:** Do the CMS field additions + type-gen first, then the storefront fetch layer, then component wiring — the storefront depends on the regenerated types.

---

## Claude Code Context
```
harness/claude.md
harness/tasks/178 — Revamping — Client Feedback/TASK-185 — Revamping · Homepage Full CMS Content · Full-Stack.md
harness/tasks/178 — Revamping — Client Feedback/TASK-184 — Revamping · Category & Collection Images · Full-Stack.md
apps/storefront/src/app/page.tsx
apps/storefront/src/lib/payload.ts
apps/storefront/src/components/home/HeroSection.tsx
apps/storefront/src/components/home/HeroCarousel.tsx
apps/storefront/src/components/home/TrustStrip.tsx
apps/storefront/src/components/home/ShopByPrice.tsx
apps/storefront/src/components/home/CollectionsGrid.tsx
apps/storefront/src/components/home/CategorySection.tsx
apps/storefront/src/components/home/BlogPreview.tsx
apps/cms/src/globals/HomepageContent.ts
apps/cms/src/payload.config.ts
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-05-25 | Task created. Client requested that all homepage content be CMS-editable with current static values as fallback. Audited every home section: marquee, category tiles, collection tiles, offer carousel, product cards, blog cards, and brand philosophy are already dynamic (out of scope). In scope: hero carousel slides (`HERO_SLIDES`), editor-pick image, trust badges, shop-by-price buckets + heading, and the static section headings for Bestsellers/New Arrivals/Collections/Category/Journal. Also flagged that `getHeroContent()` fetches hero fields that `HeroSection` currently discards, and that the legacy `globals/homepage.ts` is dead code. |
| 2026-05-25 | Implemented. CMS: split `HomepageContent` fields into `globals/fields/*` modules (per 150-line rule) and added `heroSlides`, `heroEditorPickImage`, `trustBadges`, `priceBuckets` + `shopByPriceHeading`, and all section-copy fields; deleted orphaned `globals/homepage.ts`. Storefront: extended `payload.ts` with `getHeroSlides`, `getTrustBadges`, `getShopByPrice`, `getHomepageSectionCopy`, added `editorPickImageUrl` to `getHeroContent`, and `DEFAULT_*` fallbacks preserving current static text. Wired `page.tsx` + components (`HeroSection`/`HeroCarousel` slides, `TrustStrip` badges+icon map, `ShopByPrice` buckets+heading, optional heading props on `CollectionsGrid`/`CategorySection`/`BlogPreview`). Decision: kept legacy single-hero scalar fields (avoids breaking the 28-test schema spec + a schema migration); storefront simply no longer renders them. Verify: storefront `pnpm build` ✓, storefront + CMS lint = 0 errors, touched files add 0 type errors, CMS `homepage-content` jest 28/28 ✓, HeroSection/CollectionsGrid/FeaturedProducts/BrandPhilosophy tests ✓. Pre-existing unrelated failures (confirmed on baseline via git stash): MarqueeBar empty-state, BlogPreview slug-link, payload.test getPosts/getPostBySlug, and repo-wide `JSX` namespace type errors. Remaining: optional `seed-homepage-content.ts` (defaults already cover fallback) and manual CMS edit-through QA. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|

---

## Review Notes
- **—**
