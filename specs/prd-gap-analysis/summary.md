# Summary — PRD v4 Gap Analysis

## Artifacts

| File | Description |
|---|---|
| `rough-idea.md` | Original task scope |
| `requirements.md` | Q&A record (research-first approach — no clarification needed) |
| `research/journey-1-discovery-search.md` | Audit: Discovery & Search (5/8 implemented, 3 missing) |
| `research/journey-2-owner-setup.md` | Audit: Owner Setup (7/10 implemented, 3 partial) |
| `research/journey-3-dine-in-ordering.md` | Audit: Dine-in Ordering (3/7 implemented, 3 partial, 1 missing) |
| `research/journey-4-owner-operations.md` | Audit: Owner Operations (4/4 fully implemented) |
| `research/journey-5-governance.md` | Audit: Governance (3/6 implemented, 2 partial, 1 missing) |
| `design.md` | Consolidated design with 4 workstreams, acceptance criteria, error handling |
| `plan.md` | 10-step implementation plan across 3 phases |

## Overview

Audited **35 requirements** across 5 PRD v4 journeys against the current codebase.

**22 implemented, 8 partial, 5 missing.**

The backend is generally ahead of the frontend — most gaps are frontend wiring, UI upgrades, or thin schema extensions. Journey 4 (Owner Operations) is fully complete. Journey 3 (Dine-in Ordering) has the largest critical gap: the checkout is stubbed and QR→table flow doesn't exist yet.

## Key Decisions Made

1. **No table session entity for MVP** — table number is a string from QR, stored on order
2. **Polling for order tracking** — `refetchInterval` instead of Supabase Realtime
3. **Haversine SQL for distance** — avoids PostGIS dependency
4. **Verification flow deferred** — steps already skip-only; decision on removal is post-MVP
5. **Cuisine stored as PostgreSQL TEXT[]** — native array, works with Drizzle

## Suggested Next Steps

1. **Start implementation** — Phase 1 (Steps 1–4) is the critical dine-in loop
2. **Create PROMPT.md for Ralph** — for autonomous implementation via spec-driven preset
3. **Run `ralph run --config presets/pdd-to-code-assist.yml`** — full pipeline with design context
