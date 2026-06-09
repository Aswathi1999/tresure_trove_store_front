# TASK-195: Storefront · NeoDove CRM Integration · Server Actions

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | 🔲 To Do |
| **Priority** | P1 |
| **Sprint** | Sprint 2 |
| **Story Points** | 3 |
| **PRD Reference** | — |
| **Architecture Ref** | harness/architecture.md |
| **Start Date** | — |
| **Due Date** | — |
| **Created** | 2026-06-01 |
| **Completed** | — |

---

## Description

Add two Next.js Server Actions that push customer-initiated inquiry events directly to NeoDove CRM:

1. **Contact inquiry** — when a customer submits the general contact form, create a standard NeoDove lead.
2. **Price-on-request inquiry** — when a customer submits a price-on-request form for a specific product, create a high-priority NeoDove lead that includes the product name and handle.

Both actions call the NeoDove API server-side using `NEODOVE_API_KEY` (never `NEXT_PUBLIC_`). The backend NeoDove client module (TASK-194) is intentionally not shared — storefront actions call the NeoDove API directly via `fetch` to keep the two apps decoupled.

---

## Sub Tasks

- [ ] Create `apps/storefront/src/actions/contact-inquiry.ts` — parse and validate form data with Zod; call NeoDove `POST /leads` with contact details; return `{ success: true }` or `{ success: false, error: string }`
- [ ] Create `apps/storefront/src/actions/price-inquiry.ts` — same pattern; include `productHandle` and `productTitle` in `customFields`; set lead priority to `HIGH`
- [ ] Wire `contact-inquiry` action into the existing contact form component
- [ ] Wire `price-inquiry` action into the existing price-on-request form component
- [ ] Add `NEODOVE_API_KEY` and `NEODOVE_API_BASE_URL` to `apps/storefront/.env.example`

---

## Acceptance Criteria

- [ ] Submitting the contact form creates a NeoDove lead with the customer's name, email, and phone
- [ ] Submitting the price-on-request form creates a high-priority NeoDove lead with the product name included in `customFields`
- [ ] `NEODOVE_API_KEY` has no `NEXT_PUBLIC_` prefix — it is never exposed to the browser
- [ ] Both actions return structured `{ success, error }` responses — no unhandled thrown errors
- [ ] All new env vars are documented in `apps/storefront/.env.example`
- [ ] No `any` type in any new file — use `unknown` with Zod parsing

---

## Technical Notes

### Server Action Pattern

```typescript
// apps/storefront/src/actions/contact-inquiry.ts
'use server'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(1),
})

export async function submitContactInquiry(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: 'Invalid form data' }

  const res = await fetch(`${process.env.NEODOVE_API_BASE_URL}/leads`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NEODOVE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ /* mapped payload */ }),
  })

  if (!res.ok) return { success: false, error: 'CRM submission failed' }
  return { success: true }
}
```

### Why not reuse the backend NeoDove client?

The backend NeoDove client lives in `apps/backend/src/modules/neodove/`. Importing it in the storefront would create a cross-app dependency, which violates the monorepo architecture rules (`packages/*` depends on nothing in `apps/*`). Keeping a thin `fetch` call in each action is the correct pattern here.

---

## Files to Create/Modify

```
apps/storefront/src/actions/contact-inquiry.ts   ← CREATE
apps/storefront/src/actions/price-inquiry.ts     ← CREATE
apps/storefront/.env.example                     ← MODIFY (add NEODOVE_API_KEY, NEODOVE_API_BASE_URL)
```

Wire into existing form components (identify paths when implementing):
```
apps/storefront/src/components/contact/ContactForm.tsx    ← MODIFY
apps/storefront/src/components/product/PriceInquiryForm.tsx ← MODIFY (or create if not yet built)
```

---

## API Endpoints

N/A — outbound only; no new HTTP routes on the storefront.

---

## UI Screens

- **Contact Form** — existing form; add loading state and inline success/error feedback after action returns
- **Price-on-Request Form** — existing or new form on PDP; same loading + feedback pattern

---

## Environment Variables

| Variable | Location | Notes |
|----------|----------|-------|
| `NEODOVE_API_KEY` | `apps/storefront/.env.local` | Server-only — never `NEXT_PUBLIC_` |
| `NEODOVE_API_BASE_URL` | `apps/storefront/.env.local` | Default: `https://api.neodove.com` |

---

## Related Test Cases

- TASK-197 — Storefront · NeoDove CRM Integration · Frontend Unit Tests *(create next)*

---

## Dependencies

- **Blocked by:** TASK-194 (NeoDove API key confirmed), NeoDove API docs for exact endpoint shape
- **Blocks:** TASK-197 (unit tests)
- **Related:** TASK-194 — Backend · NeoDove CRM Integration · Backend

---

## Claude Code Context

```
harness/claude.md
harness/tasks/194 — Backend — NeoDove CRM Integration/TASK-195 — Storefront · NeoDove CRM Integration · Server Actions.md
harness/architecture.md
apps/storefront/src/actions/
apps/storefront/src/components/
```

---

## Progress Log

| Date | Update |
|------|--------|
| 2026-06-01 | Task created. Identify exact contact form and PDP price-inquiry component paths before implementing — check `apps/storefront/src/components/` for existing form components. |

---

## Time Log

| Date | Hours | Note |
|------|-------|------|
| — | — | — |

---

## Review Notes

- **—**
