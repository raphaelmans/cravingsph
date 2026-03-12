# Summary — PRD v2 Track A: Table-first Dine-in MVP

## Artifacts

| File | Purpose |
|------|---------|
| `specs/prd-v2-track-a/rough-idea.md` | Initial scope summary |
| `specs/prd-v2-track-a/requirements.md` | Q&A record |
| `specs/prd-v2-track-a/research/` | 8 research documents covering codebase analysis + v4 delta |
| `specs/prd-v2-track-a/design.md` | Detailed design (standalone, 9 sections) |
| `specs/prd-v2-track-a/plan.md` | 20-step implementation plan |
| `specs/prd-v2-track-a/summary.md` | This file |

## Overview

Transforms CravingsPH from a menu-browsing platform into a complete dine-in ordering system. Reconciles PRD v2 (76 user stories) with the v4 product guide (prioritized on conflicts).

**Core flow:** Customer scans table QR → menu loads with ordering enabled → submits anonymous immutable ticket → owner progresses ticket through 4-state lifecycle.

## Key Design Decisions

- **No device sessions** — `tableSessionId` stored client-side is sufficient. Multiple devices share the same table session and submit independent tickets.
- **Auto-created table sessions** — QR scan auto-creates/resumes sessions. No staff-gated open step (v4 over v2).
- **4-state order lifecycle** — `new → preparing → ready → completed` (v4 over v2's 5 states). No accept/reject step.
- **Invite-only onboarding** — Admin generates invite links. No public owner registration (v4).
- **Feature flags for deferred features** — Config-based env vars for saved restaurants, reviews, order history, digital payments, pickup ordering.

## New Entities

| Table | Purpose |
|-------|---------|
| `table` | Branch-scoped tables with publicId for QR codes |
| `table_session` | Auto-created ordering sessions per table |
| `invite` | Admin-generated owner invite tokens |

## Modified Entities

| Table | Changes |
|-------|---------|
| `order` | +tableSessionId, +ticketCode, +idempotencyKey, status default → "new" |
| `branch` | +street, +barangay, +amenities (jsonb) |
| `operating_hours` | +rangeIndex (supports split hours) |

## Implementation Plan (20 steps)

| # | Step | Demoable Milestone |
|---|------|--------------------|
| 1–3 | Table entity + CRUD + owner UI | Owner creates tables with QR codes |
| 4–6 | Sessions + bootstrap + browse gating | QR scan → menu with ordering enabled |
| 7–10 | Order schema + ticket creation + checkout | Anonymous dine-in order submission |
| 11 | Confirmation + status tracking | Customer sees ticket code + status |
| 12–13 | Owner ticket feed + paid/close | Owner operates full ticket lifecycle |
| 14 | Feature flags | Deferred features hidden |
| 15 | Branch enhancements | Structured address, amenities, split hours |
| 16–17 | Food search backend + UI | Dual-mode search (Food \| Restaurant) |
| 18–19 | Invite system + onboarding simplification | Invite-only owner onboarding |
| 20 | QR scanner update + polish | End-to-end integration |

## Suggested Next Steps

1. **Review the design** (`design.md`) for any gaps or changes.
2. **Implement via Ralph** using the spec-driven pipeline, or work through steps manually.
3. **Start with Steps 1–3** (table entity) — the thinnest vertical slice with immediate demoable value.
