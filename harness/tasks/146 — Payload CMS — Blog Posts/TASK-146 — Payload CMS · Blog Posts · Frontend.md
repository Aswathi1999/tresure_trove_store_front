# TASK-146: Payload CMS · Blog Posts · Frontend

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
| **Start Date** | 2026-04-28 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-28 |

---

## Description
Build the storefront blog listing page and blog post detail page that display Payload CMS blog post content to customers. Use mock Payload REST API responses — no live Payload API calls yet. The listing page shows a grid of post cards (cover image, title, excerpt, published date). The detail page renders the full Lexical rich text body, cover image via CloudFront, and a related posts section. All pages use Next.js ISR with `export const revalidate`.

---

## Sub Tasks
- [x] Create mock Payload REST responses for blog listing and single post in `apps/storefront/src/lib/payload.mock.ts`
- [x] Build `PostCard` component — cover image (next/image), title, excerpt, published date, slug link
- [x] Build blog listing page `apps/storefront/src/app/journal/page.tsx` — ISR, grid of PostCards
- [x] Build blog post detail page `apps/storefront/src/app/journal/[slug]/page.tsx` — ISR, full post content
- [x] Build `RichTextRenderer` component to render Lexical JSON output as HTML/React nodes
- [x] Build `RelatedPosts` component — display up to 3 related posts by tag or recency
- [x] Add `data-testid` attributes to all interactive and key display elements
- [x] Validate all images use `next/image` with the CloudFront domain
- [x] Ensure pages are mobile-first and responsive using Tailwind CSS v4

---

## Acceptance Criteria
- [x] Blog listing page renders a responsive grid of `PostCard` components from mock data
- [x] Each `PostCard` displays cover image (via `next/image`), post title, excerpt (max 2 lines truncated), and formatted published date
- [x] Clicking a `PostCard` navigates to `/journal/[slug]`
- [x] Blog post detail page renders cover image full-width, post title, published date, and Lexical rich text body
- [x] `RichTextRenderer` correctly renders headings, paragraphs, bold, italic, links, and block quotes from Lexical JSON
- [x] `RelatedPosts` section shows up to 3 posts below the article body
- [x] Listing page exports `export const revalidate = 3600`
- [x] Detail page exports `export const revalidate = 3600` and uses `generateStaticParams` with mock slugs
- [x] `notFound()` is called when a slug does not match any mock post
- [x] All cover images use `next/image` with remote patterns configured in `next.config.ts`
- [x] No `"use client"` on page components — pages are Server Components
- [x] All key elements have `data-testid` attributes

---

## Technical Notes
- All files were already implemented and verified complete on 2026-04-28.
- `payload.mock.ts` exports: `getAllBlogSlugs`, `getBlogPostBySlug`, `getRelatedBlogPosts`, `MockBlogPostFull`, `LexicalContent` and related Lexical types.
- `RichTextRenderer` handles: bold/italic (bitmask), h2/h3/h4, paragraphs, blockquotes, ordered/unordered lists, links, upload/image nodes.
- Pages use `revalidate = 3600`, `generateStaticParams`, and `notFound()` correctly.
- All images use `next/image` with `fill` and `sizes` prop. `next.config.ts` allows `cdn.treasuretrove.in` and `lh3.googleusercontent.com` (mock images).
- `PostDetail` includes author avatar (initials), author name + role, publish date, read time, category badge, and gradient overlay on hero image.

---

## Files to Create/Modify
```
apps/storefront/src/app/journal/page.tsx                    ← exists ✓
apps/storefront/src/app/journal/[slug]/page.tsx             ← exists ✓
apps/storefront/src/components/journal/PostCard.tsx         ← exists ✓
apps/storefront/src/components/journal/PostDetail.tsx       ← exists ✓
apps/storefront/src/components/journal/RichTextRenderer.tsx ← exists ✓
apps/storefront/src/components/journal/RelatedPosts.tsx     ← exists ✓
apps/storefront/src/lib/payload.mock.ts                     ← exists ✓
```

---

## API Endpoints
N/A — this task uses mock data only; real Payload REST wiring happens in TASK-148

---

## UI Screens
- **Route:** `/journal` — blog listing page
- **Route:** `/journal/[slug]` — blog post detail page

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-148 (Integration Testing), TASK-149 (Frontend Unit Tests)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Payload CMS — Blog Posts/TASK-146 — Payload CMS · Blog Posts · Frontend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-28 | Verified complete. All 7 files already implemented: journal listing page (`/journal`), post detail page (`/journal/[slug]`), PostCard, PostDetail, RichTextRenderer, RelatedPosts, and mock data in payload.mock.ts. Pages are Server Components with ISR, generateStaticParams, notFound(), data-testid attributes, and next/image throughout. Available slugs: the-art-of-handcrafted-brass, the-teak-story, styling-your-outdoor-space, monsoon-home-refresh, rattan-revival, bedroom-sanctuary-guide. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-28 | 0.25 | Verification pass — all files already built |

---

## Review Notes
- **—**
