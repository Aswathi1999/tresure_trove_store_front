# TASK-075: Storefront · Journal (Blog) · Backend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Akshay |
| **Status** | ✅ Done |
| **Priority** | — |
| **Sprint** | — |
| **Story Points** | NaN |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | — |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-29 |

---

## Description
Configure the Payload CMS v3 backend to power the Journal (Blog) feature. This includes defining the `BlogPosts` collection schema with Lexical rich text, cover image (CloudFront), author, publish date, related posts, and slug fields. Implement the ISR revalidation webhook so that publishing or updating a post in Payload automatically triggers Next.js to revalidate the affected page. Implement the Payload REST client helpers on the storefront side.

---

## Sub Tasks
- [ ] Define `apps/cms/src/collections/BlogPosts.ts` Payload collection schema with fields: title, slug (auto-generated), status (draft/published), publishedAt, author (text), coverImage (relationship to Media), content (Lexical rich text), relatedPosts (relationship to BlogPosts, max 3), excerpt
- [ ] Configure Lexical editor in `BlogPosts.ts` with features: headings, paragraphs, bold, italic, links, upload (inline images)
- [ ] Add `afterChange` hook to `BlogPosts.ts` that fires a POST request to `/api/revalidate` on the storefront with `{ slug, type: "blog" }` when a post is published or updated
- [ ] Implement `apps/storefront/src/app/api/revalidate/route.ts` — validates `REVALIDATE_SECRET` header, calls `revalidatePath('/journal')` and `revalidatePath('/journal/[slug]')`
- [ ] Implement `getPosts()` in `apps/storefront/src/lib/payload.ts` — fetches paginated published posts from Payload REST API with `next.revalidate`
- [ ] Implement `getPostBySlug(slug)` in `apps/storefront/src/lib/payload.ts` — fetches a single post by slug, returns `null` for not found
- [ ] Seed 3–5 sample blog posts in Payload Admin for integration testing
- [ ] Verify CloudFront URL is returned for `coverImage` (not S3 URL) via `generateFileURL`

---

## Acceptance Criteria
- [ ] `BlogPosts` collection appears in Payload Admin with all required fields
- [ ] Lexical editor supports headings, paragraphs, bold, italic, links, and inline image uploads
- [ ] Slug field is auto-generated from the title and is unique
- [ ] `status` field controls draft vs. published; only published posts are returned by `getPosts()`
- [ ] `afterChange` hook fires a POST to `STOREFRONT_URL/api/revalidate` with correct body when a post is published
- [ ] `/api/revalidate` route returns 401 if the `REVALIDATE_SECRET` header is missing or wrong
- [ ] `/api/revalidate` route calls `revalidatePath` for the listing page and the specific post slug
- [ ] `getPosts()` returns posts sorted by `publishedAt` descending with correct pagination
- [ ] `getPostBySlug(slug)` returns `null` for unknown slugs (does not throw)
- [ ] All `coverImage` URLs in API responses point to `cdn.treasuretrove.in` — never an S3 URL
- [ ] All Payload helpers have explicit TypeScript return types — no `any`

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/cms/src/collections/BlogPosts.ts (Payload CMS collection schema)
apps/storefront/src/app/api/revalidate/route.ts (ISR webhook handler)
apps/storefront/src/lib/payload.ts (Payload REST client — getPosts, getPostBySlug)
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
- **Blocks:** TASK-076, TASK-078

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Journal (Blog)/TASK-075 — Storefront · Journal (Blog) · Backend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| — | No updates yet |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
