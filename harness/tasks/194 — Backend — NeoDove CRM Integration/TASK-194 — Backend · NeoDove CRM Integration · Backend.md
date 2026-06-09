# TASK-194: Backend · NeoDove CRM Integration · Backend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Completed |
| **Priority** | P1 |
| **Sprint** | Sprint 2 |
| **Story Points** | 5 |
| **PRD Reference** | — |
| **Architecture Ref** | harness/architecture.md |
| **Start Date** | 2026-06-01 |
| **Due Date** | — |
| **Created** | 2026-06-01 |
| **Completed** | 2026-06-01 |

---

## Description

Integrate NeoDove CRM into the Medusa backend so sales agents can follow up on high-intent customer events via calls, WhatsApp, and SMS. Luxury furniture has a high average order value where human touchpoints materially improve conversion.

This task covers the backend half of the integration: a typed NeoDove API client, Medusa event subscribers, and a scheduled abandoned-cart cron job.

**Storefront server actions (contact form, price inquiry) are covered in TASK-195.**

---

## Sub Tasks

- [ ] Create `apps/backend/src/modules/neodove/types.ts` — typed interfaces for `NeoDoveLeadPayload`, `NeoDoveContactPayload`, and API responses
- [ ] Create `apps/backend/src/modules/neodove/client.ts` — `NeoDoveClient` class with `createLead()` and `createContact()` methods using native `fetch`
- [ ] Create `apps/backend/src/subscribers/neodove-order.ts` — listen to `order.placed`; skip if total < `NEODOVE_HIGH_VALUE_THRESHOLD`; call `client.createLead()`
- [ ] Create `apps/backend/src/subscribers/neodove-customer.ts` — listen to `customer.created`; call `client.createContact()`
- [ ] Create `apps/backend/src/subscribers/neodove-delivery.ts` — listen to `order.fulfillment_delivered`; call `client.createLead()` with `tags: ['post-delivery']`
- [ ] Create `apps/backend/src/jobs/abandoned-cart.ts` — Medusa scheduled job (hourly); query carts >1hr old with no completed order; push each to NeoDove with `tags: ['abandoned-cart']`; store `neodove_lead_pushed_at` in cart metadata to prevent duplicates
- [ ] Add `NEODOVE_API_KEY`, `NEODOVE_API_BASE_URL`, `NEODOVE_HIGH_VALUE_THRESHOLD` to `apps/backend/.env.example`

---

## Acceptance Criteria

- [ ] Placing a Medusa order ≥ ₹50,000 creates a NeoDove lead within 5 seconds
- [ ] Placing an order < ₹50,000 does NOT create a NeoDove lead
- [ ] A new customer registration creates a NeoDove contact
- [ ] A delivered order creates a post-sales follow-up lead tagged `post-delivery`
- [ ] Abandoned cart job does not create duplicate leads for the same cart
- [ ] `NeoDoveClient` is fully typed — no `any`, all methods return typed responses
- [ ] Winston logger used for all errors — no `console.log`
- [ ] All new env vars documented in `apps/backend/.env.example`
- [ ] All prices sent to NeoDove `customFields` are in rupees (divide Medusa paise values by 100)

---

## Technical Notes

### NeoDove API Client Pattern

```typescript
// apps/backend/src/modules/neodove/client.ts
export class NeoDoveClient {
  private readonly baseUrl: string
  private readonly apiKey: string

  constructor() {
    this.baseUrl = process.env.NEODOVE_API_BASE_URL ?? 'https://api.neodove.com'
    this.apiKey = process.env.NEODOVE_API_KEY ?? ''
  }

  async createLead(payload: NeoDoveLeadPayload): Promise<NeoDoveLeadResponse> {
    // fetch with Bearer auth; log errors via Winston, never throw to caller
  }

  async createContact(payload: NeoDoveContactPayload): Promise<NeoDoveContactResponse> {
    // same pattern
  }
}
```

### High-Value Threshold

`NEODOVE_HIGH_VALUE_THRESHOLD` defaults to `5000000` (paise = ₹50,000). Allows tuning without a deploy.

### Abandoned Cart Deduplication

Store `neodove_lead_pushed_at` in `cart.metadata`. Before pushing, check if this key exists. This prevents re-pushing the same cart on repeated cron ticks.

### Subscriber Idempotency

Order and customer subscribers do not require explicit deduplication — NeoDove campaign-level deduplication handles those. Only the abandoned-cart job needs code-level dedup.

---

## Files to Create/Modify

```
apps/backend/src/modules/neodove/types.ts        ← CREATE
apps/backend/src/modules/neodove/client.ts       ← CREATE
apps/backend/src/subscribers/neodove-order.ts    ← CREATE
apps/backend/src/subscribers/neodove-customer.ts ← CREATE
apps/backend/src/subscribers/neodove-delivery.ts ← CREATE
apps/backend/src/jobs/abandoned-cart.ts          ← CREATE
apps/backend/.env.example                        ← MODIFY (add NeoDove vars)
```

---

## API Endpoints

N/A — this task creates no new HTTP endpoints; all communication is outbound to NeoDove.

---

## UI Screens

N/A

---

## Environment Variables

| Variable | Location | Notes |
|----------|----------|-------|
| `NEODOVE_API_KEY` | `apps/backend/.env` | NeoDove API key from dashboard → Settings → API |
| `NEODOVE_API_BASE_URL` | `apps/backend/.env` | Default: `https://api.neodove.com` |
| `NEODOVE_HIGH_VALUE_THRESHOLD` | `apps/backend/.env` | Default: `5000000` (paise = ₹50,000) |

---

## Related Test Cases

- TASK-196 — Backend · NeoDove CRM Integration · Backend Unit Tests *(create next)*

---

## Dependencies

- **Blocked by:** NeoDove API key and base URL from NeoDove dashboard
- **Blocks:** TASK-195 (shares the same NeoDove API key), TASK-196 (unit tests)
- **Related:** TASK-195 — Storefront · NeoDove CRM Integration · Server Actions

---

## Claude Code Context

```
harness/claude.md
harness/tasks/194 — Backend — NeoDove CRM Integration/TASK-194 — Backend · NeoDove CRM Integration · Backend.md
harness/architecture.md
apps/backend/src/modules/
apps/backend/src/subscribers/
apps/backend/src/jobs/
apps/backend/medusa-config.ts
```

---

## Progress Log

| Date | Update |
|------|--------|
| 2026-06-01 | Task created. Verify exact NeoDove endpoint paths and auth scheme (Bearer vs API-key header) from NeoDove API docs before implementing `client.ts`. Also confirm `order.fulfillment_delivered` event name in Medusa v2 event catalog. |

---

## Time Log

| Date | Hours | Note |
|------|-------|------|
| — | — | — |

---

## Review Notes

- **—**
