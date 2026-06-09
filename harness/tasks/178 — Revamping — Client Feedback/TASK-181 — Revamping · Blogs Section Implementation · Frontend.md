# TASK-181: Revamping · Blogs Section Implementation · Frontend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Done |
| **Priority** | Medium |
| **Sprint** | Sprint 2 — Revamping |
| **Story Points** | — |
| **PRD Reference** | Client Feedback #4 |
| **Architecture Ref** | — |
| **Start Date** | 2026-05-12 |
| **Due Date** | — |
| **Created** | 2026-05-12 |
| **Completed** | 2026-05-12 |

---

## Description
Introduce a fully functional dedicated Blogs section to the storefront. This includes a blog listing page at `/journal` (already partially scaffolded) and individual blog detail pages at `/journal/[slug]`. Both pages must consume live data from the Payload CMS Blog Posts collection via the existing `getPosts()` and `getPostBySlug()` fetchers in `apps/storefront/src/lib/payload.ts`. The blog design must align with the Treasure Trove brand — editorial, luxury, and clean — with consistent typography, imagery, and spacing. The section should improve content engagement and make the journal a key part of the storefront experience. Blog post links from the homepage `BlogPreview` component must also be corrected (they currently point to `/blog/[slug]` instead of `/journal/[slug]`).

---

## Sub Tasks
- [ ] Audit `apps/storefront/src/app/journal/page.tsx` — verify it fetches live blog posts from Payload via `getPosts()`, renders `PostCard` components in a responsive grid, and handles empty state gracefully
- [ ] Audit `apps/storefront/src/app/journal/[slug]/page.tsx` — verify it fetches the post via `getPostBySlug()`, renders `PostDetail` component, handles 404 via `notFound()`, and sets correct ISR revalidation (`export const revalidate = 1800`)
- [ ] Implement `PostCard.tsx` (if not complete) — card layout with cover image (`CloudFrontImage`), publish date, title, excerpt, and "Read More →" link; hover lift effect; responsive for both grid and mobile single-column
- [ ] Implement `PostDetail.tsx` (if not complete) — full blog post layout: hero cover image (full-width or contained), article heading, publish date, rich text body rendered via `RichTextRenderer.tsx`, related posts section at the bottom
- [ ] Implement `RichTextRenderer.tsx` — converts Payload Lexical rich text JSON to HTML elements (headings h2–h4, paragraphs, bold, italic, links, blockquotes, lists); all rendered elements use design token Tailwind classes
- [ ] Add blog listing page link to the main `Navbar.tsx` and `MobileSidebar.tsx` nav ("Journal" or "Blog")
- [ ] Fix `BlogPreview.tsx` on homepage — all three `<Link href>` values must point to `/journal/[slug]` not `/blog/[slug]` (this regression was introduced earlier)
- [ ] Add breadcrumb to both listing and detail pages: Home → Journal → [Post Title]
- [ ] Verify `generateStaticParams` is implemented in `[slug]/page.tsx` using `getPostsBySlug()` / slug list for static generation at build time
- [ ] Add `data-testid` attributes: `"blog-grid"`, `"blog-card-[id]"`, `"blog-post-title"`, `"blog-post-body"`, `"blog-post-cover"`

---

## Acceptance Criteria
- [ ] `/journal` renders a paginated grid of all published blog posts fetched live from Payload CMS
- [ ] Each `PostCard` shows cover image, publish date, title, and excerpt — clicking navigates to `/journal/[slug]`
- [ ] `/journal/[slug]` renders the full blog post with cover image, title, date, and rich text body
- [ ] Rich text headings, paragraphs, bold, italic, lists, and blockquotes all render with correct visual styling
- [ ] A non-existent slug returns a proper 404 page via `notFound()`
- [ ] Homepage `BlogPreview` links all point to `/journal/[slug]` — no `/blog/` references remain
- [ ] "Journal" link appears in both `Navbar` and `MobileSidebar`
- [ ] Blog listing and detail pages are ISR pages — correct `revalidate` export on each
- [ ] No `<img>` tags — all images use `CloudFrontImage` or `next/image`
- [ ] No hardcoded colours — all Tailwind classes use `var(--color-tt-*)` design tokens
- [ ] TypeScript strict mode — no `any` types; Payload blog post types imported from `@TreasureTrove/types`
- [ ] Passes lint and type-check with zero new errors

---

## Technical Notes
- Blog data is fetched via `getPosts()` and `getPostBySlug()` already defined in `apps/storefront/src/lib/payload.ts` — do not duplicate fetchers
- `BlogPost` type is defined in `@TreasureTrove/types` (generated from Payload) — import from there, do not redefine locally
- Rich text from Payload v3 uses the Lexical editor format — the `RichTextRenderer` must handle the `root.children` tree structure, not the older Slate format
- The homepage `BlogPreview.tsx` bug (`/blog/` → `/journal/`) was identified in a previous session — this task formally tracks the fix
- ISR revalidation for blog posts is triggered by Payload's `afterChange` hook calling `POST /api/revalidate` on the storefront — do not remove or bypass these hooks

---

## Files to Create/Modify
```
apps/storefront/src/app/journal/page.tsx                                (verify/complete — live Payload fetch)
apps/storefront/src/app/journal/[slug]/page.tsx                         (verify/complete — live Payload fetch, generateStaticParams)
apps/storefront/src/components/journal/PostCard.tsx                     (verify/complete — card component)
apps/storefront/src/components/journal/PostDetail.tsx                   (verify/complete — detail component)
apps/storefront/src/components/journal/RichTextRenderer.tsx             (verify/complete — Lexical renderer)
apps/storefront/src/components/journal/RelatedPosts.tsx                 (verify/complete — related posts section)
apps/storefront/src/components/home/BlogPreview.tsx                     (fix — /blog/ → /journal/ links)
apps/storefront/src/components/layout/Navbar.tsx                        (modify — add Journal nav link)
apps/storefront/src/components/layout/MobileSidebar.tsx                 (modify — add Journal nav link)
```

---

## API Endpoints
- `GET /api/blog-posts?where[_status][equals]=published&sort=-publishedAt&page=N&limit=10&depth=1` — Payload: list published posts
- `GET /api/blog-posts?where[slug][equals]=[slug]&where[_status][equals]=published&depth=1&limit=1` — Payload: single post by slug

---

## UI Screens
- `/journal` — blog listing page with grid of post cards
- `/journal/[slug]` — individual blog post detail page
- Homepage `BlogPreview` section — corrected links

---

## Related Test Cases
- Unit: `apps/storefront/src/components/journal/PostCard.test.tsx`
- Unit: `apps/storefront/src/components/journal/PostDetail.test.tsx`
- Unit: `apps/storefront/src/components/journal/RichTextRenderer.test.tsx`
- E2E: `e2e/journal/TC-016-journal.spec.ts`

## Dependencies
- **Blocked by:** Payload CMS Blog Posts collection must be configured and seeded with at least one published post
- **Blocks:** None

---

## Claude Code Context
```
harness/claude.md
harness/tasks/178 — Revamping — Client Feedback/TASK-181 — Revamping · Blogs Section Implementation · Frontend.md
harness/architecture.md
apps/storefront/src/app/journal/page.tsx
apps/storefront/src/app/journal/[slug]/page.tsx
apps/storefront/src/components/journal/PostCard.tsx
apps/storefront/src/components/journal/PostDetail.tsx
apps/storefront/src/components/journal/RichTextRenderer.tsx
apps/storefront/src/components/home/BlogPreview.tsx
apps/storefront/src/lib/payload.ts
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-05-12 | Completed. Most components were already fully implemented from prior work. Four targeted changes made: (1) `BlogPreview.tsx` — all 3 `/blog/${post.slug}` links replaced with `/journal/${post.slug}` (bug from original scaffolding, fix from TASK-178 had not persisted). (2) `journal/[slug]/page.tsx` — `revalidate = 3600` corrected to `revalidate = 1800` per task spec for blog post detail pages. (3) `journal/page.tsx` — added `data-testid="blog-grid"` to the posts grid `<div>`. (4) `PostDetail.tsx` — added `data-testid="blog-post-cover"` on the cover image container, `data-testid="blog-post-title"` on the `<h1>`, and `data-testid="blog-post-body"` wrapping the `RichTextRenderer`. Components already correct: `journal/page.tsx` (live Payload fetch via `getPosts()`), `PostCard.tsx` (all `/journal/` links, image handling, correct testids), `RichTextRenderer.tsx` (handles all Lexical node types), `RelatedPosts.tsx` (complete), `generateStaticParams` in slug page. `MobileSidebar.tsx` already has Blog → `/journal` link. `Navbar.tsx` intentionally has no Journal link (moved to footer per TASK-180). |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-05-12 | 0.5 | Audit + targeted fixes with Claude Code |

---

## Review Notes
- **—**
