# TASK-182: Revamping · Footer Enhancement · Frontend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Done |
| **Priority** | Medium |
| **Sprint** | Sprint 2 — Revamping |
| **Story Points** | — |
| **PRD Reference** | Client Feedback #5 |
| **Architecture Ref** | — |
| **Start Date** | 2026-05-12 |
| **Due Date** | — |
| **Created** | 2026-05-12 |
| **Completed** | 2026-05-12 |

---

## Description
The current footer design is visually plain and does not reflect the premium, editorial aesthetic of Treasure Trove Atelier. A full redesign is required to create a modern, structured, and visually engaging footer that improves brand trust, aids navigation, and maintains responsiveness across all breakpoints. The redesigned footer should include a brand column (logo, brand tagline, social links), navigation columns (Shop, Journal, Company), a newsletter subscription block, legal links, and a bottom bar with copyright and payment method icons. All spacing, typography, and colour must align with the existing design token system.

---

## Sub Tasks
- [ ] Audit the current `Footer.tsx` — document all existing links, content, and layout shortcomings
- [ ] Design and implement a multi-column footer layout for desktop (4 columns: Brand | Shop | Journal | Company) using CSS Grid or Flexbox with Tailwind; collapse to single-column stack on mobile
- [ ] **Brand column** — Treasure Trove logo (SVG or text lockup), a one-line brand tagline (e.g. "Crafted for Living"), and social icon links (Instagram, Pinterest, WhatsApp) using Lucide icons or SVGs; each icon links to the correct social URL
- [ ] **Shop column** — links to: All Products (`/products`), Collections (`/collections`), New Arrivals (`/products?order=-created_at`), Sale / Offers
- [ ] **Journal column** — links to: Journal (`/journal`), Materials (`/materials`), Craftsmanship (`/craftsmanship`)
- [ ] **Company column** — links to: About Us (`/about`), Contact (`/contact`), Careers (placeholder), Privacy Policy, Terms of Service
- [ ] **Newsletter block** — above the column grid or inline, a compact email subscription input with a CTA button; wires to `NewsletterForm.tsx` (already exists or create); validate email format client-side before submit
- [ ] **Bottom bar** — a full-width strip with: copyright notice ("© 2026 Treasure Trove Atelier. All rights reserved."), payment method icons (Visa, Mastercard, Razorpay, UPI), and a "Made in India" badge
- [ ] Apply a consistent dark background (`var(--color-tt-ink)` or `var(--color-tt-surface-container)`) with light text — matching the brand's editorial palette
- [ ] Ensure footer is not rendered behind the mobile `BottomTabBar` — add `pb-16 lg:pb-0` to the footer or `BottomTabBar` clearance
- [ ] Add `data-testid="footer"`, `data-testid="footer-newsletter"`, `data-testid="footer-bottom-bar"` for test targeting
- [ ] Verify all links use Next.js `<Link>` — no raw `<a>` tags for internal navigation

---

## Acceptance Criteria
- [ ] Footer renders a 4-column grid on desktop (`lg:`) and single-column stack on mobile
- [ ] All 4 columns (Brand, Shop, Journal, Company) are present with correct links
- [ ] Brand column shows logo/wordmark and tagline
- [ ] Social icon links are present and open in new tab (`target="_blank" rel="noopener noreferrer"`)
- [ ] Newsletter input accepts an email, validates format, and shows a success/error state on submit
- [ ] Bottom bar shows copyright text, payment icons, and spans full footer width
- [ ] Footer background uses a design token colour — no hardcoded hex values
- [ ] Footer text is legible on the dark background — contrast ratio meets WCAG AA (4.5:1 minimum)
- [ ] On mobile, footer content is fully visible above the `BottomTabBar` — no content clipped
- [ ] All internal links use Next.js `<Link>` — external links open in new tab
- [ ] No `<img>` tags — any payment icons use SVG or Lucide
- [ ] TypeScript strict mode — no `any` types
- [ ] Passes lint and type-check with zero new errors

---

## Technical Notes
- `NewsletterForm.tsx` already exists at `apps/storefront/src/components/layout/NewsletterForm.tsx` — integrate it into the footer rather than duplicating
- Social icons: use `lucide-react` (`Instagram`, `Globe`) or inline SVGs for Pinterest/WhatsApp which may not be in Lucide
- Payment icons can be inline SVG badges (Visa, MC, UPI, Razorpay) — source from the public domain SVG sets; place in `public/icons/`
- Avoid very large footer height — aim for max `480px` on desktop, collapsing gracefully on mobile
- The `BottomTabBar` sits fixed at the bottom on mobile — add `mb-16 lg:mb-0` to the footer's last child to prevent overlap

---

## Files to Create/Modify
```
apps/storefront/src/components/layout/Footer.tsx                (modify — full redesign)
apps/storefront/src/components/layout/NewsletterForm.tsx        (verify/integrate — email subscription)
apps/storefront/src/app/layout.tsx                              (verify — Footer rendered correctly)
public/icons/                                                   (add — payment method SVG icons if needed)
```

---

## API Endpoints
- `POST /store/newsletter` — if newsletter subscription is wired to a Medusa or third-party endpoint (otherwise handle with a toast/UI mock for now)

---

## UI Screens
- Footer — desktop (4-column grid)
- Footer — mobile (stacked single column)
- Footer — bottom bar (copyright + payment icons)

---

## Related Test Cases
- E2E: `e2e/static/static-pages.spec.ts` — add footer link assertions
- E2E: `e2e/homepage/TC-015-homepage.spec.ts` — verify footer visibility

## Dependencies
- **Blocked by:** None
- **Blocks:** None

---

## Claude Code Context
```
harness/claude.md
harness/tasks/178 — Revamping — Client Feedback/TASK-182 — Revamping · Footer Enhancement · Frontend.md
harness/architecture.md
harness/docs/design-tokens.md
apps/storefront/src/components/layout/Footer.tsx
apps/storefront/src/components/layout/NewsletterForm.tsx
apps/storefront/src/components/layout/BottomTabBar.tsx
apps/storefront/src/app/layout.tsx
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-05-12 | Completed. Two files rewritten: (1) `NewsletterForm.tsx` — added `useState` for `email`, `error`, `submitted`; added `isValidEmail()` regex validation; `handleSubmit` now validates before accepting — shows per-field error message (`text-[var(--color-tt-orange)]`) on invalid input, shows gold success state with `<CheckCircle>` icon when valid email submitted; desktop variant updated to side-by-side `[input][SUBSCRIBE]` layout with gold button; mobile variant unchanged layout but same validation; both variants use `noValidate` to suppress browser native validation in favour of custom. (2) `Footer.tsx` — full rewrite: background changed from `var(--color-tt-rose)` → `var(--color-tt-ink)` (dark luxury); newsletter strip added at top (full-width, with eyebrow "Stay Inspired", headline, and `NewsletterForm variant="desktop"`); 4-column grid: Brand (2/5 col span, round gold-bordered logo, tagline, 3 social icons) + `FooterColumn` for Shop / Journal / Company; `SOCIAL` array uses Lucide `Instagram` and inline `WhatsAppIcon` / `PinterestIcon` SVG components (Pinterest/WhatsApp not available in Lucide); bottom bar has `data-testid="footer-bottom-bar"`, copyright text, and 4 styled payment method badges (`VISA`, `MC`, `UPI`, `RAZORPAY`) as bordered text spans; `pb-20 lg:pb-0` on bottom bar clears the `h-14` fixed `BottomTabBar` on mobile; `data-testid="footer"` on `<footer>`, `data-testid="footer-newsletter"` on newsletter strip; all social external links use `target="_blank" rel="noopener noreferrer"`; all internal links use Next.js `<Link>`; no hardcoded hex values; reusable `FooterColumn` component keeps column code DRY. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-05-12 | 1.0 | Full redesign + newsletter form update with Claude Code |

---

## Review Notes
- **—**
