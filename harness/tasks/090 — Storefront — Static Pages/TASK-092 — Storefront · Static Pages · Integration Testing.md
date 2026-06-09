# TASK-092: Storefront · Static Pages · Integration Testing

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Done |
| **Priority** | — |
| **Sprint** | Sprint 1 |
| **Story Points** | — |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-05-04 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-05-04 |

---

## Description
Wire the Contact page form to the live `POST /store/contact` Medusa API route, replacing the mock submit function, and run Playwright E2E tests covering successful form submission, validation error flows, the About page, the Craftsmanship page, and the custom 404 page.

---

## Sub Tasks
- [x] Replace `mockSubmit` in `ContactForm.tsx` with `submitContactForm` — real `fetch` to `POST /store/contact`
- [x] Add `submitError` state to `ContactForm` — display API error message below the submit button with `data-testid="contact-submit-error"`
- [x] Handle network/API errors gracefully — re-enable submit button after failure
- [x] Write Playwright E2E tests — About page structure (7 tests)
- [x] Write Playwright E2E tests — Craftsmanship page structure (8 tests)
- [x] Write Playwright E2E tests — Contact page structure (8 tests)
- [x] Write Playwright E2E tests — Contact form validation errors (7 tests)
- [x] Write Playwright E2E tests — Contact form successful submission with mocked API (3 tests)
- [x] Write Playwright E2E tests — Contact form API error handling (2 tests)
- [x] Write Playwright E2E tests — Custom 404 page (8 tests)

---

## Acceptance Criteria
- [x] `ContactForm` calls `POST /store/contact` at `${NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/contact` on submit
- [x] Request body includes `name`, `email`, `message`, and optional `phone` / `subject`
- [x] `200` response → renders `contact-form-success` state, hides form
- [x] Non-200 response → renders `contact-submit-error` with API error message, re-enables submit button
- [x] About page: container, title, breadcrumb, hero, story sections, stats strip, newsletter all tested
- [x] Craftsmanship page: container, title, breadcrumb, hero, 4 steps, CTA, materials link all tested
- [x] Contact page structure: container, title, breadcrumb, form fields, info cards, submit button all tested
- [x] Contact validation: name/email/subject/message required errors, invalid email format, multi-error simultaneous display, field correction clears error
- [x] Contact submission: loading spinner visible, button disabled during submit, success state rendered, form hidden after success
- [x] Contact API error: `contact-submit-error` alert rendered with API message, submit button re-enabled
- [x] Custom 404: 404 HTTP status, branded container, eyebrow + heading, CTA links to `/` and `/products`, clicking home link navigates

---

## Technical Notes
- `submitContactForm` sends `name`, `email`, `message` always; `phone` and `subject` included only when present (backend ignores unknown fields)
- API error response shape: `{ success: false, error?: { message?: string } }` — message extracted and shown; falls back to generic string
- All submission/error E2E tests use `page.route('**/store/contact', ...)` to intercept and mock the Medusa endpoint — no live backend required for test correctness
- Loading state test introduces a 500ms artificial delay via `setTimeout` inside the route handler to allow spinner assertion before response resolves

---

## Files to Create/Modify
```
apps/storefront/src/components/contact/ContactForm.tsx  (modified — live API wiring + error state)
apps/storefront/e2e/static/static-pages.spec.ts         (created — 43 Playwright E2E tests)
```

---

## API Endpoints
| Method | Endpoint | Used for |
|--------|----------|----------|
| POST | `/store/contact` | Contact form submission |

---

## UI Screens
- **Contact Page** (`/contact`) — form wired to live Medusa API, error state displayed
- **About Page** (`/about`) — E2E coverage
- **Craftsmanship Page** (`/craftsmanship`) — E2E coverage
- **404 Page** (`/not-found`) — E2E coverage

---

## Related Test Cases
- `apps/storefront/e2e/static/static-pages.spec.ts` — 43 Playwright E2E tests

## Dependencies
- **Blocked by:** TASK-090 (Frontend), TASK-091 (Backend)
- **Blocks:** TASK-093 (Frontend Unit Tests), TASK-094 (Backend Unit Tests), TASK-095 (Frontend Performance Testing), TASK-096 (Backend Performance Testing), TASK-097 (Security & Vulnerability Testing)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Static Pages/TASK-092 — Storefront · Static Pages · Integration Testing.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-05-04 | Task completed. Replaced `mockSubmit` with `submitContactForm` that POSTs to `${NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/contact`. Added `submitError` state with `data-testid="contact-submit-error"` alert displayed on API failure; submit button re-enabled via `finally` block. Created 43 Playwright E2E tests in `e2e/static/static-pages.spec.ts` covering About (7), Craftsmanship (8), Contact structure (8), Contact validation (7), Contact submission/loading/success (3), Contact API error handling (2), and custom 404 (8). Submission and API error tests use `page.route()` interception — no live Medusa required. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
