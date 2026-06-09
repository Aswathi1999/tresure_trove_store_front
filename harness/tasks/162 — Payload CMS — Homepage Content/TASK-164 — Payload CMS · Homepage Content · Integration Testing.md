# TASK-164: Payload CMS · Homepage Content · Integration Testing

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
| **Completed** | 2026-05-06 |

---

## Description
Wire the real Payload REST API (`GET /api/globals/homepage-content`) into the storefront homepage, replacing the mock. Test full ISR revalidation flow end-to-end — editor saves in Payload Admin, afterChange hook fires, storefront cache busts, and the updated homepage re-renders. Playwright E2E tests cover the homepage render with live data and the revalidation cycle.

---

## Sub Tasks
- [ ] No sub tasks defined

---

## Acceptance Criteria
- [ ] No criteria defined

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
—
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
- **Blocked by:** TASK-162 (Frontend), TASK-163 (Backend)
- **Blocks:** TASK-167 (Frontend Performance Testing), TASK-168 (Backend Performance Testing), TASK-169 (Security & Vulnerability Testing)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Payload CMS — Homepage Content/TASK-164 — Payload CMS · Homepage Content · Integration Testing.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-05-06 | Completed. Real Payload API already wired (`getHeroContent`, `getMarqueeText`, `getBlogPreviews`, `getBrandPhilosophy` from `@/lib/payload` with graceful null/[] fallbacks). ISR webhook route handles `homepage` type → `revalidatePath('/')`. Fixed 5 E2E test bugs: (1) trust strip strict-mode violation — `getByText('Free Shipping')` matches 2 elements (desktop span + mobile p); fixed with `.first()`; (2) category tiles count — `[data-testid^="category-tile-"]` matched 16 (desktop + mobile), fixed with `:not([data-testid*="mobile"])` selector; (3,4) ISR webhook response property name was `paths` (array) not `path` (singular), and blog paths are `/journal/...` not `/blog/...`; (5) same trust strip fix in CMS-unavailable test. Final: 20 passed, 1 gracefully skipped (brand philosophy, CMS-dependent). |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-05-06 | 0.75 | E2E test fixes (5 bugs), verification run |

---

## Review Notes
- **—**
