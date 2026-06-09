# TASK-029: Storefront · Product Detail Page · Frontend Unit Tests

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
| **Start Date** | 2026-04-23 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-23 |

---

## Description
Write Vitest + Testing Library unit tests for all PDP components — ImageGallery, VariantSelector, AddToCartButton, StockIndicator, MaterialStoryLink, and RelatedProducts. All Medusa SDK, Payload REST, and Zustand cart store interactions must be mocked; tests must cover render states, variant selection logic, and cart add behavior.

---

## Sub Tasks
- [x] Write tests for `StockIndicator` — 11 tests
- [x] Write tests for `MaterialStoryLink` — 6 tests
- [x] Write tests for `AddToCartButton` — 9 tests
- [x] Write tests for `ImageGallery` — 10 tests
- [x] Write tests for `VariantSelector` — 21 tests
- [x] Write tests for `RelatedProducts` — 15 tests

---

## Acceptance Criteria
- [x] All 6 PDP components have Vitest unit tests
- [x] Medusa SDK, Payload REST, and Zustand cart store interactions are mocked
- [x] Tests cover render states, variant selection logic, and cart add behavior
- [x] 72 tests total — all passing

---

## Technical Notes
- `next/image` → plain `<img>` with forwarded src/alt/className
- `next/link` → plain `<a>` with forwarded href/className/children
- `framer-motion` → `motion.div` renders a plain `<div>`, `AnimatePresence` renders children directly
- `@/stores/cart` → `useCartStore` mocked with `vi.fn()` and per-test `mockReturnValue`
- `HTMLElement.prototype.scrollBy` → `vi.fn()` in RelatedProducts tests

---

## Files to Create/Modify
```
apps/storefront/src/components/pdp/StockIndicator.test.tsx
apps/storefront/src/components/pdp/MaterialStoryLink.test.tsx
apps/storefront/src/components/pdp/AddToCartButton.test.tsx
apps/storefront/src/components/pdp/ImageGallery.test.tsx
apps/storefront/src/components/pdp/VariantSelector.test.tsx
apps/storefront/src/components/pdp/RelatedProducts.test.tsx
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
- **Blocked by:** TASK-026 (Frontend)
- **Blocks:** None

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Product Detail Page/TASK-029 — Storefront · Product Detail Page · Frontend Unit Tests.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-23 | Task completed — 72 Vitest unit tests written across all 6 PDP components, all passing |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-23 | — | Unit tests written and verified |

---

## Review Notes
- All 72 tests passing via `pnpm --filter=storefront test`
