# TASK-093: Storefront · Static Pages · Frontend Unit Tests

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Done |
| **Priority** | — |
| **Sprint** | — |
| **Story Points** | — |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-05-04 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-05-04 |

---

## Description
Write Vitest + Testing Library unit tests for the Static Pages frontend components, with emphasis on the ContactForm — covering Zod validation rules, inline error message rendering, loading state during submission, and success state after submission.

---

## Sub Tasks
- [x] Write ContactForm unit tests (validation, loading, success, error states)
- [x] Write About page unit tests (structure, sections, stats, newsletter)
- [x] Write Craftsmanship page unit tests (structure, steps, CTA)
- [x] Write Contact page unit tests (structure, info cards, map)
- [x] Fix ContactForm missing `x-publishable-api-key` header bug uncovered during testing

---

## Acceptance Criteria
- [x] ContactForm: all required-field Zod errors render inline on empty submit
- [x] ContactForm: email format error renders for invalid email
- [x] ContactForm: message min-length error renders for messages under 20 chars
- [x] ContactForm: phone field is optional — no validation error when empty
- [x] ContactForm: submit button disabled and spinner visible while submitting
- [x] ContactForm: success panel replaces form after successful submission
- [x] ContactForm: server error message displayed on API failure
- [x] ContactForm: fallback error shown when API error body has no message
- [x] ContactForm: correct JSON payload (including `x-publishable-api-key` header) sent to endpoint
- [x] About page: hero, 3 content sections with correct titles, 4 stats, newsletter render
- [x] Craftsmanship page: hero, 4 steps with correct titles, materials CTA link render
- [x] Contact page: heading, form section, 4 info cards, map section render

---

## Technical Notes
- All tests use Vitest + @testing-library/react + @testing-library/user-event
- `next/image`, `next/link`, `@/components/layout/SectionReveal`, and `@/components/ui/Breadcrumb` are mocked in page tests to avoid SSR/framer-motion issues in jsdom
- `ContactForm` is mocked in the Contact page test (tested separately in its own file)
- `fetch` is stubbed per-test via `vi.stubGlobal` + `vi.unstubAllGlobals` in afterEach for isolation
- Bug fixed during task: `ContactForm.tsx` was missing the `x-publishable-api-key` header on the `/store/contact` POST request — Medusa v2 requires this on all `/store/*` routes

---

## Files to Create/Modify
```
apps/storefront/src/components/contact/ContactForm.test.tsx   ← created (11 tests)
apps/storefront/src/app/about/page.test.tsx                   ← created (8 tests)
apps/storefront/src/app/craftsmanship/page.test.tsx           ← created (7 tests)
apps/storefront/src/app/contact/page.test.tsx                 ← created (6 tests)
apps/storefront/src/components/contact/ContactForm.tsx        ← modified (added x-publishable-api-key header)
```

---

## API Endpoints
N/A — this task has no API endpoints

---

## UI Screens
- **—**

---

## Related Test Cases
- 32 new unit tests added (11 + 8 + 7 + 6)
- All 752 existing + new tests pass

---

## Dependencies
- **Blocked by:** TASK-090 (Frontend)
- **Blocks:** None

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Static Pages/TASK-093 — Storefront · Static Pages · Frontend Unit Tests.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-05-04 | Task completed. Created 4 test files with 32 unit tests covering ContactForm (Zod validation, loading/success/error states, payload assertion) and About, Craftsmanship, Contact pages. Also fixed ContactForm bug: missing `x-publishable-api-key` header on `/store/contact` POST. All 752 tests pass. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-05-04 | — | Implementation + bug fix |

---

## Review Notes
- **—**
