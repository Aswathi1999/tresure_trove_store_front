# TASK-029 — Storefront: Product Detail Page Frontend Unit Tests

## Status
Done

## Summary
Write comprehensive Vitest unit tests for all six PDP (Product Detail Page) React components.

## Components Tested

- `src/components/pdp/StockIndicator.tsx` — 11 tests
- `src/components/pdp/MaterialStoryLink.tsx` — 6 tests
- `src/components/pdp/AddToCartButton.tsx` — 9 tests
- `src/components/pdp/ImageGallery.tsx` — 10 tests
- `src/components/pdp/VariantSelector.tsx` — 21 tests
- `src/components/pdp/RelatedProducts.tsx` — 15 tests

**Total: 72 new unit tests — all passing**

## Test Files Created

| File | Tests |
|------|-------|
| `src/components/pdp/StockIndicator.test.tsx` | 11 |
| `src/components/pdp/MaterialStoryLink.test.tsx` | 6 |
| `src/components/pdp/AddToCartButton.test.tsx` | 9 |
| `src/components/pdp/ImageGallery.test.tsx` | 10 |
| `src/components/pdp/VariantSelector.test.tsx` | 21 |
| `src/components/pdp/RelatedProducts.test.tsx` | 15 |

## Mocking Strategy

- `next/image` → plain `<img>` with forwarded src/alt/className
- `next/link` → plain `<a>` with forwarded href/className/children
- `framer-motion` → `motion.div` renders a plain `<div>`, `AnimatePresence` renders children directly
- `@/stores/cart` → `useCartStore` mocked with `vi.fn()` and per-test `mockReturnValue`
- `HTMLElement.prototype.scrollBy` → `vi.fn()` in RelatedProducts tests

## Coverage Areas

- Conditional rendering (out-of-stock vs in-stock, null story, empty products, material selector visibility)
- User interactions (thumbnail/dot click changes main image, finish/material/size selection updates price, quantity increment/decrement)
- State constraints (quantity never drops below 1, quantity controls disabled when out of stock)
- Cart integration (addItemLocal + openCart called with correct payload on add-to-cart click)
- Loading states (button disabled and spinner shown while cart isLoading)
- Badge rendering in RelatedProducts
- Carousel product cap (max 6 rendered)
- Carousel scroll (scrollBy called on prev/next)

## Run Command

```bash
pnpm --filter=storefront test
```
