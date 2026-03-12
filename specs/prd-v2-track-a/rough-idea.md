# PRD v2 — Track A: Table-first Dine-in MVP

## Source Documents

- `docs/prd-v2.md` — Full PRD v2 (76 user stories, 11 core FRs)
- `plans/prd-v2-track-a.md` — 7-phase implementation plan

## Summary

Transform CravingsPH from a menu-browsing platform into a complete dine-in ordering system. Customers scan a table QR code, browse the menu with ordering enabled, submit immutable tickets, and track status. Owners manage tables, sessions, and ticket lifecycle. Browse-only mode enforced for non-QR visitors.

## Phases

1. **Table Entity + Owner Table Management** — Table CRUD, QR code generation per table
2. **Table Sessions + Floor Management** — Open/close sessions, floor status view
3. **QR Bootstrap + Device Sessions + Browse/Dine-in Mode** — `/t/{publicId}` route, `menu_context` capability contract, browse-mode UI gating
4. **Immutable Ticket Submission** — Order creation with device session validation, idempotency, ticket codes
5. **Owner Ticket Feed + Lifecycle** — Ticket feed, status progression, auto-accept, "Mark as Paid (Cash)"
6. **Feature Flags + Deferred Feature Hiding** — Config-based flags to hide saved restaurants, reviews, order history, payments, pickup
7. **Dual-mode Search** — Food | Restaurant toggle, dish search, query persistence

## Key Architectural Decisions

- **Capability model**: `menu_context` contract determines what the client can do (browse vs. dine-in)
- **Anonymous ordering**: Device sessions, not user accounts, are the identity for dine-in orders
- **Immutable tickets**: No customer edit/cancel after submit; additional items create new tickets
- **Auth**: Dine-in uses `publicProcedure` with `deviceSessionId` validation
- **Feature flags**: Simple config-based, all `false` for v1
