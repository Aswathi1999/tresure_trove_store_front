# TASK-005: Storefront · Authentication · Frontend Unit Tests

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Athulgopal k |
| **Status** | ✅ Completed |
| **Priority** | P0 |
| **Sprint** | Sprint 1 |
| **Story Points** | NaN |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-04-17 |
| **Due Date** | 2026-04-17 |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-17 |

---

## Description
Write Vitest + Testing Library unit tests for all authentication UI components including LoginForm, RegisterForm, forgot password, and reset password forms. All Medusa API calls must be mocked — this task tests component behaviour, form validation logic, and error state rendering in isolation.

---

## Sub Tasks
- [x] Install and configure Vitest + Testing Library (jsdom, setup file, `test` script)
- [x] Unit tests for `AuthField` (render, label/id binding, hint vs error, aria-invalid, prop pass-through)
- [x] Unit tests for `AuthButton` (render, loading state, disabled state, click handling, type prop)
- [x] Unit tests for `AuthHeader` (eyebrow/title/description rendering)
- [x] Unit tests for `LoginForm` (validation, success → `/account`, invalid credentials, account lock, submitting state, links)
- [x] Unit tests for `RegisterForm` (required/length/match validation, success, EMAIL_EXISTS, generic errors, links)
- [x] Unit tests for `ForgotPasswordForm` (validation, success screen, email echo, no user enumeration)
- [x] Unit tests for `ResetPasswordForm` (validating spinner, missing token, invalid/expired states, success, navigation)

---

## Acceptance Criteria
- [x] All auth UI components have unit tests using Vitest + Testing Library
- [x] Medusa API calls are mocked — tests do not hit the real backend
- [x] Tests cover render, validation, success and error states, and side effects (navigation)
- [x] Tests pass: **49/49 ✅** (`pnpm --filter storefront test`)
- [x] TypeScript type-check passes

---

## Technical Notes
- **Test runner:** Vitest 2.1 with jsdom environment (pinned to vite 5 for monorepo compatibility)
- **React renderer:** `@testing-library/react` 16 + `@testing-library/user-event` 14
- **Matchers:** `@testing-library/jest-dom` extended matchers registered in `src/test/setup.ts`
- **Mocks:**
  - `@/lib/auth/actions` — each form's Medusa-backed server actions are mocked per-suite so no backend call is made
  - `next/navigation` — `useRouter` and `useSearchParams` mocked to observe navigation calls and inject reset tokens
- **Commands:** `pnpm --filter storefront test` (run) · `pnpm --filter storefront test:watch` (watch)

---

## Files to Create/Modify
```
apps/storefront/package.json                                         (add test scripts + dev deps)
apps/storefront/tsconfig.json                                        (vitest + jest-dom types)
apps/storefront/vitest.config.ts                                     (new)
apps/storefront/src/test/setup.ts                                    (new)
apps/storefront/src/components/auth/AuthField.test.tsx               (new)
apps/storefront/src/components/auth/AuthButton.test.tsx              (new)
apps/storefront/src/components/auth/AuthHeader.test.tsx              (new)
apps/storefront/src/components/auth/LoginForm.test.tsx               (new)
apps/storefront/src/components/auth/RegisterForm.test.tsx            (new)
apps/storefront/src/components/auth/ForgotPasswordForm.test.tsx      (new)
apps/storefront/src/components/auth/ResetPasswordForm.test.tsx       (new)
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
- **Blocked by:** TASK-002
- **Blocks:** None

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Authentication/TASK-005 — Storefront · Authentication · Frontend Unit Tests.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-17 | Installed Vitest 2.1 + @vitejs/plugin-react 4 + jsdom + Testing Library (react, user-event, jest-dom). Pinned `vite@5.4.21` to stay compatible with the existing Next 15 toolchain. |
| 2026-04-17 | Added `vitest.config.ts`, `src/test/setup.ts`, and `test` / `test:watch` scripts. Enabled vitest globals and jest-dom types in `tsconfig.json`. |
| 2026-04-17 | Wrote 16 tests for shared auth primitives: `AuthField` (6), `AuthButton` (7), `AuthHeader` (3). |
| 2026-04-17 | Wrote 8 tests for `LoginForm`: covers zod validation, success → router push, `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED` countdown screen, submitting-state disable, and nav links. |
| 2026-04-17 | Wrote 8 tests for `RegisterForm`: required/length/confirm-match validation, success path, `EMAIL_EXISTS` alert with inline login link, generic error fallback. |
| 2026-04-17 | Wrote 6 tests for `ForgotPasswordForm`: required/format validation, success screen echoing the submitted email, uniform success for unknown emails (no enumeration). |
| 2026-04-17 | Wrote 11 tests for `ResetPasswordForm`: validating spinner, missing-token invalid state, `TOKEN_INVALID` / `TOKEN_EXPIRED` branches on both validate and submit, password match, success → `/login` CTA. |
| 2026-04-17 | Final run: **49/49 green** in ~9s; `pnpm type-check` clean. All Medusa calls mocked via `vi.mock('@/lib/auth/actions')`; no backend required to run tests. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
