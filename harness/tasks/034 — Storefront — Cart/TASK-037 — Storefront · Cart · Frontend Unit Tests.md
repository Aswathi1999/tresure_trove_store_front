# TASK-037: Storefront · Cart · Frontend Unit Tests

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | athulgopal-adviciya |
| **Status** | ✅ Done |
| **Priority** | Medium |
| **Sprint** | Sprint 1 |
| **Story Points** | 3 |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-04-20 |
| **Due Date** | 2026-04-20 |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-20 |

---

## Description
Write Vitest + Testing Library unit tests for all cart UI components (CartDrawer, CartItem, CartSummary, EmptyCart) and the Zustand cart store logic. All Medusa API calls are mocked — tests operate only against the component and store layer.

---

## Sub Tasks
- [x] `cart-types.test.ts` — `formatPrice` and `mapMedusaCart` utility tests
- [x] `cart.test.ts` — Zustand store: drawer actions, setCart, initCart, addItem, removeItem, updateQuantity
- [x] `EmptyCart.test.tsx` — renders, link href, onClose callback
- [x] `CartItem.test.tsx` — rendering, quantity stepper, remove, OOS badge, price-changed warning
- [x] `CartSummary.test.tsx` — subtotal math, total, checkout CTA, labels
- [x] `CartDrawer.test.tsx` — open/close, backdrop, Escape key, item count badge, loading spinner, initCart on mount

---

## Acceptance Criteria
- [x] All 6 test files created under their source directories
- [x] 141 tests pass, 0 failures
- [x] Medusa API calls fully mocked (`@/actions/cart`)
- [x] Zustand store mocked in CartDrawer tests via `vi.mock('@/stores/cart')`
- [x] `framer-motion` mocked to avoid animation timing issues in CartDrawer tests
- [x] `next/image` mocked in CartItem tests
- [x] `next/link` mocked in EmptyCart and CartSummary tests

---

## Technical Notes
- Store tests use `useCartStore.setState()` / `useCartStore.getState()` for direct state manipulation without a React component
- `initCartMock.mockReset()` is called in `beforeEach` in CartDrawer tests to prevent call-count accumulation across the 13 tests
- `formatPrice` tests use small values to avoid locale-specific thousands-separator differences across Node ICU builds

---

## Files Created
```
apps/storefront/src/lib/cart-types.test.ts             (10 tests)
apps/storefront/src/stores/cart.test.ts                (19 tests)
apps/storefront/src/components/cart/EmptyCart.test.tsx  (4 tests)
apps/storefront/src/components/cart/CartItem.test.tsx  (20 tests)
apps/storefront/src/components/cart/CartSummary.test.tsx (7 tests)
apps/storefront/src/components/cart/CartDrawer.test.tsx (13 tests)
```
Total: **73 new tests** (141 total passing, including 68 pre-existing)

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
- **Blocked by:** TASK-034 (Frontend)
- **Blocks:** None

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Cart/TASK-037 — Storefront · Cart · Frontend Unit Tests.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-20 | Task started and completed. Created 6 test files with 73 new unit tests covering cart-types utilities, Zustand store, and all 4 cart components. All 141 tests pass. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-20 | 1 | Write and fix all cart unit tests |

---

## Review Notes
- **—**
