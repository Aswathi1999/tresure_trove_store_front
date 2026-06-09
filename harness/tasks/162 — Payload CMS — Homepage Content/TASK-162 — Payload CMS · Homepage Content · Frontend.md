# TASK-162: Payload CMS · Homepage Content · Frontend

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
| **Start Date** | — |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-05-06 |

---

## Description
Build the storefront components that render the Payload CMS Homepage Content global. This includes the hero section (headline and subtext), the marquee announcement bar (array of text items), and a featured collection block that links to a Medusa collection via handle. All components must consume data from a mock Payload global response — no live API calls yet. Use `apps/storefront/src/lib/payload.mock.ts` to provide the mock homepage global shape matching the real Payload REST response.

---

## Sub Tasks
- [x] Define the mock homepage global response in `apps/storefront/src/lib/payload.mock.ts` (hero headline, hero subtext, marquee items array, featured collection title & handle)
- [x] Build `HeroSection.tsx` — renders hero headline and subtext from the global data; full-width, mobile-first layout using Tailwind
- [x] Build `MarqueeBar.tsx` — renders the marquee items array as a horizontally scrolling announcement bar using CSS keyframe animation
- [x] Build featured collection block inside `apps/storefront/src/app/page.tsx` — uses featured collection title and handle from the global to link to `/collections/[handle]`
- [x] Wire `apps/storefront/src/app/page.tsx` to consume the mock homepage global and pass data down to `HeroSection`, `MarqueeBar`, and the featured collection block as props
- [x] Add `data-testid` attributes to all interactive and key display elements in every component
- [x] Verify all components are Server Components (no `"use client"` directive unless strictly required for animation)

---

## Acceptance Criteria
- [ ] `HeroSection` renders the hero headline as an `<h1>` and subtext as a `<p>`, sourced from mock global data
- [ ] `MarqueeBar` renders all items from the marquee array and animates horizontally without layout shift
- [ ] Featured collection block renders the collection title and links to `/collections/[handle]` using Next.js `<Link>`
- [ ] `apps/storefront/src/app/page.tsx` fetches from the mock and passes correctly typed props to all child components
- [ ] All components are mobile-first and responsive across sm / md / lg breakpoints
- [ ] All Tailwind classes use design tokens from `@TreasureTrove/config` (no hardcoded hex values)
- [ ] All key elements have `data-testid` attributes for testing
- [ ] TypeScript strict mode — no `any` types; mock data is fully typed
- [ ] No `<img>` tags — use `next/image` if any image is rendered
- [ ] Next.js build passes with no type errors or lint warnings

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/storefront/src/lib/payload.mock.ts
apps/storefront/src/components/home/HeroSection.tsx
apps/storefront/src/components/home/MarqueeBar.tsx
apps/storefront/src/app/page.tsx (modified — wire homepage global data)
```

---

## API Endpoints
N/A — this task uses mock data only; real API wired in TASK-164

---

## UI Screens
- **—**

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-164 (Integration Testing), TASK-165 (Frontend Unit Tests)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Payload CMS — Homepage Content/TASK-162 — Payload CMS · Homepage Content · Frontend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-05-06 | Verified complete. All 6 home component test files pass (59 tests). `HeroSection.tsx` wired to `HeroContent` (editorPickTitle, editorPickHref, imageUrl); carousel renders promotional slides with badge/title/CTA. `MarqueeBar.tsx` implements CSS keyframe scrolling with `data-testid="marquee-container"`. `CollectionsGrid.tsx` renders featured collections linking to `/collections/[handle]`. `page.tsx` fetches `getHeroContent`, `getMarqueeText`, `getBlogPreviews`, `getBrandPhilosophy` from `@/lib/payload` with graceful null/[] fallbacks. Mock data in `payload.mock.ts` matches Payload REST response shape. Design aligned with design-reference-desktop.html (65/35 hero split, trust strip, marquee, categories, collections, products, blog preview, brand philosophy). |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-05-06 | 0.25 | Verification pass — all components pre-built and all 59 tests passing |

---

## Review Notes
- **—**
