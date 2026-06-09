# TASK-171: Payload CMS · Media Library · Backend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Completed |
| **Priority** | — |
| **Sprint** | — |
| **Start Date** | 2026-05-05 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-05-05 |

---

## Description
Define the Payload CMS v3 Media collection that acts as the central image and file library for the entire storefront. All uploads automatically route to the private AWS S3 bucket `TreasureTrove-media` (region `ap-south-1`) via `@payloadcms/plugin-cloud-storage` with `s3Adapter`. The `generateFileURL` function always returns a CloudFront CDN URL (`cdn.TreasureTrove.in/...`) — the raw S3 URL is never stored or exposed. `alt` text is required on every upload for accessibility and SEO. File format validation restricts uploads to JPG, JPEG, PNG, and WEBP. File size is capped at 10MB. The Media collection is referenced by Blog Posts, Material Stories, and product image uploads.

---

## Sub Tasks
- [ ] Create `apps/cms/src/collections/Media.ts` — define the Payload Media collection with: `alt` field (text, required), upload config (accepted MIME types: image/jpeg, image/png, image/webp), max file size (10MB = 10485760 bytes)
- [ ] Configure `generateFileURL` in the Media upload config — builds `${process.env.CLOUDFRONT_URL}/${filename}` ensuring S3 URL is never returned
- [ ] Configure `@payloadcms/plugin-cloud-storage` with `s3Adapter` in `apps/cms/payload.config.ts` — use env vars `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET`; set `disableLocalStorage: true`
- [ ] Register the `Media` collection in `apps/cms/payload.config.ts` under the `collections` array
- [ ] Add access control: authenticated users can upload and manage; public can read (for CDN-served URLs)
- [ ] Add file format validation that rejects non-image MIME types with a clear error message in the admin UI
- [ ] Verify env vars are documented in `apps/cms/.env.example`: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION=ap-south-1`, `S3_BUCKET=TreasureTrove-media`, `CLOUDFRONT_URL`

---

## Acceptance Criteria
- [ ] Payload Admin shows a "Media" collection in the left nav — upload UI is visible with drag-and-drop support
- [ ] Uploading a JPG/PNG/WEBP under 10MB succeeds and the file appears in the S3 bucket `TreasureTrove-media`
- [ ] The stored `url` field on the media document is a CloudFront URL (`cdn.TreasureTrove.in/...`), never an S3 URL
- [ ] Uploading without providing `alt` text shows a required field validation error and blocks save
- [ ] Uploading a PDF or non-image file shows a format validation error and is rejected
- [ ] Uploading a file over 10MB shows a file size error and is rejected
- [ ] `GET /api/media` returns a paginated list of media documents with correct CloudFront URLs
- [ ] `GET /api/media/:id` returns a single media document with all fields including `alt` and `url`
- [ ] `disableLocalStorage: true` is set — no files stored locally in the CMS container
- [ ] TypeScript strict mode — no `any` types in collection or plugin config files

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/cms/src/collections/Media.ts
apps/cms/payload.config.ts (modified — register Media collection + cloud storage plugin with s3Adapter)
apps/cms/.env.example (modified — document AWS and CloudFront env vars)
```

---

## API Endpoints
- `GET /api/media` — Payload REST: list media documents (paginated)
- `GET /api/media/:id` — Payload REST: fetch single media document
- `POST /api/media` — Payload REST: upload new media file (multipart/form-data)
- `DELETE /api/media/:id` — Payload REST: delete media document and S3 object

---

## UI Screens
- **—**

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-172 (Integration Testing), TASK-174 (Backend Unit Tests)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Payload CMS — Media Library/TASK-171 — Payload CMS · Media Library · Backend.md
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
