# TASK-100: Storefront · Authentication · QA

## Meta
| Field | Value |
|-------|-------|
| **Status** | 📋 To Do |
| **Priority** | P1 |
| **Sprint** | — |
| **Story Points** | — |
| **Feature Ref** | harness/tasks/002 — Storefront — Authentication/ |
| **Architecture Ref** | harness/architecture.md |
| **Created** | 2026-04-28 |

---

## Description
End-to-end QA sign-off for the Treasure Trove storefront authentication feature. Covers every test type — smoke, functional, regression, integration, UI/a11y, edge cases, error handling, security, performance, and full E2E journeys — across all auth flows: registration, login, logout, forgot password, and reset password. Authentication is a P0 surface; a defect here exposes order history, saved addresses, and payment data.

**Environments needed:**
- Local: `http://localhost:3000` (storefront) + `http://localhost:9000` (Medusa API)
- Staging: `https://staging.treasuretrove.in` + `https://api-staging.treasuretrove.in`

**Test data setup:**
- Pre-register a known test customer: `qa-auth@treasuretrove.com / QaPass@1234`
- Pre-register a locked-out account (5 failed attempts): `qa-locked@treasuretrove.com`
- Keep a valid password-reset token and an expired one ready in the test DB

---

## Sub Tasks

### Smoke Tests
- [ ] Navigate to `/login` — page loads, form is visible
- [ ] Navigate to `/register` — page loads, form is visible
- [ ] Navigate to `/forgot-password` — page loads, email field is visible
- [ ] Confirm the "Sign In" CTA on the login page is clickable
- [ ] Confirm the "Register" link on the login page navigates to `/register`

### Functional Tests (from TASK-002 acceptance criteria)
- [ ] Login with valid credentials → redirects to `/account`
- [ ] Register with valid Name, Email, Password, Confirm Password → account created, redirected
- [ ] Forgot password with valid email → confirmation message displayed inline
- [ ] Reset password with valid URL token → new password accepted, redirected to `/login`
- [ ] Wrong password error displayed inline below the login form (not as a toast)
- [ ] "Email already registered" error shown inline with a link to `/login`
- [ ] Account locked screen shows 30-minute countdown timer after 5 failed login attempts
- [ ] Reset token expired screen shows prompt to re-request a password reset link
- [ ] All forms use React Hook Form + Zod — verify Zod errors appear on submit with empty fields
- [ ] Password field minimum 8 characters enforced with visible error
- [ ] Confirm Password mismatch shows inline error

### Functional Tests (from TASK-003 acceptance criteria)
- [ ] `POST /auth/customer/emailpass/register` — valid payload returns 201 + JWT token
- [ ] `POST /auth/customer/emailpass` — valid credentials return 200 + JWT
- [ ] `POST /auth/customer/emailpass` — wrong password returns 401
- [ ] 5 consecutive failed logins trigger lockout response from Medusa
- [ ] `DELETE /auth/session` — invalidates session and clears the auth cookie
- [ ] Password reset token is generated and delivered (check `@medusajs/notification-local` output in dev)
- [ ] JWT token expires after configured duration — verify re-auth is required after expiry

### Regression Tests (areas to verify are unbroken)
- [ ] Cart drawer still opens/closes after logging in or out
- [ ] Navbar reflects logged-in state (shows "Account" link, hides "Sign In")
- [ ] `/account` page is inaccessible without a session (redirects to `/login`)
- [ ] Product listing page, product detail page, and homepage all load normally after login
- [ ] ISR revalidation webhook (`/api/revalidate`) is unaffected by auth changes
- [ ] Checkout flow entry still works for both guest and logged-in users

### Integration Tests (FE ↔ BE)
- [ ] Login form → Medusa `POST /auth/customer/emailpass` → JWT cookie set in browser
- [ ] Register form → Medusa `POST /auth/customer/emailpass/register` → customer record created in DB
- [ ] Logout button → Medusa `DELETE /auth/session` → cookie cleared, redirected to `/login`
- [ ] Forgot password form → Medusa password reset flow → notification-local log shows token
- [ ] Reset password form with valid token → Medusa updates password → old password no longer works
- [ ] `GET /store/customers/me` returns correct customer after login (verify via network tab or Playwright)

### UI Layer Tests
- [ ] Login, Register, Forgot Password, and Reset Password pages match the brand split-screen layout
- [ ] All pages are mobile-first responsive: test at 375px, 768px, 1280px, 1440px
- [ ] No layout overflow or horizontal scroll on any viewport
- [ ] `next/image` used for all decorative images — no raw `<img>` tags present in DOM
- [ ] Inline error messages styled consistently across all forms
- [ ] 30-minute countdown timer renders and ticks correctly on the locked account screen
- [ ] All form inputs have visible focus rings (keyboard accessibility)
- [ ] All interactive elements reachable via Tab key in logical order
- [ ] Colour contrast ratio ≥ 4.5:1 for all body text and form labels (WCAG AA)
- [ ] Screen reader: form labels programmatically associated with inputs (via `htmlFor` / `aria-labelledby`)
- [ ] Error messages associated with inputs via `aria-describedby`
- [ ] No accessibility violations reported by axe-core or Playwright's built-in a11y check

### Edge Case Tests
- [ ] Email field: submit with whitespace-only value → Zod error, no API call
- [ ] Email field: submit with invalid format (`user@`) → Zod error
- [ ] Password field: exactly 8 characters → accepted; 7 characters → Zod error
- [ ] Password field: 200-character password → accepted without truncation
- [ ] Name field: Unicode characters (e.g. `Ääkkönen`) → accepted and stored correctly
- [ ] Name field: leading/trailing whitespace → trimmed before submission
- [ ] Register with email already in use → inline error with link to login
- [ ] Navigate to `/reset-password` without `?token=` query param → graceful error shown
- [ ] Rapid double-submit (button clicked twice quickly) → only one API call made (button disabled after first click)
- [ ] Paste password into Confirm Password field → accepted (no paste-block)

### Error Handling Tests
- [ ] Medusa API unreachable (simulate by stopping backend) → user sees a friendly error message, not a raw stack trace
- [ ] `POST /auth/customer/emailpass` returns 500 → error shown inline, form remains usable
- [ ] Network timeout on password reset submission → error shown, retry available
- [ ] `POST /auth/customer/emailpass/register` returns 409 (email conflict) → "Email already registered" error shown
- [ ] `POST /reset-password` with expired token returns 400/401 → "Token expired" screen shown
- [ ] Logout while session is already expired → no double-redirect loop, user lands on `/login`

### Security Tests
- [ ] Attempt to access `/account` without a session cookie → 302 redirect to `/login` (no 200 with partial data)
- [ ] Tamper with the JWT cookie (modify payload) → Medusa rejects with 401, user redirected to `/login`
- [ ] Submit login form with SQL injection payload in email field → no DB error, treated as invalid credentials
- [ ] Submit login form with XSS payload in email field (e.g. `<script>alert(1)</script>`) → sanitized, no script executes
- [ ] Submit register form with XSS payload in Name field → sanitized, stored as plain text
- [ ] Check auth cookie flags: `HttpOnly` is set, `SameSite=Strict`, `Secure` in production (staging)
- [ ] Password reset link is single-use — using it twice returns an error on second use
- [ ] Brute force: 6 rapid login attempts with wrong password → 5th triggers lockout, 6th returns lockout response (not 401)
- [ ] CORS: direct `fetch` to `POST /auth/customer/emailpass` from a non-allowed origin → CORS blocked
- [ ] Auth token not leaked in URL params, `localStorage`, or `console.log` output

### Performance Tests
- [ ] Login page Lighthouse score: LCP < 2.5s, CLS < 0.1, FID < 100ms on a simulated 4G connection
- [ ] Register page Lighthouse score: same targets as above
- [ ] Login form submission round-trip (FE → Medusa → response) < 500ms on localhost
- [ ] Page load on slow 3G (Chrome DevTools throttle) — login form is interactive within 5s
- [ ] No waterfall of sequential API calls on page load (auth pages should make zero API calls on initial render)

### End-to-End Tests (full user journeys)
- [ ] **New customer registration journey:** visit `/register` → fill form → submit → verify redirect to `/account` → verify customer exists in Medusa Admin
- [ ] **Login journey:** visit `/login` → enter valid credentials → submit → verify `/account` loads with customer name → verify auth cookie is set
- [ ] **Logout journey:** from `/account` → click Sign Out → verify redirect to `/login` → verify auth cookie is cleared → verify `/account` redirects to `/login`
- [ ] **Forgot password journey:** visit `/forgot-password` → enter registered email → submit → verify confirmation message → check notification-local log for reset token
- [ ] **Password reset journey:** use valid token URL → enter new password → submit → verify redirect to `/login` → login with new password → verify success
- [ ] **Account lockout journey:** attempt login with wrong password 5 times → verify locked account screen → verify 30-min countdown is visible → verify correct credentials are still blocked during lockout

---

## Acceptance Criteria
- [ ] All smoke tests pass in both local and staging environments
- [ ] All functional tests from TASK-002 and TASK-003 acceptance criteria verified
- [ ] No regressions found in cart, navbar, product, or checkout flows
- [ ] All integration tests confirm correct FE ↔ Medusa data flow
- [ ] All auth pages pass responsive checks at 375px, 768px, 1280px, and 1440px
- [ ] Zero axe-core accessibility violations (level AA)
- [ ] All edge cases handled gracefully — no unhandled exceptions or blank screens
- [ ] All error paths show user-friendly messages — no raw stack traces in UI
- [ ] All security checks pass — no auth bypass, no XSS, correct cookie flags, brute-force lockout confirmed
- [ ] Lighthouse scores meet LCP < 2.5s, CLS < 0.1 on login and register pages
- [ ] All 6 E2E journeys pass end-to-end against a running Medusa backend
- [ ] Zero P0 or P1 bugs open at time of sign-off
- [ ] QA sign-off comment added to this task before merging to `develop`

---

## Technical Notes
- Auth cookie name set by Medusa v2 — inspect with DevTools Application → Cookies to confirm `HttpOnly` flag
- JWT expiry is configured in `medusa-config.ts` — coordinate with TASK-003 owner for the exact value
- Playwright E2E suite is already in `apps/storefront/e2e/auth/` from TASK-004 — run it: `pnpm --filter=storefront exec playwright test e2e/auth/`
- `@medusajs/notification-local` logs reset tokens to stdout — check PM2/terminal output when testing password reset in dev
- Account lockout is tracked by Medusa internally; reset it via Medusa Admin or DB if needed between test runs
- Staging `AUTH_CORS` must include the staging storefront URL — verify in `medusa-config.ts` before testing on staging

---

## Files to Create/Modify
```
READ (no modification needed):
- apps/storefront/src/app/(auth)/login/page.tsx
- apps/storefront/src/app/(auth)/register/page.tsx
- apps/storefront/src/app/(auth)/forgot-password/page.tsx
- apps/storefront/src/app/(auth)/reset-password/page.tsx
- apps/storefront/src/components/auth/LoginForm.tsx
- apps/storefront/src/components/auth/RegisterForm.tsx
- apps/storefront/src/lib/auth/actions.ts
- apps/backend/medusa-config.ts
- apps/storefront/e2e/auth/                          ← existing Playwright suite
```

---

## Dependencies
- **Blocked by:** TASK-002 (Frontend), TASK-003 (Backend), TASK-004 (Integration)
- **Blocks:** Production deployment of Authentication feature
