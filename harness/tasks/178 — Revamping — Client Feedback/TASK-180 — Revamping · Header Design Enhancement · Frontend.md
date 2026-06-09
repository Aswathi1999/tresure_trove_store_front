# TASK-180: Revamping · Header Design Enhancement · Frontend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Done |
| **Priority** | High |
| **Sprint** | Sprint 2 — Revamping |
| **Story Points** | — |
| **PRD Reference** | Client Feedback #3 |
| **Architecture Ref** | — |
| **Start Date** | 2026-05-12 |
| **Due Date** | — |
| **Created** | 2026-05-12 |
| **Completed** | 2026-05-12 |

---

## Description
The existing header is a light/white multi-row layout that lacks visual identity and brand presence. A **complete redesign** is required — replacing it with a dark luxury header (`var(--color-tt-ink)` background) that is immediately distinctive, modern, and aligned with Treasure Trove Atelier's premium positioning.

The new header is a single-row compact design on desktop: Logo (left, white pill) | Category nav links (center) | Action icons (right: Search, Account, Wishlist, Cart). An offer strip sits above and collapses on scroll. On scroll-down, the header hides; on scroll-up, the compact dark bar re-appears — no floating "island" pill mode.

Mobile header is redesigned to match: dark single row with Hamburger | centered Logo | Search + Cart icons. The separate search pill below the header is removed entirely.

Blog link is **removed from the header** and added to the Footer's Shop column instead (moved to Footer.tsx).

---

## Revised Scope (updated v2 — light theme + round logo)

- **Light theme** — main header bar is white/light (`bg-white`), not dark. Offer strip stays dark (gold on ink) for strong top contrast.
- **Round logo** — logo wrapped in a gold-bordered circle (`rounded-full border-2 border-[var(--color-tt-gold)]`) on both desktop and mobile.
- **Single-row desktop nav** — Logo (left, round) | 8 category links (center, dark ink → gold + underline hover) | 4 action icons (right, muted → ink hover)
- **Scroll behaviour** — offer strip collapses on scroll; main bar gains a soft shadow; scroll-down hides; scroll-up reveals compact bar
- **Remove island/pill mode** — simplified two-state: visible vs hidden
- **Remove Blog link from header** — already moved to footer
- **Mobile: remove search pill** — search icon opens full-screen overlay
- **Offer strip** — collapses smoothly via CSS `max-h-0` transition

---

## Sub Tasks
- [x] Update TASK-180.md scope to reflect complete redesign and blog-to-footer move
- [ ] Rewrite `Navbar.tsx` — dark single-row desktop header, simplified scroll behavior, no Blog link
- [ ] Rewrite `MobileHeader.tsx` — dark single row (hamburger | logo | search + cart), remove search pill
- [ ] Update `Footer.tsx` — add Journal link to the Shop column
- [ ] Verify page top-padding offsets still work with the new header heights
- [ ] Add `data-testid="navbar"` and `data-testid="mobile-header"`

---

## Acceptance Criteria
- [ ] Main header bar is light/white — not dark. Offer strip is dark (ink bg, gold text) for strong top contrast
- [ ] Logo is round (`rounded-full`) with a gold border (`border-2 border-[var(--color-tt-gold)]`) on both desktop and mobile
- [ ] Desktop: single row — round Logo | 8 category links (center, dark ink, gold + underline on hover) | 4 icons (right, muted ink → ink on hover)
- [ ] Offer strip collapses smoothly on scroll via CSS transition (no JS height calculation)
- [ ] On scroll-down (> 200px): header hides; on scroll-up: reappears without offer strip, with subtle shadow
- [ ] Mobile: single light bar — Hamburger (left) | round Logo (absolute centre) | Search + Cart (right)
- [ ] Mobile search pill removed — search icon triggers full-screen overlay
- [ ] Blog/Journal link NOT in header nav — present in footer Shop column
- [ ] Nav links: `text-[11px] font-bold tracking-[0.2em]` with gold underline slide-in on hover
- [ ] Icon hover: `text-[var(--color-tt-ink)]` (not gold — icon hover is ink, link hover is gold)
- [ ] Main bar has `border-b border-[var(--color-tt-outline-variant)]` always visible; `shadow-md` added on scroll
- [ ] No hardcoded hex values
- [ ] `data-testid="navbar"` and `data-testid="mobile-header"` present
- [ ] TypeScript strict mode — no `any` types
- [ ] No regressions — cart, search overlay, wishlist, account links all functional

---

## Technical Notes
- Simplify scroll state machine: `scrolled: boolean` (scrollY > 60) + `hidden: boolean` (scrolling down past 200px)
- The offer strip collapses via `max-h-0 overflow-hidden` transition — no JS height calculation needed
- Mobile logo centering: use `absolute left-1/2 -translate-x-1/2` inside a `relative` bar — requires left and right icon groups to be symmetric in width
- `useCartStore` imported in MobileHeader for the cart count badge on the cart icon
- Keep the full-screen search overlay logic unchanged — just trigger it from the icon now instead of the search pill

---

## Files to Create/Modify
```
apps/storefront/src/components/layout/Navbar.tsx          (full rewrite — dark single-row header)
apps/storefront/src/components/layout/MobileHeader.tsx    (full rewrite — dark compact header, no search pill)
apps/storefront/src/components/layout/Footer.tsx          (modify — add Journal link to shopLinks)
```

---

## API Endpoints
N/A — purely frontend component redesign.

---

## UI Screens
- Desktop header — initial load (dark bar + offer strip)
- Desktop header — after scroll-up (dark bar, no offer strip, slight blur)
- Desktop header — scroll-down (hidden)
- Mobile header — all pages (dark single row)

---

## Related Test Cases
- E2E: `e2e/homepage/TC-015-homepage.spec.ts` — update assertions for dark header

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-182 (Footer Enhancement) — Journal link added here as part of blog move

---

## Claude Code Context
```
harness/claude.md
harness/tasks/178 — Revamping — Client Feedback/TASK-180 — Revamping · Header Design Enhancement · Frontend.md
harness/architecture.md
harness/docs/design-tokens.md
apps/storefront/src/components/layout/Navbar.tsx
apps/storefront/src/components/layout/MobileHeader.tsx
apps/storefront/src/components/layout/Footer.tsx
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-05-12 | Task scope revised: complete dark luxury header redesign, not minor alignment fix. Blog link moved from header to footer. |
| 2026-05-12 | Completed. Three files changed: (1) `Navbar.tsx` — full rewrite: replaced white 3-row header with a dark luxury single-row design. Offer strip (`var(--color-tt-ink)` bg, gold text) sits above and collapses via `max-h-0 overflow-hidden` CSS transition on scroll. Main bar is 64px, `var(--color-tt-ink)` background, single row: Logo (white pill, left) | 8 category nav links (center, `justify-center`, `text-[10px] tracking-[0.18em]`, gold hover + slide-in underline) | Search + Account + Wishlist + Cart icons (right, `text-white/60` → gold hover). Scroll behavior simplified: `scrolled` boolean (y > 60) + `hidden` boolean (scrolling down past 200px). Removed the island/pill floating mode entirely. Blog link removed from nav. (2) `MobileHeader.tsx` — full rewrite: dark single row (36px offer strip + 52px main bar = 88px total). Logo absolutely centred with `left-1/2 -translate-x-1/2`. Left: Hamburger icon. Right: Search icon + Cart icon with count badge. Search pill below header completely removed — search opens full-screen overlay from the icon. Imported `useCartStore` for live cart count badge. (3) `Footer.tsx` — added Journal link to `shopLinks` array (positioned between Bestsellers and About Us). |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-05-12 | 0.75 | Scope revision + full implementation with Claude Code |

---

## Review Notes
- **—**
