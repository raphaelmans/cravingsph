# CravingsPH PRD v2 (Option A)

**Version:** v2 (for founder review)  
**Date:** 11-03-2026  
**Based on:**
- Repo PRD: `docs/prd.md`
- Drive PRD v1: `cravingsph-prd-v1.docx`
- Founder comments: `cravings-v1-comments.docx`

---

## 1) Executive Summary

This PRD defines the **Option A** direction as the release baseline: a **table-first, dine-in QR ordering MVP** with strict backend permission gating.

Core decision:
- **Menu access is not order permission.**
- Users may browse from discovery/direct URLs, but ordering is only enabled when the backend validates an active table session for the scanned table.

This version preserves extensibility from the repo PRD (future order-ahead/pickup/payments/retention) while narrowing v1 to what can ship with high confidence and low operational risk.

---

## 2) Product Principles

1. **Operational correctness over feature breadth** for v1.
2. **Backend-enforced permissions** (never UI-only gating).
3. **Immutable order tickets** after submit (ledger mindset).
4. **Focused test scope**: defer non-core features until core loop is stable.
5. **Extensible architecture** so future contexts can be added without rework.

---

## 3) Problem Statement

Restaurant ordering in PH is fragmented and inconsistent. For dine-in, staff need reliable table attribution, while guests need a fast no-login flow.

Current risk in broad MVP scope: teams can build and test against different interpretations of “MVP,” creating churn. This PRD removes ambiguity by defining one release contract.

---

## 4) MVP Scope (Option A)

## In Scope (v1)

### Customer (public)
- Discovery surfaces and restaurant menu pages are available in **browse mode**.
- Search UX supports two intents via explicit mode toggle:
  - **Restaurant mode** (default)
  - **Food mode**
- Search results always route to restaurant pages in browse mode.
- Table QR flow enables ordering only when an active table session exists.
- Anonymous dine-in ordering (no login required).
- Menu item customization with variants/modifiers and server-side validation.
- Cart + submit to immutable ticket.

### Restaurant Operations (internal)
- Open/close table sessions.
- Internal ticket feed with table number, ticket code, timestamps, line items, modifiers.

### Guardrails
- Idempotent submit handling to prevent duplicate ticket creation.
- Unavailable items/modifiers remain visible but disabled.

## Out of Scope for v1 (deferred)
- Pickup / order-ahead checkout flows.
- In-app or digital payment processing flows.
- Customer account features (saved profile, saved restaurants, order history account UX).
- Customer-side ticket edit/cancel after submit.
- Ratings/reviews.
- Advanced search ranking/AI interpretation/trending layers.

> Explicit founder notes applied:
> - **Saved Restaurants**: hidden/deferred.
> - **Customer Reviews**: hidden/deferred.

---

## 5) User Personas and Jobs-to-be-Done

1. **Dine-in Guest**: scan QR, browse, customize, submit quickly.
2. **FOH Staff**: open/close sessions and ensure tickets map to correct tables.
3. **Kitchen**: receive clean, immutable, table-accurate tickets.

---

## 6) User Journeys & Flows

## Journey A — Discovery user (not seated)
1. User opens discovery/search or direct restaurant URL.
2. App renders menu in **browse mode**.
3. User can inspect items but cannot submit an order.
4. If user wants to order dine-in, they must scan a table QR at venue.

## Journey B — Dine-in guest ordering (primary)
1. Guest sits at table and scans QR.
2. Backend validates active table session.
3. If active, backend mints/resumes device session and returns order capability.
4. Guest adds customized items to cart.
5. Guest submits order.
6. Backend validates session + availability + modifier rules + idempotency.
7. System creates immutable ticket and shows confirmation.
8. Additional requests become new tickets.

## Journey C — Multi-device same table
1. Guest A and Guest B scan same table QR from separate devices.
2. Both can submit independent tickets under same table session.
3. Kitchen sees separate ticket codes, same table association.

## Journey D — Staff operations
1. Staff opens table session when guests are seated.
2. Staff monitors incoming tickets in internal feed.
3. Staff closes session when table is billed/cleared.
4. Open carts after closure cannot submit and must re-scan/request assistance.

---

## 7) Functional Requirements

- **FR-01**: Discovery/direct menu entry is browse-only; no valid order capability.
- **FR-02**: Table QR does not grant order permission by itself; active table session is required.
- **FR-03**: No customer login required for dine-in ordering.
- **FR-04**: Multiple devices may submit separate tickets for one active table session.
- **FR-05**: Submitted tickets are immutable from customer side.
- **FR-06**: Item/modifier availability is enforced server-side at submit.
- **FR-07**: Modifier logic supports required/optional, min/max, single/multi-select.
- **FR-08**: Order submit must enforce idempotency.
- **FR-09**: Internal feed must include ticket code, table, timestamp, lines, modifiers.
- **FR-10**: Staff can open/close table sessions.
- **FR-11**: Closed/expired table sessions block new submits from existing carts.

### Search (from founder comments; v1 contract)
- **FR-S1**: Search mode toggle: `Food | Restaurant` (default Restaurant).
- **FR-S2**: Restaurant mode supports optional restaurant name + cuisine + location filters.
- **FR-S3**: Food mode requires dish query and returns restaurants with matched dishes.
- **FR-S4**: Case-insensitive partial matching is acceptable in v1.
- **FR-S5**: Search remains discovery/browse path (not order-enabled path).

---

## 8) Data / Technical Design (v1 with extension points)

### Order context contract

```ts
menu_context = {
  mode: "browse" | "dine_in_table" | "order_ahead",
  can_add_to_cart: boolean,
  can_submit_order: boolean,
  table_session_id?: UUID,
  device_session_id?: UUID
}
```

### Core entities
- `Table`
- `TableSession`
- `DeviceSession`
- `OrderTicket` (immutable submission record)
- `OrderLine`
- `OrderLineModifier`
- Existing menu entities from repo PRD (category/item/variant/modifier)

### Recommended routes
- `GET /r/{restaurantSlug}` → browse mode
- `GET /t/{tablePublicId}` → table bootstrap
- `POST /table-sessions/{id}/join` → create/resume device session
- `POST /order-tickets` → immutable ticket creation
- `POST /internal/tables/{id}/open-session`
- `POST /internal/table-sessions/{id}/close`
- `GET /internal/restaurants/{id}/tickets`

---

## 9) Acceptance Criteria (Release Gate)

1. Discovery/direct URLs cannot submit orders.
2. Valid table-session QR flow can submit without login.
3. Submitted ticket cannot be edited by customer.
4. Multiple devices can submit separate tickets for same table session.
5. Internal feed shows correct table + modifier details on every ticket.
6. Saved Restaurants and Reviews are not shown in v1 UI.

---

## 10) Deferred Backlog (explicit)

- Pickup/order-ahead flow
- Payment proof and related customer/owner payment UX
- Saved restaurants / favorites
- Ratings and reviews
- Advanced ranking and smart interpretation in search
- Promotions and retention lifecycle

---

## 11) Implementation Notes for Extensibility

- Keep capability checks centralized in backend (single policy layer).
- Keep `order_ahead` context in contracts but disabled in v1 UI.
- Use feature flags for deferred UI surfaces:
  - `ff.saved_restaurants=false`
  - `ff.reviews=false`
  - `ff.order_ahead=false`
- Maintain snapshot semantics on ticket line items/modifiers for ledger-grade auditability.

---

## 12) Scope Lock Statement

For this cycle, CravingsPH ships the **table-first dine-in MVP** with immutable tickets and strict session-gated ordering. Any work outside this contract is backlog unless it resolves a release blocker.

