# TASK-002: Storefront · Authentication · Frontend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Athulgopal k |
| **Status** | ✅ Done |
| **Priority** | P0 |
| **Sprint** | Sprint 1 |
| **Story Points** | 1 |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-04-16 |
| **Due Date** | 2026-04-16 |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-17 |

---

## Description
Build all authentication screens for the Treasure Trove storefront using Next.js 15 App Router. This includes the login page, customer registration page, forgot password flow, and reset password flow. All screens must be fully functional UI with form validation (React Hook Form + Zod), loading states, and error states. No real Medusa SDK or Payload REST calls — use mock functions in `apps/storefront/src/lib/auth/mock.ts` that will be replaced in TASK-004.

---

## Sub Tasks
- [x] Mock auth functions (login, register, forgotPassword, resetPassword, logout)
- [x] Login page with email/password form
- [x] Register page with name, email, password, confirm password fields
- [x] Forgot password page with email input
- [x] Reset password page with token validation and new password fields
- [x] Wrong password / invalid credentials error state
- [x] Email already registered error state
- [x] Account locked screen (after 5 failed login attempts)
- [x] Reset token expired error state
- [x] Login success redirect logic (mock)
- [ ] Email verification placeholder screen (optional flow)

---

## Acceptance Criteria
- [x] Login page renders with email and password fields, "Sign In" CTA, and a link to Register
- [x] Register page has Name (required), Email (required), Password (required, min 8 chars), Confirm Password (required, must match) with Zod schema validation
- [x] Forgot password page accepts an email and shows a confirmation message after mock submission
- [x] Reset password page validates the URL token (mock), shows new password + confirm fields, and redirects to login on success
- [x] Wrong password error is displayed inline below the form — not as a toast
- [x] "Email already registered" error is shown inline with a link to the login page
- [x] Account locked screen shows a 30-minute countdown timer before allowing retry
- [x] Reset token expired screen shows a prompt to re-request a password reset link
- [x] All forms are built with React Hook Form + Zod — no raw `useState` for form fields
- [x] All interactive elements have `data-testid` attributes for testing
- [x] All screens are mobile-first, responsive, and use Tailwind CSS v4 utility classes
- [x] No `<img>` tags — use `next/image` for any decorative images
- [x] All pages are Server Components where possible; `"use client"` only on form components

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/storefront/src/app/(auth)/login/page.tsx
apps/storefront/src/app/(auth)/register/page.tsx
apps/storefront/src/app/(auth)/forgot-password/page.tsx
apps/storefront/src/app/(auth)/reset-password/page.tsx
apps/storefront/src/lib/auth/mock.ts
apps/storefront/src/components/auth/LoginForm.tsx
apps/storefront/src/components/auth/RegisterForm.tsx
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
- **Blocks:** TASK-004, TASK-005

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Authentication/TASK-002 — Storefront · Authentication · Frontend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-17 | Built auth routes under `(auth)/` — login, register, forgot-password, reset-password — with shared split-screen layout. Added `AuthHeader`, `AuthField`, `AuthButton` primitives and four form components using React Hook Form + Zod. Mock auth layer implemented in `src/lib/auth/mock.ts` (login/register/forgot/validate/reset/logout) with 5-attempt lockout, 30-min cooldown, and 15-min reset token expiry. Brand theme tokens added to `globals.css`; Mulish wired via `next/font`. `lh3.googleusercontent.com` added to `next.config.ts` `remotePatterns`. Added `@hookform/resolvers@^5.2.2`. Email-verification placeholder screen deferred (optional). Task marked Done. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
