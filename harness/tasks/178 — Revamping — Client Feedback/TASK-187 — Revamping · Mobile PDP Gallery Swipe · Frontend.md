# TASK-187: Revamping · Mobile PDP Hero Gallery Swipe (Scroll-Snap) · Frontend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Done |
| **Priority** | Medium |
| **Sprint** | Sprint 2 — Revamping |
| **Story Points** | 3 |
| **PRD Reference** | Client Feedback — Product page hero image switching feels clunky on mobile |
| **Architecture Ref** | harness/architecture.md |
| **Start Date** | 2026-06-05 |
| **Due Date** | — |
| **Created** | 2026-06-05 |
| **Completed** | 2026-06-05 |

---

## Description

On the product detail page (`apps/storefront/src/app/products/[handle]/page.tsx`), when a product has more than one image the hero gallery (`apps/storefront/src/components/pdp/ImageGallery.tsx`) lets the shopper switch between images. On **desktop** this works well: a vertical thumbnail strip on the left (lines 78–95) plus a cursor-zoom main image with a framer-motion crossfade (lines 98–136).

On **mobile**, the experience is poor. The thumbnail strip is `hidden lg:flex`, so it does not render below `lg`. The **only** way to change the hero image on a touch device is to tap the small dot indicators (`lg:hidden absolute bottom-4 left-1/2 …`, lines 139–149), each of which calls `selectImage(idx)` and triggers a `mode="wait"` crossfade. There is **no swipe / drag / horizontal-scroll gesture** — which is the natural, expected interaction on mobile. Tapping a 6px dot to page through photos feels clunky and unresponsive.

**Goal:** add a smooth, native-feeling **horizontal swipe (scroll-snap) carousel** for the hero image on mobile **without changing the desktop layout or breaking any existing behaviour**. Swiping left/right pages between images with momentum; the dot indicators stay and reflect the current slide; tapping a dot smooth-scrolls to that image.

This is a **mobile-only, frontend-only** change scoped to `ImageGallery.tsx`. The desktop thumbnail + zoom path, the variant→image switching, and the existing test contract must all continue to work unchanged.

---

## Current Behaviour (analysis — read before coding)

`ImageGallery.tsx` is a single client component rendering three regions inside one root flex container (`data-testid="image-gallery"`, line 75):

| Region | Lines | Visibility | Role |
|--------|-------|-----------|------|
| Vertical thumbnail strip | 78–95 | `hidden lg:flex` (desktop only) | Click a thumb → `selectImage(idx)` |
| Main image (zoom + animation) | 98–136 | always (`data-testid="main-image"`) | Shows `displayImage`; cursor-zoom; framer-motion slide/fade keyed on `displayImage.id` |
| Mobile dot indicators | 139–149 | `lg:hidden` (mobile only) | Tap a dot → `selectImage(idx)` |

State and sync that **must keep working**:
- `activeIndex` / `direction` — current image + animation direction (lines 20–21).
- `selectImage(idx)` (lines 47–51) — sets direction, `activeIndex`, and `userPicked = true`.
- **Variant→image override** (lines 27–45): `VariantSelector` resolves a per-variant image and pushes it into `PdpImageContext` (`setOverrideUrl`, `VariantSelector.tsx:150–153`). The `useEffect` here reacts only to a real `overrideUrl` change (not manual picks), clears `userPicked`, finds the matching thumbnail by URL, and moves `activeIndex` to it.
- **Out-of-gallery override** (lines 64–72): when the variant's image URL is not present in `images[]`, `showingOutOfGalleryOverride` is true and the main image shows that URL directly (no thumbnail match).

### Problems to fix
1. **No swipe gesture on mobile** — only dot taps change the image (the core complaint).
2. **Latent layout bug:** the dot indicators are `absolute bottom-4 …` but the root container (line 75) is **not** `relative`, and the dots are a *sibling* of the `relative` main-image div — so on mobile they position against the nearest positioned ancestor rather than being pinned to the image. Fix this as part of the mobile work (wrap mobile slides + dots in a `relative` container).

---

## Design / Approach

**Use a native CSS scroll-snap track for mobile; leave the desktop path untouched.**

- Add a **mobile-only** horizontal track: `flex overflow-x-auto snap-x snap-mandatory` with each image as a `snap-center w-full shrink-0` slide. Native momentum scrolling gives a smooth swipe with zero gesture JS. Hide it on desktop (`lg:hidden`); hide the existing desktop main-image block on mobile (`hidden lg:flex` / `hidden lg:block`) so only one is interactive per breakpoint.
- **Keep the desktop block exactly as-is** — vertical thumbnails, the `main-image` zoom container, framer-motion. Do **not** apply scroll-snap or remove zoom on desktop.
- **Track the active slide** with an `IntersectionObserver` (preferred — robust) or a throttled `onScroll` handler computing `Math.round(scrollLeft / slideWidth)`. On change, update `activeIndex` so the **dots stay in sync**. A user swipe should behave like a manual pick (set `userPicked = true`) so a stale override doesn't snap it back.
- **Dots stay and become the scroll control:** tapping `dot-${i}` calls a handler that sets `activeIndex` **and** smooth-scrolls the track to slide `i` (`track.scrollTo({ left: i * width, behavior: 'smooth' })`). Keep the `dot-${i}` testids and keep the handler updating `activeIndex` directly so the jsdom tests (no real scrolling) still pass.
- **Variant switch must scroll the track:** extend the existing override `useEffect` (lines 34–45) so that, after it sets `activeIndex`, it also programmatically scrolls the mobile track to the matched slide. Guard against scroll⇄observer feedback loops with a "last programmatic target" ref so the observer doesn't fight the effect.
- **Out-of-gallery override on mobile:** preserve current behaviour. Simplest correct option: when `showingOutOfGalleryOverride` is true, render the override image as a single full-width slide (or render the existing single-image fallback in place of the track). Document the chosen option in the PR. Do **not** silently drop the override image on mobile.
- **Guard browser-only APIs** (`scrollTo`, `IntersectionObserver`) so they no-op safely in jsdom/SSR — `el?.scrollTo?.(…)`, feature-detect `IntersectionObserver`. The component is already `'use client'`.
- **Respect `prefers-reduced-motion`** — skip smooth-scroll easing (use `behavior: 'auto'`) when the user requests reduced motion.

**Why scroll-snap over a JS/framer drag carousel:** native scrolling is smoother on low-end devices, doesn't fight vertical page scroll, needs no extra dependency, and leaves the desktop zoom/animation path completely untouched — satisfying "without breaking the current structure."

---

## Sub Tasks

- [ ] In `ImageGallery.tsx`, add a **mobile-only scroll-snap track** (`lg:hidden`) rendering every image in `images[]` as a `snap-center w-full shrink-0` slide using `next/image` (`object-contain`, `priority` on the first slide only). Wrap the track **and** the dot indicators in a single `relative` container so the dots pin correctly (fixes the latent `absolute` positioning bug).
- [ ] Make the existing desktop main-image + zoom block **`hidden lg:flex`/`lg:block`** so it does not also render interactively on mobile (keep its `data-testid="main-image"` and all zoom/framer logic intact for desktop and for the existing tests).
- [ ] Add a `trackRef` to the mobile track and a `slideWidth`/active-slide detector via `IntersectionObserver` (preferred) or throttled `onScroll`; update `activeIndex` on swipe and set `userPicked = true` for a user-initiated swipe.
- [ ] Update the dot handler so tapping `dot-${i}` sets `activeIndex` **and** smooth-scrolls the track to slide `i` (guarded `scrollTo`, `behavior` respects `prefers-reduced-motion`). Keep the `dot-${i}` `data-testid`s and keep state updating synchronously so unit tests pass.
- [ ] Extend the variant-override `useEffect` (lines 34–45) so that after it sets `activeIndex` to the matched thumbnail it also scrolls the mobile track to that slide; add a "last programmatic scroll target" ref to prevent observer↔effect feedback loops.
- [ ] Handle the **out-of-gallery override** on mobile (variant image not in `images[]`): render it as a transient full-width slide (or swap the track for the single-image fallback). Preserve the desktop `showingOutOfGalleryOverride` behaviour unchanged.
- [ ] Feature-detect / SSR-guard `IntersectionObserver` and `Element.scrollTo` so the component is safe in jsdom and during server render.
- [ ] Add `aria-label`/`role="group"` to slides and `role="region"` (aria-label "Product images") to the track; ensure dots remain real `<button>`s with accessible labels (e.g. `aria-label="View image N"`).
- [ ] Keep `ImageGallery.tsx` within the repo file-size rule (≤150 lines of logic per `harness/claude.md`); if it grows past, extract the mobile track into a small sibling component (e.g. `MobileImageCarousel.tsx`) that shares `activeIndex`/`images` via props — without changing the public `ImageGallery` API or its testids.
- [ ] Manual QA on a real/emulated touch device: swipe pages images with momentum; dots track the slide; tapping a dot scrolls; switching a variant scrolls the carousel to the variant's image; out-of-stock/override images still appear.

---

## Acceptance Criteria

- [ ] On a touch device (viewport `< lg`), the shopper can **swipe horizontally** to move between hero images, with native momentum and snap-to-image — no dot tap required.
- [ ] The dot indicators still render, **highlight the currently visible slide**, and tapping a dot smooth-scrolls the carousel to that image.
- [ ] Switching a product **variant** (colour/size/etc.) that maps to a specific image scrolls the mobile carousel to that image (parity with the existing desktop override behaviour).
- [ ] A variant image **not** present in the product's image list still displays on mobile (out-of-gallery override is not lost).
- [ ] **Desktop is visually and behaviourally unchanged**: vertical thumbnail strip, cursor-zoom, and framer-motion transition all work exactly as before; no scroll-snap or horizontal track appears at `lg+`.
- [ ] No layout regression from the dot-positioning fix — dots are pinned to the bottom-centre of the mobile image.
- [ ] Existing `ImageGallery.test.tsx` passes **unchanged** (testids `image-gallery`, `main-image`, `thumbnail-${i}`, `dot-${i}`; dot-click and thumbnail-click still swap the active image; alt-text fallback still works).
- [ ] No console errors in jsdom/SSR from `scrollTo` / `IntersectionObserver` (properly guarded).
- [ ] `prefers-reduced-motion` is respected (no smooth-scroll animation when requested).
- [ ] `pnpm lint`, `pnpm type-check`, and `pnpm build` pass with zero new errors — TypeScript strict, no `any`, `next/image` only.

---

## Technical Notes

- **Single source of truth for the active slide:** both the desktop main image and the mobile track must derive from the same `activeIndex` so the dots, desktop animation, and override sync stay consistent and the existing tests (which read `data-testid="main-image"` in jsdom, ignoring CSS visibility) keep passing. Dot/thumbnail clicks must continue to update `activeIndex` **synchronously** — the scroll is an additional side effect, not the source of truth.
- **Feedback-loop guard:** the override `useEffect` scrolls the track → the IntersectionObserver fires → it would call `setActiveIndex` again. Store the last programmatically-scrolled index in a ref and ignore observer callbacks that match it, or debounce, to avoid a render loop / fighting scroll.
- **jsdom caveats:** `Element.prototype.scrollTo` is not implemented and `IntersectionObserver` is undefined in the test environment. Guard both (`track?.scrollTo?.(…)`, `if (typeof IntersectionObserver !== 'undefined')`) so unit tests don't throw. Do **not** add observer-driven assertions to the existing test file unless you also polyfill it.
- **Image sizing:** reuse the existing `aspect-[4/5] max-h-[70vh]` shape for the mobile slides so the carousel occupies the same space the single main image does today (no layout shift).
- **No new dependency:** implement with CSS scroll-snap + a small amount of `useRef`/`useEffect`. Do not add a carousel library; framer-motion stays only on the desktop path.
- **Keep `'use client'`** — the component is already client-side; all new logic is client-only.
- The mobile dots currently live at `ImageGallery.tsx:139–149`; moving them inside the new `relative` mobile wrapper is expected and is the intended fix for the latent `absolute` positioning bug.

---

## Files to Create/Modify

```
apps/storefront/src/components/pdp/ImageGallery.tsx            ← MODIFY  (add mobile scroll-snap track + active-slide sync; gate desktop block to lg; fix dot positioning)
apps/storefront/src/components/pdp/MobileImageCarousel.tsx     ← CREATE (optional — only if ImageGallery exceeds the file-size limit; shares activeIndex/images via props)
apps/storefront/src/components/pdp/ImageGallery.test.tsx       ← MODIFY (optional — add mobile-track render + dot-sync coverage; existing cases must remain green)
```

> No backend, server-action, or data-layer changes. `page.tsx`, `PdpImageContext.tsx`, and `VariantSelector.tsx` are **not** modified — the override contract between them is consumed as-is.

---

## Related Test Cases

- Unit (existing, must stay green): `apps/storefront/src/components/pdp/ImageGallery.test.tsx` — gallery/main-image render, thumbnail-click and dot-click image swap, alt-text fallback.
- Unit (new, optional): mobile track renders one slide per image; tapping a dot updates `activeIndex`/highlighted dot; out-of-gallery override renders on mobile.
- Manual / E2E (mobile viewport): swipe-to-page with momentum; dot follows the visible slide; variant switch scrolls the carousel; desktop unaffected at `lg+`.

---

## Dependencies
- **Blocked by:** None
- **Blocks:** None
- **Related:** PDP gallery + variant-image switching introduced alongside the Product Detail Page work (TASK-026 / TASK-029). This task only refines the mobile interaction; it does not alter the variant→image data flow.

---

## Claude Code Context
```
harness/claude.md
harness/tasks/178 — Revamping — Client Feedback/TASK-187 — Revamping · Mobile PDP Gallery Swipe · Frontend.md
apps/storefront/src/components/pdp/ImageGallery.tsx
apps/storefront/src/components/pdp/ImageGallery.test.tsx
apps/storefront/src/components/pdp/PdpImageContext.tsx
apps/storefront/src/components/pdp/VariantSelector.tsx
apps/storefront/src/app/products/[handle]/page.tsx
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-06-05 | Task created. Client reported that switching between multiple hero images on the product page is clunky on mobile (dot-tap only, no swipe). Scoped a mobile-only CSS scroll-snap carousel for `ImageGallery.tsx` that adds horizontal swipe + keeps the dots in sync, while leaving the desktop thumbnail/zoom path and the variant→image override untouched. Also flagged a latent bug: the mobile dots are `absolute` without a `relative` ancestor and need re-parenting. |
| 2026-06-05 | **Implemented.** Extracted `MobileImageCarousel.tsx` (new) — a `lg:hidden` native scroll-snap track (`overflow-x-auto snap-x snap-mandatory`, one `snap-center w-full` slide per image) with rAF-throttled `onScroll` active-slide detection and a `prefers-reduced-motion`-aware `scrollTo` that scrolls the track when `activeIndex` changes from a dot tap or a variant switch (guarded against the scroll⇄state feedback loop, and against jsdom/SSR where `scrollTo`/`clientWidth` are absent). The dot indicators moved into this component's `relative` wrapper (fixes the latent `absolute`-without-`relative` bug) and keep their `dot-${i}` testids. `ImageGallery.tsx`: gated the desktop main-image/zoom block to `hidden lg:block` and rendered `<MobileImageCarousel>` below `lg`, passing the out-of-gallery override URL through as an overlay so variant-only images still show on mobile. Desktop thumbnail strip, cursor-zoom, framer-motion transition, and the `PdpImageContext` variant→image override are unchanged. **Verification:** `ImageGallery.test.tsx` 10/10 pass unchanged; added `MobileImageCarousel.test.tsx` 6/6 pass; `tsc --noEmit` clean; ESLint 0 errors on changed files; `next build` succeeds (PDP route compiled). Pre-existing, unrelated test failures elsewhere (cart-wrapper + `useRouter` app-router env issues in auth/cart/checkout/home suites) were confirmed to fail independently of this change. **Pending:** on-device swipe QA (couldn't be exercised in jsdom — needs a real/emulated touch device per the last sub-task). |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|

---

## Review Notes
- **—**
