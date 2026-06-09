# TASK-147: Payload CMS · Blog Posts · Backend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Completed |
| **Priority** | — |
| **Sprint** | — |
| **Story Points** | — |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-05-05 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-05-05 |

---

## Description
Define the Payload CMS v3 `BlogPosts` collection schema and all supporting backend configuration. This covers: Lexical rich text editor for the post body, cover image upload to AWS S3 served via CloudFront, auto-generated slug from the post title, draft/published workflow with `_status` field, and an `afterChange` hook that fires an ISR revalidation webhook to the storefront when a post is published. Register the collection in `payload.config.ts`. Also implement the storefront-side ISR webhook receiver route.

---

## Sub Tasks
- [ ] Create `apps/cms/src/collections/BlogPosts.ts` with all fields: `title` (text, required), `slug` (text, unique, auto-generated from title), `coverImage` (upload, relation to Media collection), `body` (Lexical rich text, required), `excerpt` (textarea, max 300 chars), `tags` (array of text), `_status` (draft/published workflow via `versions.drafts`)
- [ ] Configure `versions: { drafts: true }` on the collection for draft/published workflow
- [ ] Add `beforeValidate` hook to auto-generate `slug` from `title` using `slugify`
- [ ] Create `apps/cms/src/hooks/revalidateBlogPost.ts` — `afterChange` hook that POSTs `{ slug, type: 'blog' }` to `STOREFRONT_URL/api/revalidate` with `REVALIDATE_SECRET` header, only when `_status === 'published'`
- [ ] Attach `revalidateBlogPost` hook in `BlogPosts.ts` hooks config
- [ ] Register `BlogPosts` in `apps/cms/payload.config.ts` collections array
- [ ] Create `apps/storefront/src/app/api/revalidate/route.ts` — POST handler that validates the secret header and calls `revalidatePath('/journal')` and `revalidatePath('/journal/[slug]')`
- [ ] Verify Payload admin UI shows the blog posts table with title, status, and created date columns
- [ ] Confirm S3 upload via `@payloadcms/plugin-cloud-storage` with `generateFileURL` returning CloudFront URL

---

## Acceptance Criteria
- [ ] `BlogPosts` collection is visible in Payload admin at `/admin/collections/blog-posts`
- [ ] Admin can create a post with title, excerpt, cover image, rich text body, and tags
- [ ] Slug is auto-generated from title on save (e.g. "Why We Use Teak" → `why-we-use-teak`) and is editable
- [ ] Draft posts are saved without triggering ISR; only publishing triggers the revalidation webhook
- [ ] Cover image uploads to S3 bucket `treasuretrove-media` and the stored URL is a CloudFront URL (`cdn.treasuretrove.in/...`)
- [ ] On publish, the `revalidateBlogPost` hook fires a POST to the storefront revalidate endpoint
- [ ] The ISR webhook receiver route returns 200 on valid secret and calls `revalidatePath` for both listing and detail paths
- [ ] The webhook receiver returns 401 when the secret header is missing or incorrect
- [ ] PostgreSQL table `payload_blog_posts` is created by Payload migrations
- [ ] No S3 URLs are ever stored in the database — only CloudFront URLs

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/cms/src/collections/BlogPosts.ts
apps/cms/src/hooks/revalidateBlogPost.ts
apps/cms/payload.config.ts (modified — register BlogPosts)
apps/storefront/src/app/api/revalidate/route.ts
```

---

## API Endpoints
- `POST /api/revalidate` (storefront) — ISR webhook receiver; validates `x-revalidate-secret` header; body: `{ slug: string, type: 'blog' | 'material' }`

---

## UI Screens
- **—**

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-148 (Integration Testing), TASK-150 (Backend Unit Tests)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Payload CMS — Blog Posts/TASK-147 — Payload CMS · Blog Posts · Backend.md
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
