# TASK-026: Storefront · Product Detail Page · Frontend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | athulgopal-adviciya |
| **Status** | ✅ Done |
| **Priority** | — |
| **Sprint** | — |
| **Story Points** | — |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-04-23 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-23 |

---

## Description
Build the full Product Detail Page (PDP) for the Treasure Trove storefront, including a multi-image gallery with zoom, a variant selector for material, size, and finish with real-time price updates, a stock availability indicator, add-to-cart CTA, material story link sourced from Payload CMS, a related products carousel, and JSON-LD structured data for SEO. All data is served via mock functions — no real Medusa SDK or Payload REST calls. Use Framer Motion for gallery and carousel transitions. Cart state is managed via Zustand.

---

## Sub Tasks
- [x] Mock product detail function (getProductByHandle — returns product with variants, images, related products)
- [x] Mock material story fetch function (getMaterialStory — returns link/excerpt from Payload)
- [x] ImageGallery component (thumbnail strip, main image, zoom on hover/click, Framer Motion transitions)
- [x] VariantSelector component (material, size, finish selectors; updates active variant in state)
- [x] Real-time price display — updates when variant selection changes
- [x] StockIndicator component (in stock, low stock, out of stock states)
- [x] AddToCartButton component (adds selected variant to Zustand cart store, loading state)
- [x] MaterialStoryLink component (link to material story page, pulled from mock Payload data)
- [x] RelatedProducts carousel component (horizontal scroll, Framer Motion, uses ProductCard)
- [x] JSON-LD structured data block (Product schema injected via next/head or metadata API)
- [x] Out of Stock state (CTA disabled, message displayed)
- [x] Product Not Found 404 state (notFound() called)
- [x] Product Unpublished/Removed state (graceful fallback or redirect)

---

## Acceptance Criteria
- [x] ImageGallery renders all product images as thumbnails; clicking a thumbnail updates the main image with a Framer Motion crossfade
- [x] Main image supports zoom on hover (desktop) and pinch-to-zoom gesture on mobile
- [x] VariantSelector renders all available options for material, size, and finish; unavailable combinations are visually disabled
- [x] Selecting a variant combination updates the displayed price in real time from the mock variant data
- [x] StockIndicator shows "In Stock", "Only N left", or "Out of Stock" based on mock inventory value
- [x] AddToCartButton adds the selected variant to the Zustand cart store and shows a loading spinner during the mock async call
- [x] MaterialStoryLink renders a link and excerpt only when mock Payload data is present; renders nothing if absent
- [x] RelatedProducts carousel shows up to 6 products using the ProductCard component, scrollable horizontally
- [x] JSON-LD Product schema is rendered in the `<head>` with name, description, image, price, and availability fields
- [x] Out of Stock state disables the AddToCartButton and shows "Currently unavailable" message
- [x] Product Not Found 404 triggers Next.js `notFound()` when mock returns null
- [x] All interactive elements have `data-testid` attributes
- [x] Page is an ISR Server Component with `export const revalidate = 60`; variant/cart interactions are `"use client"`

---

## Technical Notes
- `addItemLocal` added to Zustand cart store for mock-safe cart adds without requiring Medusa backend. Real `addItem` (Medusa-backed) remains intact for production.
- `VariantSelector` is the smart client container — owns selected material/size/finish state, computes active variant, and renders `StockIndicator` + `AddToCartButton` as controlled children.
- Finish colour swatches use `style={{ backgroundColor }}` — justified exception for data-driven dynamic colours that cannot be expressed as static Tailwind classes.
- `polished-silver / M` variant intentionally set to `inventory: 0, available: false` to exercise the Out of Stock flow during testing.
- Design follows "The Modern Heirloom" system: CSS variables (`--color-tt-*`), Mulish font, Tailwind utilities only, no inline styles except swatch colours.

---

## Files Created / Modified
```
apps/storefront/src/app/products/[handle]/page.tsx          ← new — ISR page (revalidate = 60)
apps/storefront/src/components/pdp/ImageGallery.tsx         ← new
apps/storefront/src/components/pdp/VariantSelector.tsx      ← new
apps/storefront/src/components/pdp/AddToCartButton.tsx      ← new
apps/storefront/src/components/pdp/RelatedProducts.tsx      ← new
apps/storefront/src/components/pdp/MaterialStoryLink.tsx    ← new
apps/storefront/src/components/pdp/StockIndicator.tsx       ← new
apps/storefront/src/lib/mock/product-detail.ts              ← new
apps/storefront/src/lib/mock/material-story.ts              ← new
apps/storefront/src/stores/cart.ts                          ← modified (addItemLocal added)
```

---

## API Endpoints
N/A — this task has no real API endpoints (mock only)

---

## UI Screens
- Product Detail Page (main)
- Image Gallery (thumbnail + zoom)
- Variant Selector
- Material Story Link
- Related Products Carousel
- Out of Stock State
- Product Not Found 404
- Product Unpublished/Removed

---

## Related Test Cases
— (Covered by TASK-029 — Frontend Unit Tests)

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-028 (Integration Testing), TASK-029 (Frontend Unit Tests)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Product Detail Page/TASK-026 — Storefront · Product Detail Page · Frontend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-23 | Task started and completed in full. All 9 new files created, cart store modified. TypeScript type-check passes with zero errors. All acceptance criteria met. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-23 | — | Full implementation — mock data, 6 PDP components, ISR page, cart store update |

---

## Review Notes
- Route: `/products/halden-brass-pendant-lamp` exercises the full page with a live mock product.
- To test 404: navigate to `/products/any-nonexistent-handle`.
- To test Out of Stock: select Polished Silver + M combination in the variant selector.
