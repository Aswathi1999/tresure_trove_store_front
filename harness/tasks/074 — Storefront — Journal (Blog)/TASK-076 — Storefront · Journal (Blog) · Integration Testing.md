# TASK-076: Storefront · Journal (Blog) · Integration Testing

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Done |
| **Priority** | — |
| **Sprint** | Sprint 1 |
| **Story Points** | — |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-04-29 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-29 |

---

## Description
Wire the Journal pages to the real Payload CMS REST API, replacing mock data from TASK-074 with live calls implemented in TASK-075. Write Playwright E2E tests covering blog listing, post detail rich text rendering, related posts, the ISR revalidation webhook, and the post-not-found 404 edge case.

---

## Sub Tasks
- [x] Wire `apps/storefront/src/app/journal/page.tsx` to real `getPosts()` from `payload.ts`
- [x] Wire `apps/storefront/src/app/journal/[slug]/page.tsx` to real `getPostBySlug()` / `getPosts()` from `payload.ts`
- [x] Update `generateStaticParams` to fetch slugs from Payload (returns `[]` on failure for on-demand ISR)
- [x] Update `PostCard.tsx` to accept `BlogPost` from `@TreasureTrove/types` (resolve `coverImage`, format `publishedAt`)
- [x] Update `PostDetail.tsx` to accept `BlogPost` (cast `content: unknown` to `LexicalContent`)
- [x] Update `RelatedPosts.tsx` to accept `BlogPost[]`
- [x] Write Playwright E2E tests — blog listing, post detail, rich text, related posts, webhook, 404

---

## Acceptance Criteria
- [x] Journal listing page fetches real posts from Payload CMS via `getPosts()`
- [x] Post detail page fetches real post via `getPostBySlug(slug)` and calls `notFound()` on null
- [x] `generateStaticParams` builds from real Payload slugs; degrades to `[]` if CMS is unavailable
- [x] Related posts resolved from populated `relatedPosts` field on `BlogPost`
- [x] No mock data imports remain in journal page files
- [x] `PostCard`, `PostDetail`, `RelatedPosts` all use `BlogPost` from `@TreasureTrove/types`
- [x] E2E tests cover: listing renders, card links to `/journal/[slug]`, detail h1 and rich text, related posts section, revalidation webhook auth, 404 for non-existent slug

---

## Technical Notes
- **`BlogPost.author`** is a plain `string` in `@TreasureTrove/types` (no `role`); `PostDetail` shows initial avatar and name only
- **`BlogPost.content`** is `unknown` — cast to `LexicalContent` (from `payload.mock.ts` types) inside `PostDetail`
- **`BlogPost.relatedPosts`** is `Array<BlogPost | string>` — filtered to populated objects with a type guard
- **`resolveMediaUrl`** helper added locally in `PostCard` and `PostDetail` to handle `Media | string`
- **E2E tests** use `test.skip()` when no posts are available (CMS not running), matching existing PDP/homepage test patterns
- **ISR webhook**: tests verify correct `paths` array (`['/journal', '/journal/slug']`) using the `paths` key (not `path`) matching the actual route response shape

---

## Files to Create/Modify
```
apps/storefront/src/app/journal/page.tsx                              ← wired to getPosts()
apps/storefront/src/app/journal/[slug]/page.tsx                       ← wired to getPostBySlug() / getPosts()
apps/storefront/src/components/journal/PostCard.tsx                   ← uses BlogPost type
apps/storefront/src/components/journal/PostDetail.tsx                 ← uses BlogPost type
apps/storefront/src/components/journal/RelatedPosts.tsx               ← uses BlogPost[]
apps/storefront/e2e/journal/journal.spec.ts                           ← created (52 E2E tests)
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
- **Blocked by:** TASK-074, TASK-075
- **Blocks:** TASK-079, TASK-080, TASK-081

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Journal (Blog)/TASK-076 — Storefront · Journal (Blog) · Integration Testing.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-29 | Completed. Wired journal listing and detail pages to real Payload CMS API (`getPosts`, `getPostBySlug`). Updated all journal components (`PostCard`, `PostDetail`, `RelatedPosts`) to use `BlogPost` from `@TreasureTrove/types` replacing `MockBlogPostFull`. Created `e2e/journal/journal.spec.ts` with 52 Playwright tests covering: listing page structure, post card links, post detail h1 and `.prose-custom` rich text area, related posts section and navigation, ISR revalidation webhook auth (401/200), and 404 for non-existent slug. Tests follow established pattern — `test.skip()` when CMS unavailable so CI passes without a running Payload instance. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-29 | 1 | Wire pages to Payload API, update components, write E2E tests |

---

## Review Notes
- **—**
