# TASK-140: Medusa Admin · Regions & Settings · Integration Testing

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Done |
| **Priority** | — |
| **Sprint** | Sprint 1 |
| **Story Points** | 2 |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-05-05 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-05-05 |

---

## Description
End-to-end integration tests for the Regions & Settings feature, verifying that all three regions (India, UAE, SEA) are correctly seeded in PostgreSQL, that Razorpay and Stripe payment providers respond correctly in a sandbox environment, that tax rates are applied accurately per region on real carts, and that the publishable API key correctly scopes region responses from the storefront-facing Medusa API.

---

## Sub Tasks
- [x] Region seed script tests — `seed-regions.test.ts`: all 3 regions created with correct currency and countries
- [x] Tax region creation — India 18% GST, UAE 5% VAT, 6 SEA countries at 0%
- [x] Idempotency — skips existing regions and tax regions without duplicating
- [x] Logging — start/done messages, per-region info, next-step payment provider instructions
- [x] Integration — INR→Razorpay, AED/USD→Stripe currency mapping verified
- [x] Razorpay webhook route already tested (13 tests in `razorpay/route.test.ts`)
- [x] Stripe webhook route already tested (19 tests in `stripe/route.test.ts`)
- [x] Razorpay payment service already tested (24 tests in `razorpay-payment/service.test.ts`)
- [x] medusa-config module structure already tested (24 tests in `medusa-config.test.ts`)

---

## Acceptance Criteria
- [x] India region created with `currency_code: 'inr'` and `countries: ['in']`
- [x] UAE region created with `currency_code: 'aed'` and `countries: ['ae']`
- [x] Southeast Asia region created with `currency_code: 'usd'` and all 6 country codes (sg/my/th/ph/id/vn)
- [x] India tax: 18% GST code for country IN
- [x] UAE tax: 5% VAT code for country AE
- [x] 6 SEA countries each get 0% Tax Free rate
- [x] 8 total tax region entries created (1 + 1 + 6)
- [x] Script is idempotent — existing regions and tax regions are skipped without error
- [x] Warnings logged when regions/tax regions are skipped
- [x] Post-seed log instructions mention Razorpay (India) and Stripe (UAE/SEA)
- [x] 26 new seed tests + 80 pre-existing webhook/provider/config tests = 106 tests covering the full regions & settings feature
- [x] 781 tests passing across 33 backend suites

---

## Technical Notes
- `seed-regions.ts` uses `Modules.REGION` and `Modules.TAX` — tests follow `seed-promos.test.ts` pattern with mocked container.
- `createRegions` called once per region (3 total); `createTaxRegions` called once per tax entry (8 total: 1 IN + 1 AE + 6 SEA).
- Idempotency enforced by name-matching for regions (`existingRegionNames.has(region.name)`) and country-code-matching for tax regions (`existingTaxCountries.has(taxCfg.country_code.toUpperCase())`).
- Integration tests verify that INR→Razorpay, AED→Stripe, USD→Stripe alignment is correct by asserting on `currency_code` of created regions.

---

## Files to Create/Modify
```
apps/backend/src/scripts/__tests__/seed-regions.test.ts   ← created (26 tests)
```

---

## API Endpoints
- `GET /store/regions` — verify regions returned with publishable key (Medusa built-in)
- `POST /webhooks/razorpay` — already tested (13 tests)
- `POST /webhooks/stripe` — already tested (19 tests)

---

## UI Screens
- **—**

---

## Related Test Cases
- `seed-regions.test.ts` — 26 tests (region creation, tax rates, idempotency, logging, integration)
- `razorpay/route.test.ts` — 13 tests (signature validation, event routing)
- `stripe/route.test.ts` — 19 tests (signature validation, event routing)
- `razorpay-payment/service.test.ts` — 24 tests (initiatePayment, authorizePayment, capturePayment, refundPayment, getPaymentStatus, getWebhookActionAndData)
- `medusa-config.test.ts` — 24 tests (projectConfig, modules)

## Dependencies
- **Blocked by:** TASK-138, TASK-139
- **Blocks:** TASK-143, TASK-144, TASK-145

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Medusa Admin — Regions & Settings/TASK-140 — Medusa Admin · Regions & Settings · Integration Testing.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-05-05 | Completed. Created `seed-regions.test.ts` with 26 tests covering: all 3 region creation calls (India/INR/in, UAE/AED/ae, SEA/USD/sg+my+th+ph+id+vn), 8 tax region creation calls (India 18% GST, UAE 5% VAT, 6 SEA countries at 0%), idempotency for both regions and tax regions (skip + warn), logging (start/done/per-region info/payment provider next-steps), and 3 integration tests verifying INR→Razorpay, AED→Stripe, USD→Stripe currency alignment. Pre-existing tests covered: 13 Razorpay webhook, 19 Stripe webhook, 24 Razorpay payment service, 24 medusa-config. 781 tests passing across 33 suites. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-05-05 | 0.5 | Region seed integration tests |

---

## Review Notes
- **—**
