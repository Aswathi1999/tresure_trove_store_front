# TASK-038: Storefront · Cart · Backend Unit Tests

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Akshay |
| **Status** | ✅ Done |
| **Priority** | P0 |
| **Sprint** | Sprint 1 |
| **Story Points** | NaN |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-04-17 |
| **Due Date** | 2026-04-17 |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-18 |

---

## Description
Write Jest unit tests for the Medusa cart module configuration and any custom cart-related logic in the backend. Tests cover cart creation, line item mutations, and total calculation logic in isolation using mocked Medusa service dependencies.

---

## Sub Tasks
- [x] Write Jest tests for cart module config (`apps/backend/src/__tests__/cart-config.test.ts`)
- [x] Write Vitest tests for cart SDK wrapper functions (`apps/storefront/src/lib/medusa.test.ts`)

---

## Acceptance Criteria
- [x] Cart module registration is verified (auto-linked built-in, no override)
- [x] Cart-critical infrastructure modules (workflow-engine, event-bus, cache) are asserted present
- [x] All 5 cart SDK wrappers tested with mocked Medusa SDK (createCart, getCart, addCartItem, updateCartItem, removeCartItem)
- [x] Error paths tested (SDK throws, missing parent cart after delete)
- [x] All new tests pass (12 backend Jest + 19 storefront Vitest)

---

## Technical Notes
- Medusa v2 `defineConfig` auto-links all built-in modules including cart — 27 total module keys are expected
- Storefront uses Vitest (not Jest); cart SDK wrapper tests live in `apps/storefront/src/lib/medusa.test.ts`
- `vi.hoisted()` used to create mock fn refs accessible inside `vi.mock()` factory
- Pre-existing `middlewares.test.ts` failures (11 tests) are unrelated to this task

---

## Files to Create/Modify
```
apps/backend/src/__tests__/cart-config.test.ts   ← new: 12 Jest tests
apps/storefront/src/lib/medusa.test.ts           ← new: 19 Vitest tests
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
- **Blocked by:** TASK-035 (Backend)
- **Blocks:** None

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Cart/TASK-038 — Storefront · Cart · Backend Unit Tests.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-18 | Completed — 12 backend Jest tests + 19 storefront Vitest tests, all passing |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
