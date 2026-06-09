# TASK-074: Storefront · Journal (Blog) · Frontend

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
| **Start Date** | 2026-04-24 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-24 |

---

## Description
Build all Journal (Blog) UI screens for the Treasure Trove storefront using mock Payload CMS data. This includes the blog listing page (grid of post cards), the full post detail page with Lexical rich text rendering, author and date display, CloudFront cover images via `next/image`, and a related posts section. No real API calls — use mock data from `payload.mock.ts` that will be replaced in TASK-076.

---

## Sub Tasks
- [x] Create mock data file `apps/storefront/src/lib/payload.mock.ts` with sample blog posts (title, slug, coverImage, author, publishedAt, content, relatedPosts)
- [x] Build `PostCard.tsx` — card component with cover image, title, author, date, and excerpt
- [x] Build `apps/storefront/src/app/journal/page.tsx` — blog listing page with a responsive grid of `PostCard` components
- [x] Build `RichTextRenderer.tsx` — renders Payload Lexical rich text nodes (headings, paragraphs, bold, italic, links, images)
- [x] Build `PostDetail.tsx` — full post layout with hero cover image, title, author, published date, and rich text body via `RichTextRenderer`
- [x] Build `RelatedPosts.tsx` — horizontal strip of 2–3 related `PostCard` components below the post body
- [x] Build `apps/storefront/src/app/journal/[slug]/page.tsx` — wires `PostDetail` and `RelatedPosts` with mock data
- [x] Implement Post Not Found 404 state (custom UI within `[slug]/page.tsx` using `notFound()`)
- [x] Add `data-testid` attributes to all interactive and content elements
- [x] Ensure all images use `next/image` with placeholder CloudFront domain

---

## Acceptance Criteria
- [x] Blog listing page renders a responsive grid of post cards (1-col mobile, 2-col tablet, 3-col desktop)
- [x] Each `PostCard` shows cover image, post title, author name, publish date, and a short excerpt
- [x] Clicking a post card navigates to `/journal/[slug]`
- [x] Post detail page renders the full Lexical rich text body without raw JSON leaking into the DOM
- [x] `RichTextRenderer` correctly renders: headings (h1–h4), paragraphs, bold, italic, inline links, and block images
- [x] Cover image is rendered with `next/image` at correct aspect ratio (16:9) with alt text
- [x] Author name and formatted publish date are displayed beneath the post title
- [x] `RelatedPosts` section renders 2–3 related post cards below the article body
- [x] Post Not Found state calls `notFound()` and renders an appropriate 404 UI
- [x] All screens are mobile-first and use Tailwind CSS v4 utility classes only
- [x] No `<img>` tags — all images use `next/image`
- [x] All interactive elements have `data-testid` attributes
- [x] No real API calls — all data sourced from `payload.mock.ts`

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/storefront/src/app/journal/page.tsx
apps/storefront/src/app/journal/[slug]/page.tsx
apps/storefront/src/components/journal/PostCard.tsx
apps/storefront/src/components/journal/PostDetail.tsx
apps/storefront/src/components/journal/RichTextRenderer.tsx
apps/storefront/src/components/journal/RelatedPosts.tsx
apps/storefront/src/lib/payload.mock.ts
```

---

## API Endpoints
N/A — this task has no API endpoints

---

## UI Screens
- Blog Listing Page (grid of posts)
- Blog Post Detail (rich text content)
- Related Posts section
- Post Not Found 404 (edge case)

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-076, TASK-077

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Journal (Blog)/TASK-074 — Storefront · Journal (Blog) · Frontend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-24 | Task completed. Extended payload.mock.ts with 6 full blog posts + Lexical rich-text types. Built PostCard, PostDetail, RichTextRenderer (h2/h3/h4, paragraphs, bold/italic, links, lists, blockquotes, images), RelatedPosts, journal/page.tsx listing grid, journal/[slug]/page.tsx with notFound() guard. All data-testids in place, no real API calls. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
