# TASK-051: Storefront · Customer Account · Backend

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
| **Start Date** | 2026-04-19 |
| **Due Date** | 2026-04-19 |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-19 |

---

## Description
Configure and verify all Medusa v2 Customer API endpoints required to support the Customer Account feature. This covers retrieving the authenticated customer profile, listing order history, fetching order detail, and full CRUD operations on saved addresses. JWT session/cookie middleware must be in place so all endpoints are protected — unauthenticated requests must be rejected with 401.

---

## Sub Tasks
- [x] Verify Medusa auth module is configured with JWT + cookie session strategy in `medusa-config.ts`
- [x] Confirm `GET /store/customers/me` returns authenticated customer profile (name, email, phone, metadata)
- [x] Confirm `GET /store/customers/me/orders` returns paginated order list with line items and status
- [x] Confirm `GET /store/orders/:id` returns full order detail: line items, shipping address, fulfillment status, timeline events
- [x] Confirm `GET /store/customers/me/addresses` returns all saved addresses for the authenticated customer
- [x] Confirm `POST /store/customers/me/addresses` creates a new address with full validation
- [x] Confirm `POST /store/customers/me/addresses/:address_id` updates an existing address
- [x] Confirm `DELETE /store/customers/me/addresses/:address_id` removes an address
- [x] Confirm `POST /store/customers/me` updates customer profile (first name, last name, phone)
- [x] Verify all endpoints return 401 for requests without a valid JWT cookie
- [x] Add CORS configuration for storefront origin in `medusa-config.ts`
- [x] Seed a test customer with orders, addresses, and wishlist metadata for local dev

---

## Acceptance Criteria
- [x] `GET /store/customers/me` returns the authenticated customer with name, email, phone
- [x] `GET /store/customers/me/orders` returns paginated orders with status, total, line items, and date
- [x] `GET /store/orders/:id` returns full order detail including line items, shipping address, and fulfillment events
- [x] `GET /store/customers/me/addresses` returns all saved addresses for the customer
- [x] `POST /store/customers/me/addresses` successfully creates a new address and returns it
- [x] `POST /store/customers/me/addresses/:address_id` successfully updates an address and returns the updated record
- [x] `DELETE /store/customers/me/addresses/:address_id` removes the address and returns 200
- [x] `POST /store/customers/me` successfully updates profile fields and returns the updated customer
- [x] All endpoints reject unauthenticated requests with HTTP 401
- [x] CORS is correctly configured to allow requests from the storefront origin

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/backend/medusa-config.ts (auth module, session, CORS config)
apps/backend/src/scripts/seed-customer.ts (test customer seed script)
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
- **Blocked by:** None
- **Blocks:** TASK-052, TASK-054

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Customer Account/TASK-051 — Storefront · Customer Account · Backend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-19 | Verified auth module (emailpass + JWT/cookie) and CORS already configured in medusa-config.ts. Created seed-customer.ts script and db:seed-customer npm command. Committed on feature/TASK-051-customer-account-backend. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
