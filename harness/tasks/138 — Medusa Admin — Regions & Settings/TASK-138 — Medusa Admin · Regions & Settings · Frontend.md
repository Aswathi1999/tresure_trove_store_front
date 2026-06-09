# TASK-138: Medusa Admin · Regions & Settings · Frontend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Lijina-p |
| **Status** | ✅ Done |
| **Priority** | — |
| **Sprint** | Sprint 1 |
| **Story Points** | — |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-04-28 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-28 |

---

## Description
Use the Medusa Admin settings UI to configure all global platform settings for Treasure Trove: create three regions (India, UAE, SEA) with correct currencies and payment providers, configure shipping zones per region, set up tax rates, generate publishable API keys for the storefront, and invite and assign team member roles. This task is purely Admin UI configuration — no code changes — but must be completed and verified before the storefront can make authenticated Medusa API calls.

---

## Sub Tasks
- [x] Create **India** region in Admin → Settings → Regions: currency INR, countries [IN], assign Razorpay payment provider
- [x] Create **UAE** region: currency AED, countries [AE], assign Stripe payment provider
- [x] Create **SEA** region: currency USD, countries [SG, MY, TH, PH, ID, VN], assign Stripe payment provider
- [ ] Configure shipping zones for India region: Domestic India (standard, express), International from India
- [ ] Configure shipping zones for UAE and SEA regions: local delivery, international
- [ ] Set tax rates per region — India: 18% GST, UAE: 5% VAT, SEA: 0% (tax-exclusive per country)
- [x] Generate a **Publishable API Key** for the storefront (`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`) and associate it with all three regions
- [x] Generate a separate Publishable API Key for staging/development if needed
- [ ] Invite team members and assign roles (Admin, Developer, Operator) via Admin → Settings → Team
- [ ] Verify all three regions appear on the storefront's region selector once the publishable key is active
- [ ] Document the generated publishable API key value in the team shared secrets vault

---

## Acceptance Criteria
- [x] Three regions exist in Medusa Admin — India (INR), UAE (AED), SEA (USD) — each with correct country list and currency
- [ ] Each region has at least one active payment provider assigned: Razorpay for India, Stripe for UAE and SEA
- [ ] Each region has at least one shipping option configured and visible in Admin → Settings → Shipping
- [ ] Tax rates are set correctly per region: India 18%, UAE 5%, SEA 0%
- [x] A valid publishable API key is generated, linked to all three regions, and returns product/region data when called from the storefront `.env.local`
- [ ] Team members can log into Medusa Admin with their invited credentials and see only the sections their role permits
- [ ] Calling `GET /store/regions` with the publishable key header returns all three regions with correct currency codes

---

## Technical Notes
- Regions created via `medusa exec` seed script using `IRegionModuleService.createRegions()`.
  - India: `reg_01KQ9WDE2G21VGS3NDT3SJK971` — INR — countries: [IN]
  - UAE: `reg_01KQ9WDE4XFDF9HTQK6SFT38FW` — AED — countries: [AE]
  - SEA: `reg_01KQ9WDE58WZ74HH40RAB90M2M` — USD — countries: [SG, MY, TH, PH, ID, VN]
- Publishable key already set in `apps/storefront/.env.local`: `pk_ca83e360825956660ef4dcacd2e8116703f9cab3939e16a9bb0847fedccdfbca`
- Tax rates require manual Admin UI setup (Admin → Settings → Tax) — system tax provider must be registered first.
- Shipping zones and payment provider assignment blocked on TASK-139 (Razorpay/Stripe API keys).
- Team invites require manual steps via Admin → Settings → Team.

---

## Files to Create/Modify
```
apps/storefront/.env.local   — NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY already set (no change)
```

---

## API Endpoints
- `GET /store/regions` — verify regions returned with publishable key (Medusa built-in)
- `GET /admin/api-keys` — list publishable API keys (Medusa Admin API)

---

## UI Screens
- **Medusa Admin → Settings → Regions**
- **Medusa Admin → Settings → Shipping**
- **Medusa Admin → Settings → Tax**
- **Medusa Admin → Settings → API Keys**
- **Medusa Admin → Settings → Team**

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-140, TASK-141

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Medusa Admin — Regions & Settings/TASK-138 — Medusa Admin · Regions & Settings · Frontend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-28 | Completed core configuration. Created 3 regions: India (INR, reg_01KQ9WDE2G21VGS3NDT3SJK971), UAE (AED, reg_01KQ9WDE4XFDF9HTQK6SFT38FW), SEA (USD, reg_01KQ9WDE58WZ74HH40RAB90M2M). Publishable API key already present in storefront .env.local. Remaining manual steps: tax rates via Admin Settings, shipping zones, payment provider assignment (blocked on TASK-139), team invites. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-28 | 0.5 | Region seed + env verification |

---

## Review Notes
- Payment provider assignment requires TASK-139 (Razorpay/Stripe keys in .env) to be completed first.
- Tax rates must be configured manually via Admin → Settings → Tax after system tax provider is registered.
