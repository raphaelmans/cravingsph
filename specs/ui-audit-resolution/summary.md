# UI Audit Resolution — Summary

## Artifacts

| File | Description |
|------|-------------|
| `specs/ui-audit-resolution/rough-idea.md` | Consolidated issue summary with all 18 issues categorized |
| `specs/ui-audit-resolution/requirements.md` | 10 Q&A decisions covering backend strategy, portal model, discovery, orders, payments, verification, images, and scope |
| `specs/ui-audit-resolution/research/database-schema-gaps.md` | 10 existing tables mapped, 8 new tables + 2 column additions identified |
| `specs/ui-audit-resolution/research/trpc-conventions.md` | 8 existing routers, module structure conventions, procedure types |
| `specs/ui-audit-resolution/research/frontend-stores-catalog.md` | 8 hooks to replace, 3 stub data locations, tRPC replacement patterns |
| `specs/ui-audit-resolution/research/supabase-storage.md` | Storage audit: client installed but zero upload infrastructure |
| `specs/ui-audit-resolution/research/portal-separation.md` | Auth flow vulnerabilities and enforcement checklist |
| `specs/ui-audit-resolution/research/component-fixes.md` | Breadcrumb, add-item dialog, image crash, QR scanner fixes |
| `specs/ui-audit-resolution/design.md` | Full design with architecture diagrams, data models, 18 acceptance criteria, testing strategy |
| `specs/ui-audit-resolution/plan.md` | 18-step implementation plan with TDD guidance and demo checkpoints |

## Overview

This spec resolves all 18 issues from the initial UI audit (`issues/init/`) to make CravingsPH production-ready. The scaffold was built with seed data and local stores as visual stand-ins — this plan replaces all of that with real Supabase-backed persistence, enforces portal separation, adds file upload infrastructure, and fixes component-level bugs.

### Key Decisions
- **Full backend integration** — no more local stores or seed data in authenticated flows
- **Portal separation** via `profile.portal_preference` column (not user_roles)
- **Geolocation-aware discovery** with lat/lng on branches, featured flag on restaurants
- **Branch-derived location filters** — dynamic, zero maintenance
- **Rich order model** with status history, payment tracking, and reviews
- **Supabase Storage uploads only** — no arbitrary image URLs
- **Browser camera QR scanner** via html5-qrcode
- **Cebu City seed data** — 4 new restaurant fixtures

### Scope
- 8 new database tables + 2 column additions
- 6 new tRPC routers + extensions to 3 existing routers
- 8 frontend hook rewrites + 3 page stub replacements
- 5 Supabase Storage buckets + upload utilities
- QR scanner, save-for-later UI, empty states, component fixes
- 18 Playwright E2E tests (one per issue)

## Suggested Next Steps

1. **Create a PROMPT.md** for Ralph to implement this autonomously
2. **Start with Step 1** (database migration) — all other steps depend on it
3. **Steps 2-3** (storage + portal separation) are the next foundation pieces
4. **Steps 4-7** deliver the first full customer-facing experience (discovery → save → order → review)
