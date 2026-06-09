# TASK-083: Storefront · Materials Showcase · Backend

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
Configure the Payload CMS `MaterialStories` collection and Medusa product metadata to power the Materials Showcase feature. This includes defining the Payload collection schema with all required fields (wood type enum, sustainability rating, origin, rich text description, featured image via CloudFront), adding an `afterChange` ISR revalidation hook that notifies the storefront, and documenting the Medusa `wood_type` product metadata field used for filtering related products by material.

---

## Sub Tasks
- [ ] Create `MaterialStories` Payload CMS collection at `apps/cms/src/collections/MaterialStories.ts`
- [ ] Add `slug` field (auto-generated from wood type, read-only after creation)
- [ ] Add `woodType` select field with enum values: `teak`, `walnut`, `oak`, `mango`, `rosewood` — required, unique
- [ ] Add `sustainabilityRating` number field (min: 1, max: 5, required)
- [ ] Add `origin` text field (country/region of wood origin, required)
- [ ] Add `description` rich text field using `@payloadcms/richtext-lexical` (required)
- [ ] Add `featuredImage` relationship field pointing to Payload Media collection (required)
- [ ] Add `publishedAt` date field with `defaultValue: () => new Date()` and `admin.hidden: false`
- [ ] Implement `afterChange` hook that POSTs ISR revalidation webhook to storefront (`STOREFRONT_URL/api/revalidate`) with `{ slug, type: 'material' }` payload and `REVALIDATE_SECRET` header
- [ ] Register `MaterialStories` collection in `apps/cms/src/payload.config.ts`
- [ ] Document Medusa product metadata field `wood_type` (string matching the woodType enum) for filtering related products — no Medusa code changes required, metadata field already supported natively
- [ ] Seed 5 draft material story entries in Payload admin for local development (optional but recommended)

---

## Acceptance Criteria
- [ ] `MaterialStories` collection is registered and visible in the Payload Admin at `http://localhost:3001/admin/collections/material-stories`
- [ ] `woodType` field is a select with exactly the 5 values: `teak`, `walnut`, `oak`, `mango`, `rosewood` — duplicate wood types are rejected
- [ ] `sustainabilityRating` field enforces min 1 / max 5 validation on save
- [ ] `featuredImage` field stores a Payload Media document reference — `generateFileURL` returns the CloudFront URL, never the S3 URL
- [ ] `afterChange` hook fires on every save and publish, sending a POST to `${STOREFRONT_URL}/api/revalidate` with body `{ "slug": "<slug>", "type": "material" }` and header `x-revalidate-secret: ${REVALIDATE_SECRET}`
- [ ] Payload REST API returns material stories at `GET /api/material-stories?where[woodType][equals]=teak` with correct JSON structure
- [ ] `featuredImage` URL in API response is a CloudFront URL (`cdn.treasure-trove.in/...`), never an S3 URL
- [ ] Collection file does not exceed 150 lines — split field definitions into separate files if needed
- [ ] TypeScript strict mode passes with no errors on `pnpm type-check --filter=cms`

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/cms/src/collections/MaterialStories.ts
apps/cms/src/payload.config.ts (modified — register MaterialStories collection)
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
- **Blocks:** TASK-084 (Integration Testing), TASK-086 (Backend Unit Tests)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Materials Showcase/TASK-083 — Storefront · Materials Showcase · Backend.md
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
