# TASK-091: Storefront · Static Pages · Backend

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
Build the Medusa v2 custom API route that handles contact form submissions from the storefront. The route must validate and sanitize all inputs, log the submission with Winston, and optionally forward the message to an email service. Input sanitization middleware must prevent XSS and injection attacks before the handler runs.

---

## Sub Tasks
- [ ] Create custom Medusa API route at `apps/backend/src/api/store/contact/route.ts` with a `POST` handler
- [ ] Define and validate the request body schema: `name` (string, required), `email` (valid email, required), `message` (string, min 20 chars, required)
- [ ] Return 400 with structured error response `{ success: false, error: { code: "VALIDATION_ERROR", message, details } }` for invalid payloads
- [ ] Add input sanitization middleware to strip HTML tags and trim whitespace from all string fields before the handler runs
- [ ] Log every contact form submission with Winston structured logger (JSON format): include timestamp, name, email (masked: first 3 chars + `***`), message length — never log the full message body
- [ ] Return 200 with `{ success: true, message: "Your message has been received." }` on success
- [ ] Add rate limiting note in comments (implementation deferred to TASK-097 Security) — do not implement rate limiting in this task
- [ ] Register the route in Medusa's router so it is accessible at `POST /store/contact`
- [ ] Ensure STORE_CORS allows requests from the storefront origin

---

## Acceptance Criteria
- [ ] `POST /store/contact` with valid body returns `200 { success: true, message: "Your message has been received." }`
- [ ] `POST /store/contact` with missing or invalid fields returns `400` with structured error response matching the custom error format
- [ ] `POST /store/contact` with an email field containing an HTML script tag has the tag stripped before any processing
- [ ] Winston logs a JSON-structured entry for every submission — email is masked, full message body is not logged
- [ ] Route is accessible from the storefront origin (STORE_CORS configured correctly)
- [ ] TypeScript strict mode passes with no errors on `pnpm type-check --filter=backend`
- [ ] No raw SQL or direct database connections — route does not persist to the database (log only)

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/backend/src/api/store/contact/route.ts
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
- **Blocks:** TASK-092 (Integration Testing), TASK-094 (Backend Unit Tests)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Static Pages/TASK-091 — Storefront · Static Pages · Backend.md
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
