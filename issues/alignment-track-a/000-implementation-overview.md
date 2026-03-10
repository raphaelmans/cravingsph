# Implementation Overview vs Track A Alignment

Status: mixed (good foundation, key gaps)

## What is present

- Owner portal and branch management surfaces exist.
- Order module exists with lifecycle transitions and timeline history.
- Branch-level ordering toggle exists (`isOrderingEnabled`).
- Branch settings and order dashboard pages are implemented.

## What is missing for Track A lock

- No table-session capability model (scan context is restaurant slug only).
- No strict backend rule that browsing is read-only while ordering requires active table capability.
- Customer checkout flow is still stubbed in UI (no real order create mutation path from menu checkout).
- Guest dine-in ordering flow conflicts with `protectedProcedure` order creation.
- Owner order mutation endpoints need stronger branch ownership authorization checks.
- Payment proof submit flow is incomplete while owner review flow expects `submitted` state.

## Net impact

Current codebase can support broad ordering flows, but it does not yet enforce the Track A operational guardrails needed for reliable dine-in-first rollout.
