# TASK-186: Storefront · Razorpay · Frontend Integration

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Claude |
| **Status** | ✅ Done |
| **Priority** | P0 |
| **Sprint** | Sprint 2 |
| **Story Points** | 5 |
| **PRD Reference** | — |
| **Architecture Ref** | harness/architecture.md |
| **Start Date** | — |
| **Due Date** | — |
| **Created** | 2026-05-26 |
| **Completed** | 2026-05-26 |

---

## Description

Replace the mocked non-COD payment path in `completeOrderAction()` with a real Razorpay checkout flow. The backend Razorpay provider is already fully implemented (custom `AbstractPaymentProvider` module, webhook handler, `medusa-config.ts` registration — see TASK-043). This task is purely frontend: initiate a Razorpay order via Medusa, open the Razorpay checkout modal on the client, and complete the cart after payment authorization.

**Current state:** Any non-COD payment in `apps/storefront/src/actions/checkout.ts:198` returns a synthetic fake order ID (`TT-{year}-{random}`) without touching Razorpay or Medusa. COD is the only real payment path.

**Target state:** UPI, Card, and Net Banking all go through the real Razorpay hosted checkout flow. The modal collects and processes payment; after success the storefront authorizes the payment session with Medusa and completes the cart to get a real order ID.

---

## Sub Tasks

- [ ] Add `NEXT_PUBLIC_RAZORPAY_KEY_ID` to `apps/storefront/.env.example` (published key for the JS SDK — never the secret)
- [ ] Create `apps/storefront/src/lib/razorpay.ts` — typed wrapper around the Razorpay checkout.js window object; export `loadRazorpayScript()` (lazy `<script>` injector returning a promise) and `openRazorpayCheckout(options)` (opens the modal and returns `{razorpay_payment_id, razorpay_order_id, razorpay_signature}` on success or throws on failure/dismiss)
- [ ] Add a new Server Action `initiateRazorpaySession(cartId: string)` in `apps/storefront/src/actions/checkout.ts` — calls `initiateCartPaymentSession(cart, 'pp_razorpay_razorpay')` via the Medusa JS SDK, returns `{ razorpayOrderId, amount, currency, cartId }`
- [ ] Add a new Server Action `authorizeRazorpayPayment(cartId: string, paymentId: string, orderId: string, signature: string)` in `apps/storefront/src/actions/checkout.ts` — calls the Medusa payment authorize endpoint with the three Razorpay callback fields so the backend can verify the HMAC and mark the session as `authorized`
- [ ] Replace the mock branch in `completeOrderAction()` (lines 198–221 in `apps/storefront/src/actions/checkout.ts`) — for INR non-COD payments, call the real initiate → authorize → `completeCart()` flow and map the resulting Medusa order to `MockOrder`; keep the Stripe path as a separate stub (Stripe is out of scope for this task)
- [ ] Update `PaymentStep.tsx` — before calling `completeOrderAction()`, invoke `loadRazorpayScript()` and `openRazorpayCheckout()` to collect the three Razorpay tokens; pass them through to the server action for authorization. Show a loading spinner while the modal is open
- [ ] Handle Razorpay modal dismissal (user closes without paying) — set `paymentError` with "Payment cancelled. Please try again." and reset `processing` state
- [ ] Add `NEXT_PUBLIC_RAZORPAY_KEY_ID` to `apps/storefront/.env.local` documentation comment in `harness/docs/env-setup.md` (if that file exists)

---

## Acceptance Criteria

- [ ] Clicking "Place Order" for UPI / Card / Net Banking opens the real Razorpay checkout modal — not a fake success
- [ ] After successful Razorpay payment the order completion page shows a real Medusa order ID (not `TT-{year}-{random}`)
- [ ] If the user dismisses the Razorpay modal, `PaymentStep` shows "Payment cancelled. Please try again." and the button is re-enabled
- [ ] If payment fails inside the modal, `PaymentStep` shows the error returned by Razorpay and the button is re-enabled
- [ ] COD flow is unaffected — it still uses `pp_system_default` and the existing real path
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` is the only new env var added to the storefront (the secret key never touches the frontend)
- [ ] `loadRazorpayScript()` injects the Razorpay JS script only once even if called multiple times
- [ ] TypeScript strict-mode passes with no `any` — use `unknown` and type guards for the Razorpay window object
- [ ] No Razorpay key or secret is logged or exposed in server responses

---

## Technical Notes

### Razorpay JS Integration Pattern

```typescript
// apps/storefront/src/lib/razorpay.ts

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

export async function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay script'))
    document.body.appendChild(script)
  })
}
```

### Payment flow sequence

```
PaymentStep (client)
  → loadRazorpayScript()                       # inject checkout.js once
  → initiateRazorpaySession(cartId)            # Server Action → Medusa initiates session → returns razorpayOrderId + amount
  → openRazorpayCheckout({ orderId, amount })  # opens Razorpay modal
      ↳ user pays
      ↳ handler(response) receives { razorpay_payment_id, razorpay_order_id, razorpay_signature }
  → authorizeRazorpayPayment(cartId, ...)      # Server Action → Medusa authorizes session (HMAC verified backend-side)
  → completeOrderAction() / completeCart()     # Server Action → Medusa completes cart → real order
  → onSuccess(order)                           # navigate to ConfirmationStep
```

### Medusa payment session initiation

```typescript
// initiateCartPaymentSession is already exported from @/lib/medusa.ts
// Provider ID for Razorpay in this project is 'pp_razorpay_razorpay'
const session = await initiateCartPaymentSession(cart, 'pp_razorpay_razorpay')
// session.data.razorpay_order_id contains the Razorpay order ID
```

### Razorpay authorize endpoint

After the Razorpay modal succeeds, the frontend must tell Medusa to verify and authorize the payment. Call Medusa's payment authorization endpoint:

```
POST /store/payment-collections/{id}/payment-sessions/{session_id}/authorize
Body: { data: { razorpay_payment_id, razorpay_order_id, razorpay_signature } }
```

The Razorpay backend provider's `authorizePayment()` method handles HMAC verification.

### Stripe path

Leave the Stripe branch as a mock stub for now — Stripe frontend integration is a separate task.

---

## Files to Create/Modify

```
apps/storefront/src/lib/razorpay.ts                         ← CREATE  (Razorpay script loader + modal wrapper)
apps/storefront/src/actions/checkout.ts                     ← MODIFY  (add initiateRazorpaySession, authorizeRazorpayPayment; replace mock branch)
apps/storefront/src/components/checkout/PaymentStep.tsx     ← MODIFY  (invoke loadRazorpayScript + openRazorpayCheckout before completeOrderAction)
apps/storefront/.env.example                                ← MODIFY  (add NEXT_PUBLIC_RAZORPAY_KEY_ID=)
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/store/carts/:id/payment-sessions` | Initiate payment session — returns `razorpay_order_id` in session data |
| POST | `/store/payment-collections/:id/payment-sessions/:session_id/authorize` | Authorize payment after Razorpay callback — triggers backend HMAC verification |
| POST | `/store/carts/:id/complete` | Complete cart → place order (already used by COD path) |

---

## UI Screens

- **Payment Step — Razorpay Modal** — native Razorpay hosted checkout modal (UPI, Card, Net Banking tabs)
- **Payment Step — Loading** — spinner state while script loads or modal is processing
- **Payment Step — Cancelled** — "Payment cancelled. Please try again." inline error, button re-enabled
- **Payment Step — Failed** — Razorpay error message inline, retry button
- **Confirmation Step** — unchanged; now receives real Medusa order ID

---

## Environment Variables

| Variable | Location | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `apps/storefront/.env.local` | Razorpay publishable key — safe to expose in browser |
| `RAZORPAY_KEY_ID` | `apps/backend/.env` | Already present in `.env.example` — set to real key |
| `RAZORPAY_KEY_SECRET` | `apps/backend/.env` | Already present in `.env.example` — never in frontend |
| `RAZORPAY_WEBHOOK_SECRET` | `apps/backend/.env` | Already present in `.env.example` |

---

## Related Test Cases

- TASK-187 — Storefront · Razorpay · Integration Testing *(create next)*
- TASK-044 — Storefront · Checkout · Integration Testing *(existing checkout tests will need payment mock updated)*

---

## Dependencies

- **Blocked by:** None — backend Razorpay provider is complete (TASK-043)
- **Blocks:** TASK-187 (Integration Testing for Razorpay flow)
- **Related:** TASK-042 (Checkout Frontend), TASK-043 (Checkout Backend)

---

## Claude Code Context

```
harness/claude.md
harness/tasks/186 — Storefront — Razorpay Payment Integration/TASK-186 — Storefront · Razorpay · Frontend Integration.md
harness/architecture.md
apps/storefront/src/actions/checkout.ts
apps/storefront/src/components/checkout/PaymentStep.tsx
apps/storefront/src/lib/medusa.ts
apps/backend/src/modules/razorpay-payment/service.ts
apps/backend/medusa-config.ts
```

---

## Progress Log

| Date | Update |
|------|--------|
| 2026-05-26 | Task created. Backend Razorpay provider already complete (TASK-043). Frontend mock identified at checkout.ts:198. Ready to implement. |
| 2026-05-26 | Implemented. `lib/razorpay.ts` (script loader + modal wrapper), `initiateRazorpaySession` + `authorizeRazorpayPayment` server actions, real INR flow in `completeOrderAction` (Stripe kept as stub), `PaymentStep` orchestration with dismissal handling, `NEXT_PUBLIC_RAZORPAY_KEY_ID` in `.env.example`. **Spec deviation:** the authorize endpoint in this doc (`/store/payment-collections/:id/payment-sessions/:session_id/authorize`) does not exist in Medusa 2.13.6, so added a thin backend route `POST /store/carts/:id/payment-authorize` that merges the modal tokens into the Razorpay session and authorizes it via the Payment module (provider verifies HMAC). Storefront type-check clean; TC-044 rewritten (15/15 green). Live runtime verification still needs a real `NEXT_PUBLIC_RAZORPAY_KEY_ID` + backend Razorpay keys. Note: backend provider's `initiatePayment` passes the amount to Razorpay without ×100 minor-unit conversion — flagged for TASK-043/187 follow-up. |

---

## Time Log

| Date | Hours | Note |
|------|-------|------|
| — | — | — |

---

## Review Notes

- **—**
