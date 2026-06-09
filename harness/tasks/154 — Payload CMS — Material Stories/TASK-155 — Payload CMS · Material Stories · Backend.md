# TASK-155: Payload CMS · Material Stories · Backend

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
Define the Payload CMS v3 `MaterialStories` collection schema and all supporting backend configuration. This covers: a `woodType` enum field restricted to the 5 approved wood types (Teak, Walnut, Oak, Mango, Rosewood), a `sustainabilityRating` number field (1–5), featured image upload to AWS S3 served via CloudFront, a Lexical rich text description field, auto-generated slug, draft/published workflow, and an `afterChange` hook that fires an ISR revalidation webhook to the storefront when a story is published. Register the collection in `payload.config.ts`.

---

## Sub Tasks
- [ ] Create `apps/cms/src/collections/MaterialStories.ts` with all fields: `name` (text, required), `slug` (text, unique, auto-generated from name), `woodType` (select enum: Teak | Walnut | Oak | Mango | Rosewood, required), `sustainabilityRating` (number, min: 1, max: 5, required), `featuredImage` (upload, relation to Media collection, required), `description` (Lexical rich text, required), `_status` (draft/published via `versions.drafts`)
- [ ] Configure `versions: { drafts: true }` on the collection for draft/published workflow
- [ ] Add `beforeValidate` hook to auto-generate `slug` from `name` using `slugify`
- [ ] Create `apps/cms/src/hooks/revalidateMaterialStory.ts` — `afterChange` hook that POSTs `{ slug, type: 'material' }` to `STOREFRONT_URL/api/revalidate` with `REVALIDATE_SECRET` header, only when `_status === 'published'`
- [ ] Attach `revalidateMaterialStory` hook in `MaterialStories.ts` hooks config
- [ ] Register `MaterialStories` in `apps/cms/payload.config.ts` collections array
- [ ] Verify the storefront `apps/storefront/src/app/api/revalidate/route.ts` handles `type: 'material'` by calling `revalidatePath('/materials')` and `revalidatePath('/materials/[slug]')`
- [ ] Verify Payload admin UI shows the material stories table with name, wood type, sustainability rating, and status columns
- [ ] Confirm S3 upload via `@payloadcms/plugin-cloud-storage` with `generateFileURL` returning CloudFront URL

---

## Acceptance Criteria
- [ ] `MaterialStories` collection is visible in Payload admin at `/admin/collections/material-stories`
- [ ] Admin can create a material story with name, wood type (dropdown of 5 options), sustainability rating (1–5), featured image, and rich text description
- [ ] `woodType` field only accepts: Teak, Walnut, Oak, Mango, Rosewood — other values are rejected with a validation error
- [ ] `sustainabilityRating` field only accepts integers 1 through 5 — values outside this range are rejected
- [ ] Slug is auto-generated from name on save (e.g. "Burmese Teak" → `burmese-teak`) and is editable
- [ ] Draft stories are saved without triggering ISR; only publishing triggers the revalidation webhook
- [ ] Featured image uploads to S3 bucket `treasuretrove-media` and the stored URL is a CloudFront URL (`cdn.treasuretrove.in/...`)
- [ ] On publish, the `revalidateMaterialStory` hook fires a POST to the storefront revalidate endpoint with `type: 'material'`
- [ ] The ISR revalidation webhook receiver handles `type: 'material'` and revalidates both `/materials` and `/materials/[slug]`
- [ ] PostgreSQL table `payload_material_stories` is created by Payload migrations
- [ ] No S3 URLs are ever stored in the database — only CloudFront URLs

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/cms/src/collections/MaterialStories.ts
apps/cms/src/hooks/revalidateMaterialStory.ts
apps/cms/payload.config.ts (modified — register MaterialStories)
apps/storefront/src/app/api/revalidate/route.ts (modified — handle type: 'material')
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
- **Blocks:** TASK-156 (Integration Testing), TASK-158 (Backend Unit Tests)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Payload CMS — Material Stories/TASK-155 — Payload CMS · Material Stories · Backend.md
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
