# TASK-170: Payload CMS · Media Library · Frontend

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
Build the storefront-side infrastructure for consuming media served from the Payload CMS Media Library via CloudFront CDN. This includes a `CloudFrontImage` wrapper component around `next/image` that enforces the CDN domain, a `cloudfront.ts` helper for building CloudFront URLs from Payload media document data, and ensuring `next.config.ts` allows the CDN domain. No direct S3 URLs are ever exposed to the browser. Use mock Payload media responses to build and test the components in isolation before the real API is wired.

---

## Sub Tasks
- [x] Add `cdn.TreasureTrove.in` to `images.domains` (or `images.remotePatterns`) in `next.config.ts` — no S3 bucket URL allowed
- [x] Create `apps/storefront/src/lib/cloudfront.ts` — helper function `getCloudFrontUrl(path: string): string` that prepends `NEXT_PUBLIC_CLOUDFRONT_URL` env var to a given file path
- [x] Create `apps/storefront/src/components/ui/CloudFrontImage.tsx` — wraps `next/image`, accepts Payload media doc shape as prop (url, alt, width, height), calls `getCloudFrontUrl` internally, enforces `alt` is never empty
- [x] Define a mock Payload media document in `apps/storefront/src/lib/payload.mock.ts` representing a Media collection item (id, url/filename, alt, width, height)
- [x] Verify `CloudFrontImage` can be dropped into `HeroSection` or any other component as a direct replacement for raw `next/image` calls
- [x] Add `data-testid` attributes to `CloudFrontImage` rendered output for test targeting

---

## Acceptance Criteria
- [x] `next.config.ts` lists `cdn.TreasureTrove.in` in `images.remotePatterns` — no S3 bucket domain present
- [x] `getCloudFrontUrl('/some/path.jpg')` returns `https://cdn.TreasureTrove.in/some/path.jpg` using the env var
- [x] `CloudFrontImage` renders a `next/image` element with the correct CloudFront `src`, required `alt`, and passed `width`/`height`
- [x] `CloudFrontImage` throws a TypeScript error (or runtime warning) if `alt` is an empty string or undefined
- [x] No `<img>` tags in the component — only `next/image`
- [x] TypeScript strict mode — no `any` types; Payload media doc shape is a proper interface
- [x] Next.js build passes with no type errors or lint warnings (new files introduce zero errors; pre-existing codebase errors unrelated to this task)

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/storefront/src/components/ui/CloudFrontImage.tsx
apps/storefront/src/lib/cloudfront.ts
apps/storefront/src/lib/payload.mock.ts (modified — add mock media document)
next.config.ts (modified — add cdn.TreasureTrove.in to remotePatterns)
```

---

## API Endpoints
N/A — this task uses mock data only; real API wired in TASK-172

---

## UI Screens
- **—**

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-172 (Integration Testing), TASK-173 (Frontend Unit Tests)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Payload CMS — Media Library/TASK-170 — Payload CMS · Media Library · Frontend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-05-07 | Task completed. Created `cloudfront.ts` helper, `CloudFrontImage` component, added `MockPayloadMediaDoc` + mock data to `payload.mock.ts`, added `NEXT_PUBLIC_CLOUDFRONT_URL` to `.env.local`. `next.config.ts` remotePatterns were already correctly configured. Committed on branch `TASK-170-Payload-CMS-Media-Library-Frontend`. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-05-07 | 0.5 | Implementation session with Claude Code |

---

## Review Notes
- **—**
