# TASK-163: Payload CMS · Homepage Content · Backend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Completed |
| **Priority** | — |
| **Sprint** | — |
| **Story Points** | — |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-05-05 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-05-05 |

---

## Description
Define the Payload CMS v3 Global schema for the Homepage Content singleton document. The global must include: hero headline (text, required), hero subtext (textarea), marquee items (array of text strings for the announcement bar), featured collection title (text), and featured collection handle (text, links to a Medusa collection). Live Preview must be enabled so editors can see real-time changes before saving. An `afterChange` hook fires an ISR revalidation request to the storefront whenever the global is saved, triggering a homepage re-render without a full deploy.

---

## Sub Tasks
- [ ] Create `apps/cms/src/globals/HomepageContent.ts` — define the Payload Global with all fields: hero headline (required text), hero subtext (textarea), marquee items (array field with text rows), featured collection title (text), featured collection handle (text)
- [ ] Enable Live Preview on the global — configure `preview` URL pointing to the storefront homepage with the Payload preview token
- [ ] Create `apps/cms/src/hooks/revalidateHomepage.ts` — `afterChange` hook that POSTs `{ type: "homepage" }` to `STOREFRONT_URL/api/revalidate` with `REVALIDATE_SECRET` header
- [ ] Register `HomepageContent` global in `apps/cms/payload.config.ts` under the `globals` array
- [ ] Verify `apps/storefront/src/app/api/revalidate/route.ts` accepts the `homepage` type and calls `revalidatePath('/')` (create or modify as needed)
- [ ] Confirm the global is accessible via Payload REST at `GET /api/globals/homepage-content`
- [ ] Add access control: public read, authenticated write (editors only)

---

## Acceptance Criteria
- [ ] Payload Admin shows a "Homepage Content" global in the left nav under Globals
- [ ] All fields render correctly in the admin UI: hero headline input, subtext textarea, marquee items repeatable row, featured collection title and handle inputs
- [ ] Hero headline field is required — saving without it shows a validation error in the admin
- [ ] Marquee items array allows adding, reordering, and removing text rows
- [ ] Live Preview opens the storefront homepage in the Payload iframe and updates on field change
- [ ] Saving the global triggers `revalidateHomepage` hook which POSTs to the storefront ISR revalidation endpoint
- [ ] ISR revalidation endpoint returns `{ revalidated: true }` and storefront homepage cache is busted
- [ ] `GET /api/globals/homepage-content` returns correct JSON shape with all defined fields
- [ ] Unauthenticated read returns data; unauthenticated write returns 401
- [ ] TypeScript strict mode — no `any` types in schema or hook files

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/cms/src/globals/HomepageContent.ts
apps/cms/src/hooks/revalidateHomepage.ts
apps/cms/payload.config.ts (modified — register HomepageContent global)
apps/storefront/src/app/api/revalidate/route.ts (create or modify — handle homepage type)
```

---

## API Endpoints
- `GET /api/globals/homepage-content` — Payload REST: fetch homepage global data
- `POST /api/revalidate` — Storefront ISR: triggered by afterChange hook on save

---

## UI Screens
- **—**

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-164 (Integration Testing), TASK-166 (Backend Unit Tests)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Payload CMS — Homepage Content/TASK-163 — Payload CMS · Homepage Content · Backend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| — | No updates yet |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
