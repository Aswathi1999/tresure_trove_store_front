# TASK-004: Storefront · Authentication · Integration Testing

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Athulgopal k |
| **Status** | 🔄 In Progress |
| **Priority** | P0 |
| **Sprint** | Sprint 1 |
| **Story Points** | NaN |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-05-06 |
| **Due Date** | 2026-04-17 |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-17 |

---

## Description
Wire the storefront authentication screens to the real Medusa Auth API, replacing all mock functions with live Medusa JS SDK v2 calls. Write Playwright E2E tests covering the full registration, login, logout, and password reset flows against a running local environment.

---

## Sub Tasks
- [ ] No sub tasks defined

---

## Acceptance Criteria
- [ ] No criteria defined

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
—
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
- **Blocked by:** TASK-002, TASK-003
- **Blocks:** TASK-007, TASK-008, TASK-009

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Authentication/TASK-004 — Storefront · Authentication · Integration Testing.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-17 | Phase A — replaced mock auth with live Medusa SDK v2 calls in `src/lib/auth/actions.ts`; wired login/register/forgot-password/reset-password forms to server actions; added `/account` page with session check + sign out. |
| 2026-04-17 | Phase B — added Playwright E2E suite under `apps/storefront/e2e/auth/` (helpers + 5 specs, 18 tests) covering registration, login, logout, and password-reset flows. Added `webServer` block and 60s navigation timeout to `playwright.config.ts`. Full suite: 18/18 passing against running Medusa backend. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
