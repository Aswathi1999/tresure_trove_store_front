# TASK-050: Storefront · Customer Account · Frontend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Done |
| **Priority** | — |
| **Sprint** | — |
| **Story Points** | — |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | — |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-23 |

---

## Description
Build all customer account screens for the Storefront (Next.js 15). This includes the account dashboard, order history list, order detail and status tracking, address book management, wishlist, profile settings, and the edit profile form. All screens must be fully functional UI using "use client" components with React Hook Form + Zod for forms, and Tailwind CSS v4 for styling. No real API calls yet — use mock data from `apps/storefront/src/lib/account.mock.ts` that will be replaced in TASK-052.

---

## Sub Tasks
- [x] Create mock data file (`account.mock.ts`) with orders, addresses, wishlist, and profile data
- [x] Build `AccountNav` sidebar component with links to all account sections
- [x] Build Account Dashboard page — summary cards for recent orders, saved addresses, wishlist count
- [x] Build Order History page — paginated list of past orders with status badges and date
- [x] Build Order Detail & Status page — line items, shipping info, order status timeline
- [x] Build Address Book page — list of saved addresses with add, edit, delete actions
- [x] Build Add/Edit Address form — React Hook Form + Zod validation for all address fields
- [x] Build Wishlist page — product grid of saved items with remove action
- [x] Build Profile Settings page — display name, email, and phone with edit toggle
- [x] Build Edit Profile form — React Hook Form + Zod validation, loading and error states
- [x] Add `data-testid` attributes to all interactive elements across all screens
- [x] Protect all account routes — redirect to login if no JWT cookie (server-side guard in layout)

---

## Acceptance Criteria
- [x] Account Dashboard renders summary cards: recent orders count, saved addresses count, wishlist item count
- [x] Order History page renders a list of orders with order number, date, total, and status badge
- [x] Order Detail page renders full line items, quantities, unit prices, shipping address, and a status timeline
- [x] Address Book page lists all saved addresses with Edit and Delete action buttons per address
- [x] Add/Edit Address form validates all required fields (name, phone, line 1, city, state, pin, country) with inline errors
- [x] Wishlist page renders a product grid with item image, name, price, and a Remove button
- [x] Profile Settings page shows current name, email, and phone with an Edit Profile button
- [x] Edit Profile form validates required fields and shows loading spinner on submit
- [x] All screens are mobile-first and responsive using Tailwind CSS v4
- [x] `AccountNav` is present and highlights the active route on all account pages
- [x] All client components are marked `"use client"` — account pages themselves remain Server Components passing mock data as props
- [x] All interactive elements have `data-testid` attributes

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/storefront/src/app/account/page.tsx
apps/storefront/src/app/account/orders/page.tsx
apps/storefront/src/app/account/orders/[id]/page.tsx
apps/storefront/src/app/account/addresses/page.tsx
apps/storefront/src/app/account/wishlist/page.tsx
apps/storefront/src/app/account/settings/page.tsx
apps/storefront/src/components/account/AccountNav.tsx
apps/storefront/src/lib/account.mock.ts
```

---

## API Endpoints
N/A — this task has no real API endpoints; all data is mocked

---

## UI Screens
- **Account Dashboard** — summary cards for orders, addresses, wishlist
- **Order History** — paginated order list with status badges
- **Order Detail & Status** — line items, shipping info, status timeline
- **Address Book** — saved address list with add, edit, delete
- **Wishlist** — product grid with remove action
- **Profile Settings** — name, email, phone display with edit button
- **Edit Profile form** — form overlay with validation

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-052, TASK-053

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Customer Account/TASK-050 — Storefront · Customer Account · Frontend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-23 | All 13 files created. Mock data, AccountNav (desktop sidebar + mobile horizontal scroll), layout with server-side auth guard, dashboard, order history, order detail with timeline, address book with add/edit/delete, wishlist grid with remove, and profile settings with edit form. All data-testid attributes in place. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
