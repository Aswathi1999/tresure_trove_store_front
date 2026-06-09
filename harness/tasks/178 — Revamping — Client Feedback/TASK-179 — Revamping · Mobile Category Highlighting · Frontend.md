# TASK-179: Revamping · Mobile Category Highlighting · Frontend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Done |
| **Priority** | High |
| **Sprint** | Sprint 2 — Revamping |
| **Story Points** | — |
| **PRD Reference** | Client Feedback #2 |
| **Architecture Ref** | — |
| **Start Date** | 2026-05-12 |
| **Due Date** | — |
| **Created** | 2026-05-12 |
| **Completed** | 2026-05-12 |

---

## Description
On mobile, the "Shop by Category" section is buried too low in the page and lacks the visual prominence needed for furniture ecommerce. Client feedback requires it to be elevated to a prime position — visible immediately on homepage load and at the top of the sidebar/menu — with improved visual hierarchy, clearer typography, accessible touch targets, and a more engaging card-based or chip-based layout. The goal is to make category navigation the fastest path for mobile users to discover products.

---

## Sub Tasks
- [ ] Audit current mobile rendering of `CategorySection.tsx` and `MobileSidebar.tsx` — document current position, spacing, and visual weight
- [ ] Redesign `CategorySection.tsx` for mobile — implement a horizontally scrollable row of category cards with icon or image, bold label, and a subtle active/hover state; ensure each tap target is at minimum 44×44px
- [ ] Move `CategorySection` above `FeaturedProducts` and `CollectionsGrid` in `apps/storefront/src/app/page.tsx` on mobile breakpoints (use `lg:order-*` Tailwind utilities or conditional rendering) so it appears immediately after the hero
- [ ] Update `MobileSidebar.tsx` — add a "Shop by Category" section at the top of the sidebar above all other nav links, using the same card/chip design as the homepage section
- [ ] Improve visual hierarchy: use a distinct section heading (`text-xs font-bold tracking-widest uppercase text-[var(--color-tt-orange)]`) and sufficient vertical spacing to distinguish the section from surrounding content
- [ ] Ensure all category items link to `/collections/[handle]` using Next.js `<Link>` — no `<a>` tags with hard-coded hrefs
- [ ] Add `data-testid="category-section"` and `data-testid="category-item-[handle]"` attributes for test targeting
- [ ] Verify tap targets, contrast ratios, and keyboard navigability meet WCAG 2.1 AA on mobile

---

## Acceptance Criteria
- [ ] On mobile (< 1024px), the "Shop by Category" section is the first content section below the hero on the homepage
- [ ] Category cards/chips are horizontally scrollable on small screens with no layout overflow or clipping
- [ ] Each category card shows a label and links correctly to `/collections/[handle]`
- [ ] The same category list appears at the top of `MobileSidebar` above all nav links
- [ ] Touch targets are at minimum 44×44px on all category items
- [ ] Section heading is visually distinct — uses the Treasure Trove brand orange or gold token, not a plain grey label
- [ ] No hardcoded hex values — all colours use Tailwind design token variables (`var(--color-tt-*)`)
- [ ] No `<img>` tags — use `next/image` if any category images are shown
- [ ] Desktop layout is unchanged — changes are mobile-first, hidden or reordered at `lg:` breakpoint
- [ ] TypeScript strict mode — no `any` types introduced
- [ ] Passes lint and type-check with zero new errors

---

## Technical Notes
- Use `overflow-x-auto` with `flex gap-3` and `snap-x snap-mandatory` for a swipeable card row
- Category data currently comes from Medusa collections via `getCollections()` in `medusa.ts` — no new API calls needed
- Apply `scrollbar-hide` utility (or equivalent) to suppress the horizontal scrollbar on WebKit
- The `MobileSidebar.tsx` uses a slide-in drawer — inject the category list before the existing `<nav>` links
- Design reference: use card style consistent with `CollectionsGrid.tsx` but smaller and horizontally laid out

---

## Files to Create/Modify
```
apps/storefront/src/components/home/CategorySection.tsx         (modify — mobile card layout)
apps/storefront/src/components/layout/MobileSidebar.tsx         (modify — category list at top)
apps/storefront/src/app/page.tsx                                (modify — reorder sections on mobile)
```

---

## API Endpoints
- `GET /store/collections` (Medusa) — already used; no new endpoints needed

---

## UI Screens
- Homepage (mobile) — CategorySection at top, below hero
- Mobile sidebar — categories listed first
- Homepage (desktop) — no visual change

---

## Related Test Cases
- Unit: `apps/storefront/src/components/home/TC-023-CollectionsGrid.test.tsx` — review for overlap
- E2E: `e2e/homepage/TC-015-homepage.spec.ts` — add mobile category visibility assertion

## Dependencies
- **Blocked by:** None
- **Blocks:** None

---

## Claude Code Context
```
harness/claude.md
harness/tasks/178 — Revamping — Client Feedback/TASK-179 — Revamping · Mobile Category Highlighting · Frontend.md
harness/architecture.md
harness/docs/design-tokens.md
apps/storefront/src/components/home/CategorySection.tsx
apps/storefront/src/components/layout/MobileSidebar.tsx
apps/storefront/src/app/page.tsx
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-05-12 | Completed. Three files changed: (1) `CategorySection.tsx` — added `data-testid="category-section"` on section, added orange eyebrow label ("Browse") above heading, desktop layout unchanged, replaced 4×2 mobile grid with horizontally scrollable chip row using `overflow-x-auto snap-x snap-mandatory` with 76×76px image tiles (above 44px minimum), `[&::-webkit-scrollbar]:hidden [scrollbar-width:none]` to suppress scrollbar, testids unified to `category-item-${id}` on both mobile and desktop. (2) `MobileSidebar.tsx` — replaced all 3 hardcoded hex values (`#F1E6DD`, `#B45A3C`, `#E2C3B0`) with design tokens (`var(--color-tt-surface-container-high)`, `var(--color-tt-orange)`), changed "SHOP BY CATEGORY" heading from ink to orange token, added `handle` field to categoryItems array, added `data-testid="category-item-${handle}"` to all 8 sidebar category links. (3) `page.tsx` — conditional rendering: CategorySection shown in `lg:hidden` div immediately after HeroSection (mobile), and in `hidden lg:block` div after MarqueeBar (desktop); desktop order fully preserved. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-05-12 | 0.5 | Implementation session with Claude Code |

---

## Review Notes
- **—**
