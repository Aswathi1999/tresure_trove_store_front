# TASK-090: Storefront · Static Pages · Frontend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Lijina-p |
| **Status** | ✅ Done |
| **Priority** | — |
| **Sprint** | Sprint 1 |
| **Story Points** | — |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-04-27 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-27 |

---

## Description
Build all Static Pages screens for the Storefront (Next.js 15). This includes the About / Our Story page, Craftsmanship Process page (illustrated steps), Contact page with a validated form, and a custom branded 404 Not Found page. All pages are statically rendered. The contact form must use React Hook Form + Zod for validation and display inline error states and a loading state during submission — no real API calls yet, use a mock submit function that will be replaced in TASK-092.

---

## Sub Tasks
- [x] Build About / Our Story page (`/about`) — brand narrative, mission statement, team section, `next/image` for team or brand photography
- [x] Build Craftsmanship Process page (`/craftsmanship`) — illustrated step-by-step process with icons or images, Framer Motion scroll reveal animations per step
- [x] Build ContactForm component with React Hook Form + Zod schema (name: required, email: required valid email, message: required min 20 chars)
- [x] Build Contact page (`/contact`) with ContactForm, inline field-level error messages, loading spinner on submit, success state after mock submission
- [x] Build custom 404 Not Found page (`app/not-found.tsx`) — branded design with Treasure Trove identity, CTA to return to homepage or browse products
- [x] Add mock contact form submit function that simulates a 1s delay and resolves successfully
- [x] Add Framer Motion page entry animations to About and Craftsmanship pages (fade-in, slide-up)
- [x] Add `data-testid` attributes to all interactive and key display elements across all pages
- [x] Ensure all images use `next/image` — no `<img>` tags
- [x] Verify all pages export `export const dynamic = 'force-static'` (static rendering)

---

## Acceptance Criteria
- [x] About page (`/about`) renders brand story, mission, and team section with no console errors
- [x] Craftsmanship Process page (`/craftsmanship`) renders at least 4 illustrated steps with Framer Motion scroll animations firing correctly on scroll
- [x] Contact page (`/contact`) renders ContactForm with name, email, and message fields
- [x] ContactForm validates on submit: name required, email must be valid format, message minimum 20 characters — inline error messages display below each field
- [x] ContactForm shows a loading spinner and disables the submit button during the mock async submission
- [x] ContactForm shows a success state (e.g., confirmation message) after successful mock submission
- [x] Custom 404 page (`/not-found`) renders branded content with a link back to the homepage and does not show the default Next.js 404 UI
- [x] All pages are statically rendered — no server-side data fetching, no API calls
- [x] All images use `next/image` — no `<img>` tags
- [x] All interactive elements have `data-testid` attributes
- [x] All pages are mobile-first and responsive using Tailwind CSS v4 utility classes
- [x] No `"use client"` directive on page files — ContactForm is a client component but must be imported into a Server Component page

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/storefront/src/app/about/page.tsx
apps/storefront/src/app/craftsmanship/page.tsx
apps/storefront/src/app/contact/page.tsx
apps/storefront/src/app/not-found.tsx
apps/storefront/src/components/contact/ContactForm.tsx
```

---

## API Endpoints
N/A — this task has no API endpoints

---

## UI Screens
- **About / Our Story Page** (`/about`) — brand story, mission, team section
- **Craftsmanship Process Page** (`/craftsmanship`) — illustrated step-by-step process with Framer Motion scroll reveals
- **Contact Page** (`/contact`) — contact form with validation, loading state, success state
- **404 Not Found Page** — custom branded page with CTA to homepage

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-092 (Integration Testing), TASK-093 (Frontend Unit Tests)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Static Pages/TASK-090 — Storefront · Static Pages · Frontend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-27 | Task completed. Built About page (/about) with light hero, 3 alternating 50/50 image+text sections, stats strip, and newsletter editorial band — matched to harness/ui/about-page/screen.png. Built Craftsmanship page (/craftsmanship) with 4 scroll-reveal steps using SectionReveal (Framer Motion). Built ContactForm (RHF + Zod) with 5 fields (name, email, phone, subject, message), bottom-border input style, 1s mock submit, loading spinner, and success state — matched to harness/ui/contact-page/screen.png. Built Contact page with light hero, form+info card grid, 4 info cards (visit/call/email/chat) with gold left border on primary card, and full-width map section. Built custom 404 not-found.tsx. All pages force-static, all images use next/image, all data-testids in place. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
