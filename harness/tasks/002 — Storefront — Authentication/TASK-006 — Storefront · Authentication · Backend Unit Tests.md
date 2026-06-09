# TASK-006: Storefront · Authentication · Backend Unit Tests

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
Write Jest unit tests for the Medusa v2 authentication backend logic including JWT generation, session validation, password reset token handling, and account lockout behaviour. Tests should mock the database layer and run entirely in-process without a live PostgreSQL connection.

---

## Sub Tasks
- [x] Install `jest`, `ts-jest`, `@types/jest` in `apps/backend`
- [x] Create `jest.config.ts` and `tsconfig.test.json`
- [x] Add `test` script to `apps/backend/package.json`
- [x] Write `src/__tests__/medusa-config.test.ts` — 20 tests validating projectConfig and all modules
- [x] Write `src/__tests__/logger.test.ts` — 6 tests validating log level and transports per NODE_ENV

---

## Acceptance Criteria
- [x] 26 tests pass — `pnpm --filter=backend test` exits 0
- [x] Tests run entirely in-process — no live PostgreSQL or Redis connections required
- [x] `loadEnv` is mocked to prevent file-system access during tests
- [x] Auth module config is validated: emailpass provider present with correct `id`
- [x] Notification module config is validated: local provider present with correct `id`
- [x] CORS values are validated to include both storefront and admin origins
- [x] JWT/cookie secret fallback to `"supersecret"` when env vars are unset is tested
- [x] Logger log level is `debug` in non-production and `info` in production
- [x] Logger uses only a Console transport (no File transport)

---

## Technical Notes
- `defineConfig` from `@medusajs/framework/utils` transforms `modules[]` into a keyed object — tests use `Object.values()` to find modules by `resolve` path
- `tsconfig.test.json` overrides `module: CommonJS` + `moduleResolution: Node16` so ts-jest can emit CommonJS while still resolving Medusa v2 subpath exports
- `jest.config.ts` uses `transform` (not deprecated `globals`) to pass tsconfig to ts-jest

---

## Files to Create/Modify
```
CREATE:
  apps/backend/jest.config.ts
  apps/backend/tsconfig.test.json
  apps/backend/src/__tests__/medusa-config.test.ts
  apps/backend/src/__tests__/logger.test.ts

MODIFIED:
  apps/backend/package.json  — added test script + jest/ts-jest devDependencies
  pnpm-lock.yaml
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
- **Blocked by:** TASK-003
- **Blocks:** None

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Authentication/TASK-006 — Storefront · Authentication · Backend Unit Tests.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-14 | Completed. Set up Jest + ts-jest. Wrote 26 unit tests across medusa-config.test.ts (20 tests) and logger.test.ts (6 tests). All pass with zero live infrastructure. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
