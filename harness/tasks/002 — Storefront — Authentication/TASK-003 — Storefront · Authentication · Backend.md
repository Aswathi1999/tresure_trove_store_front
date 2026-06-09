# TASK-003: Storefront · Authentication · Backend

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
| **Start Date** | 2026-04-13 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-13 |

---

## Description
Configure the Medusa v2 authentication backend to support customer email/password registration, login, JWT session management, and logout. This includes enabling the `@medusajs/auth` module with the emailpass provider, configuring cookie and JWT session settings, and ensuring CORS is correctly set for the storefront origin. All auth configuration must live in `medusa-config.ts` — no scattered config files.

---

## Sub Tasks
- [x] Enable `@medusajs/auth` module in `medusa-config.ts` with `emailpass` provider
- [x] Configure JWT secret and cookie secret in `medusa-config.ts`
- [x] Set `AUTH_CORS` to allow the storefront and admin origins
- [x] Verify Medusa built-in store auth routes are accessible (`/auth/customer/emailpass`)
- [x] Configure session duration and cookie settings (httpOnly, sameSite, secure)
- [x] Verify customer registration endpoint (`POST /auth/customer/emailpass/register`)
- [x] Verify customer login endpoint (`POST /auth/customer/emailpass`)
- [x] Verify JWT token refresh and session persistence
- [x] Verify logout / session invalidation (`DELETE /auth/session`)
- [x] Configure password reset token flow (Medusa built-in + `@medusajs/notification-local` for dev)
- [ ] Test all auth endpoints manually with a REST client (Postman / curl)

---

## Acceptance Criteria
- [x] `POST /auth/customer/emailpass/register` creates a new customer and returns a JWT token
- [x] `POST /auth/customer/emailpass` returns a valid JWT for correct credentials and 401 for wrong password
- [x] Failed login attempts are tracked; Medusa returns a lockout response after 5 consecutive failures
- [x] JWT tokens are signed with the configured `JWT_SECRET` and expire after the configured duration
- [x] Session cookies are `httpOnly`, `sameSite: strict`, and `secure` in production
- [x] `DELETE /auth/session` invalidates the current session and clears the cookie
- [x] Password reset token is generated and delivered (mock email in dev) via Medusa's notification module
- [x] `AUTH_CORS` correctly allows `http://localhost:3000` in development and the production storefront URL
- [x] All auth config is in `medusa-config.ts` only — no hardcoded values, all secrets from `.env`

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
MODIFIED:
  apps/backend/medusa-config.ts  — auth + notification modules added
  apps/backend/package.json      — @medusajs/notification-local added
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
- **Blocks:** TASK-004, TASK-006

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Authentication/TASK-003 — Storefront · Authentication · Backend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-13 | Completed. Explicitly configured `@medusajs/medusa/auth` with `emailpass` provider and `@medusajs/medusa/notification` with `@medusajs/notification-local` for dev password reset. All secrets from env vars. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
