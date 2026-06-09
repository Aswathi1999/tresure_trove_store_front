# TASK-077: Storefront · Journal (Blog) · Frontend Unit Tests

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
| **Start Date** | — |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-30 |

---

## Description
Write Vitest + Testing Library unit tests for all Journal UI components built in TASK-074, covering `PostCard` rendering, `RichTextRenderer` node output for each Lexical node type, `RelatedPosts` list rendering, and the Post Not Found state.

---

## Sub Tasks
- [x] PostCard unit tests (10 tests)
- [x] RichTextRenderer unit tests — all Lexical node types (16 tests)
- [x] RelatedPosts unit tests (6 tests)
- [x] PostDetail unit tests (8 tests)
- [x] Journal [slug] page — Post Not Found state test (3 tests)

---

## Acceptance Criteria
- [x] PostCard rendering covered (testid, cover image string & Media, title, author, date, excerpt, Read More link, URL)
- [x] RichTextRenderer covers all Lexical node types: paragraph, h2/h3/h4, bold/italic/bold+italic, links (same-tab & new-tab), bullet list, numbered list, blockquote, upload image
- [x] RelatedPosts covers empty-array null return and list rendering
- [x] PostDetail covers hero image, h1 title, author initial/name, date, no-author state
- [x] Post Not Found state: notFound() called when slug not found, string-only relatedPost IDs filtered out
- [x] All 43 tests pass with zero failures

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/storefront/src/components/journal/PostCard.test.tsx        (created)
apps/storefront/src/components/journal/RichTextRenderer.test.tsx (created)
apps/storefront/src/components/journal/RelatedPosts.test.tsx    (created)
apps/storefront/src/components/journal/PostDetail.test.tsx      (created)
apps/storefront/src/app/journal/[slug]/page.test.tsx            (created)
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
- **Blocked by:** TASK-074
- **Blocks:** None

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Journal (Blog)/TASK-077 — Storefront · Journal (Blog) · Frontend Unit Tests.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-30 | Task completed. Created 5 test files, 43 tests, all passing. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
