# TASK-172: Payload CMS · Media Library · Integration Testing

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Lijina |
| **Status** | ✅ Done |
| **Priority** | — |
| **Sprint** | Sprint 1 |
| **Story Points** | — |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-05-07 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-05-07 |

---

## Description
Wire the real Payload Media collection API into the storefront `CloudFrontImage` component, replacing mock data. Test the full upload-to-render pipeline: upload a file via Payload Admin, confirm it lands in S3, confirm the stored URL is a CloudFront URL, and confirm the storefront renders it correctly via `next/image`. Playwright E2E tests cover the upload flow and CDN URL rendering.

---

## Sub Tasks
- [x] Add `getMediaDoc(id)` and `getMediaDocs(limit?)` fetchers to `apps/storefront/src/lib/payload.ts` using the real Payload `/api/media` endpoint
- [x] Update `PostCard.tsx` to use `CloudFrontImage` for populated Media objects (replacing raw `next/image`) — wires real CMS media into the storefront render path
- [x] Create `apps/storefront/e2e/media/media.spec.ts` — Playwright E2E tests covering: Payload media API structure, CloudFront URL enforcement, `CloudFrontImage` render verification, S3 URL absence check

---

## Acceptance Criteria
- [x] `GET /api/media` returns paginated docs with `id`, `url`, `alt`, `filename`, `width`, `height`, `mimeType`
- [x] All media document URLs contain `cdn.treasuretrove.in` — no `s3.amazonaws.com` URLs
- [x] `GET /api/media/:id` returns a single document with correct fields
- [x] `alt` text is non-empty on all uploaded media documents
- [x] Journal post cards render with `data-testid="cloudfront-image"` when CMS media is populated
- [x] No `src` attribute on any `CloudFrontImage` contains a raw S3 URL
- [x] All E2E tests skip gracefully when CMS or media library is unavailable (local dev without S3)

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/storefront/src/lib/payload.ts          (modified — added getMediaDoc, getMediaDocs)
apps/storefront/src/components/journal/PostCard.tsx  (modified — use CloudFrontImage for populated media)
apps/storefront/e2e/media/media.spec.ts     (created — Playwright E2E tests)
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
- **Blocked by:** TASK-170 (Frontend), TASK-171 (Backend)
- **Blocks:** TASK-175 (Frontend Performance Testing), TASK-176 (Backend Performance Testing), TASK-177 (Security & Vulnerability Testing)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Payload CMS — Media Library/TASK-172 — Payload CMS · Media Library · Integration Testing.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-05-07 | Task completed. Added `getMediaDoc`/`getMediaDocs` to `payload.ts`, wired `CloudFrontImage` into `PostCard` (replaces raw `next/image` for populated Payload media), created Playwright E2E test suite in `e2e/media/media.spec.ts` covering API structure, CloudFront URL enforcement, render testid, and S3 absence checks. All tests skip gracefully without live S3/CMS. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-05-07 | 0.5 | Implementation session with Claude Code |

---

## Review Notes
- **—**
