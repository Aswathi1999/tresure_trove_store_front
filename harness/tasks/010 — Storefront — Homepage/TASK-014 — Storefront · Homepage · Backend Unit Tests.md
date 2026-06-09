# TASK-014: Storefront · Homepage · Backend Unit Tests

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Akshay |
| **Status** | ✅ Done |
| **Priority** | — |
| **Sprint** | — |
| **Story Points** | — |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-04-14 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-14 |

---

## Description
Write Jest unit tests for the homepage backend logic, including the Payload CMS HomepageContent global schema validation, the ISR revalidation afterChange hook, and any custom Medusa data transformation utilities used to format products and collections for the storefront. Tests run in-process with all database and HTTP calls mocked.

---

## Sub Tasks
- [x] Set up Jest + ts-jest in `apps/cms` and `packages/utils`
- [x] Write unit tests for `HomepageContent` global schema (18 tests)
- [x] Write unit tests for `revalidateStorefront` afterChange hook (18 tests)
- [x] Write unit tests for `formatPrice`, `getCloudFrontUrl`, `slugify` utilities (33 tests)

---

## Acceptance Criteria
- [x] 69 tests across 5 files, all passing
- [x] All database and HTTP calls mocked in-process (no live Payload, Medusa, or fetch)
- [x] `pnpm test` works in both `apps/cms` and `packages/utils`

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/cms/jest.config.ts                            (new)
apps/cms/tsconfig.test.json                        (new)
apps/cms/package.json                              (added jest deps + test script)
apps/cms/src/__tests__/homepage-content.test.ts    (new — 18 tests)
apps/cms/src/__tests__/revalidate-storefront.test.ts (new — 18 tests)
packages/utils/jest.config.ts                      (new)
packages/utils/tsconfig.test.json                  (new)
packages/utils/package.json                        (added jest deps + test script)
packages/utils/src/__tests__/format-price.test.ts  (new — 10 tests)
packages/utils/src/__tests__/get-cloudfront-url.test.ts (new — 7 tests)
packages/utils/src/__tests__/slugify.test.ts       (new — 13 tests + 3 edge cases)
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
- **Blocked by:** TASK-011
- **Blocks:** None

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Homepage/TASK-014 — Storefront · Homepage · Backend Unit Tests.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-14 | Task completed. Jest configured in apps/cms and packages/utils. 69 tests written across 5 test files — all passing. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
