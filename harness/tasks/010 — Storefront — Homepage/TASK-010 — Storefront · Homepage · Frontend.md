# TASK-010: Storefront · Homepage · Frontend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | athulgopal-adviciya |
| **Status** | ✅ Done |
| **Priority** | High |
| **Sprint** | Sprint 1 |
| **Story Points** | 8 |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-04-21 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-21 |

---

## Description
Build all homepage sections for the Treasure Trove storefront using Next.js 15 SSR with mock data. This includes the full-bleed hero section, marquee announcement bar, collections grid, featured products carousel, blog preview cards, and brand philosophy section. Framer Motion v11 is used for scroll-reveal animations on section entrances. No real Medusa SDK or Payload REST calls — use mock functions in `apps/storefront/src/lib/medusa.mock.ts` and `apps/storefront/src/lib/payload.mock.ts` that will be replaced in TASK-012.

---

## Sub Tasks
- [x] Mock Medusa data functions (getFeaturedProducts, getCollections)
- [x] Mock Payload data functions (getHeroContent, getMarqueeText, getBlogPreviews, getBrandPhilosophy)
- [x] Homepage root page (`app/page.tsx`) composing all sections as Server Components
- [x] HeroSection component with full-bleed image, headline, subtext, and CTA button
- [x] MarqueeBar component with horizontally scrolling announcement text
- [x] CollectionsGrid component displaying collection cards in a responsive grid
- [x] FeaturedProducts component with horizontal scroll or grid of product cards
- [x] BlogPreview component with 3 latest post cards (image, title, excerpt, date)
- [x] BrandPhilosophy section with editorial text and supporting image
- [x] Products load error edge case (empty/error state for featured products)
- [x] CMS content unavailable edge case (fallback UI when hero/marquee data is missing)
- [x] Navbar with full/island/hidden scroll modes (desktop + mobile)
- [x] MobileHeader with offer strip, cycling search placeholder, full-screen search overlay
- [x] MobileSidebar drawer with active route state and all 8 categories
- [x] BottomTabBar with active state and cart badge
- [x] Footer (desktop 5-col + mobile stacked) with NewsletterForm client component
- [x] HeroCarousel (3-slide auto-advance with ken-burns transition)
- [x] OfferCarousel (6-card auto-scroll)
- [x] TrustStrip, CategorySection, ShopByPrice sections
- [x] tt-* CSS animation system (scroll-driven reveals, stagger, lift, zoom, cycle-word)

---

## Acceptance Criteria
- [x] Homepage renders all six sections in correct visual order: Hero → Marquee → Collections → Featured Products → Blog Preview → Brand Philosophy
- [x] HeroSection displays a full-bleed CloudFront image via `next/image`, headline, subtext, and a "Shop Now" CTA link
- [x] MarqueeBar continuously scrolls announcement text horizontally using CSS animation; pauses on hover
- [x] CollectionsGrid renders at least 4 collection cards in a responsive CSS grid (1 col mobile, 2 col tablet, 4 col desktop)
- [x] FeaturedProducts renders product cards with image, name, price, and an "Add to Cart" placeholder button (no cart logic yet)
- [x] BlogPreview renders 3 post cards each with a cover image, title, excerpt, publish date, and a "Read More" link
- [x] BrandPhilosophy renders editorial copy and an accompanying image with correct aspect ratio
- [x] Framer Motion scroll-reveal animations trigger on viewport entry for CollectionsGrid, FeaturedProducts, and BlogPreview sections
- [x] Products load error state renders a graceful message: "Could not load products — please refresh"
- [x] CMS content unavailable state renders a static fallback hero with brand name and default CTA
- [x] All images use `next/image` with `sizes` and `priority` correctly set on the hero image
- [x] All interactive elements have `data-testid` attributes
- [x] Page is a Server Component; only animation wrapper components use `"use client"`
- [x] Layout is mobile-first and fully responsive using Tailwind CSS v4 utility classes

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/storefront/src/app/page.tsx                              (modified)
apps/storefront/src/app/layout.tsx                            (modified — Navbar + Footer wired in)
apps/storefront/src/app/globals.css                           (modified — tt-* animation system added)
apps/storefront/src/lib/medusa.mock.ts                        (created)
apps/storefront/src/lib/payload.mock.ts                       (created)
apps/storefront/src/components/home/HeroSection.tsx           (created)
apps/storefront/src/components/home/HeroCarousel.tsx          (created)
apps/storefront/src/components/home/MarqueeBar.tsx            (created)
apps/storefront/src/components/home/TrustStrip.tsx            (created)
apps/storefront/src/components/home/CategorySection.tsx       (created)
apps/storefront/src/components/home/CollectionsGrid.tsx       (created)
apps/storefront/src/components/home/OfferCarousel.tsx         (created)
apps/storefront/src/components/home/FeaturedProducts.tsx      (created)
apps/storefront/src/components/home/ShopByPrice.tsx           (created)
apps/storefront/src/components/home/BlogPreview.tsx           (created)
apps/storefront/src/components/home/BrandPhilosophy.tsx       (created)
apps/storefront/src/components/layout/Navbar.tsx              (rewritten)
apps/storefront/src/components/layout/MobileHeader.tsx        (rewritten)
apps/storefront/src/components/layout/MobileSidebar.tsx       (rewritten)
apps/storefront/src/components/layout/BottomTabBar.tsx        (created)
apps/storefront/src/components/layout/Footer.tsx              (modified)
apps/storefront/src/components/layout/NewsletterForm.tsx      (created)
apps/storefront/src/components/layout/CyclingPlaceholder.tsx  (created)
apps/storefront/src/components/layout/SectionReveal.tsx       (created)
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
- **Blocks:** TASK-012, TASK-013

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Homepage/TASK-010 — Storefront · Homepage · Frontend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-21 | Task started. Built all homepage sections with mock data: HeroSection, MarqueeBar, TrustStrip, CategorySection, CollectionsGrid, OfferCarousel, FeaturedProducts (Bestsellers + New Arrivals), ShopByPrice, BlogPreview, BrandPhilosophy. Wired page.tsx as async Server Component with concurrent data fetching. |
| 2026-04-21 | Ported design and animations from client-review prototype: HeroCarousel (3-slide auto-advance + ken-burns), full Navbar scroll modes (full/island/hidden), MobileHeader with cycling offer strip and full-screen search overlay, MobileSidebar Framer Motion drawer with active route state, BottomTabBar with cart badge. |
| 2026-04-21 | Added tt-* CSS animation system to globals.css: scroll-driven reveals (animation-timeline: view()), stagger children, lift + zoom-hover, cycling text, prefers-reduced-motion disable. Extracted NewsletterForm as client component to resolve RSC event handler build error. Type check passes clean. Task complete. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-21 | 4 | TASK-010 full implementation — homepage sections, layout components, animations |

---

## Review Notes
- All 14 acceptance criteria met
- 24 files created or modified
- Type check passes with zero errors on storefront
- Build succeeds — no RSC boundary violations
- Scroll-driven animations use native CSS `animation-timeline: view()` with `tt-fallback-fade` for older browsers
- Design aligned with client-review prototype from `frontend-design code/`
