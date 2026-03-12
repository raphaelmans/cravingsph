# Plan: PRD v2 — Track A (Table-first Dine-in MVP)

> Source PRD: `docs/prd-v2.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes (customer)**:
  - `/r/{restaurantSlug}` — browse-only menu page (existing)
  - `/t/{tablePublicId}` — table QR bootstrap (new) → resolves to menu page with dine-in capability
  - `/search` — dual-mode search (existing, needs food mode)
- **Routes (owner)**:
  - `/organization/restaurants/{restaurantId}/branches/{branchId}/tables` — table management (new)
  - `/organization/restaurants/{restaurantId}/branches/{branchId}/orders` — ticket feed (existing, needs refactor)
- **Schema (new entities)**:
  - `table` — branch-scoped, has `publicId` for QR URLs
  - `tableSession` — lifecycle: `active` → `closed`, opened/closed by staff
  - `deviceSession` — links a browser to a `tableSession`, minted on QR scan
- **Schema (modified)**:
  - `order` — gains `tableSessionId`, `deviceSessionId`, `ticketCode`, `idempotencyKey`
- **Key models (new modules)**:
  - `src/modules/table/` — table CRUD, session lifecycle, device session minting
- **Capability model**:
  - `menu_context` contract (`mode`, `can_add_to_cart`, `can_submit_order`, session IDs)
  - Server enforces capability on `order.create`; client uses it for UI gating only
- **Auth**: Dine-in ordering uses `publicProcedure` with `deviceSessionId` validation (not `protectedProcedure`)
- **Feature flags**: Simple config-based flags (`ff.saved_restaurants`, `ff.reviews`, `ff.order_ahead`, `ff.digital_payments`, `ff.order_history`) — all `false` for v1
- **Existing patterns preserved**: Factory-based DI, tRPC router → service → repository, Drizzle schema in `src/shared/infra/db/schema/`, DTOs via Zod

---

## Phase 1: Table Entity + Owner Table Management

**User stories**: US-55, US-59

### What to build

Owners can define tables for a branch and generate a QR code for each table. This is the thinnest possible vertical slice of the new table system — just CRUD and QR generation, no sessions yet.

A new `table` module follows the existing module pattern (router, service, repository, DTOs, factory). Each table belongs to a branch, has a human-readable `tableNumber` (e.g., "T1", "Patio 3") and a short URL-safe `publicId` used in QR codes. The owner portal gets a table management page under the branch section where staff can add/edit/remove tables and view/download the QR code for each one. The QR encodes the `/t/{publicId}` URL.

### Acceptance criteria

- [ ] `table` schema exists with `id`, `branchId`, `tableNumber`, `publicId`, `isActive`, timestamps
- [ ] `publicId` is auto-generated, unique, and URL-safe
- [ ] tRPC procedures: `table.list`, `table.create`, `table.update`, `table.delete` (branch-scoped, protected)
- [ ] Owner UI: table list page under branch settings, add/edit/delete tables
- [ ] Owner UI: QR code preview per table encoding `/t/{publicId}`
- [ ] Service-level tests for table CRUD (create, list, update, delete with branch scoping)

---

## Phase 2: Table Sessions + Floor Management

**User stories**: US-56, US-57, US-58

### What to build

Staff can open and close table sessions, giving them real-time floor visibility. This phase adds the `tableSession` entity and lifecycle operations — no customer-facing behavior yet.

When staff opens a session for a table, it transitions to `active`. When they close it, it transitions to `closed` with a timestamp and closer reference. Only one active session per table at a time. The owner portal's table management page shows session state per table (idle / active with duration) and provides open/close controls.

### Acceptance criteria

- [ ] `tableSession` schema exists with `id`, `tableId`, `branchId`, `status` (active/closed), `openedBy`, `closedBy`, `openedAt`, `closedAt`
- [ ] tRPC procedures: `table.openSession`, `table.closeSession`, `table.listSessions` (branch-scoped, protected)
- [ ] Opening a session for a table with an existing active session is rejected
- [ ] Closing a session sets `status=closed`, `closedAt`, `closedBy`
- [ ] Owner UI: floor status view showing each table's state (idle / active + duration)
- [ ] Owner UI: open/close session buttons per table
- [ ] Service-level tests for session lifecycle (open, close, duplicate-open rejection)

---

## Phase 3: QR Bootstrap + Device Sessions + Browse/Dine-in Mode

**User stories**: US-19, US-20, US-21, US-22, US-29, US-76

### What to build

The customer-facing half of the table system. When a guest scans a table QR, the app resolves the table's `publicId`, checks for an active session, and either grants dine-in capability or falls back to browse mode. This phase introduces the `deviceSession` entity, the `menu_context` capability contract, and the browse-mode UI gating.

The `/t/{publicId}` route is the entry point. If the table has an active session, the backend mints (or resumes) a `deviceSession` and returns a `menu_context` with `mode: "dine_in_table"` and `can_add_to_cart: true`. If no active session exists, it returns `mode: "browse"` with cart disabled. The existing restaurant menu page is adapted to accept a `menu_context` and conditionally enable/disable cart and submit actions. In browse mode, a CTA prompts the user to visit the restaurant and scan a table QR.

### Acceptance criteria

- [ ] `deviceSession` schema exists with `id`, `tableSessionId`, `deviceFingerprint`, `createdAt`, `lastActiveAt`
- [ ] `/t/{publicId}` route resolves the table, checks for active session, mints/resumes device session
- [ ] `menu_context` contract is returned from the bootstrap endpoint with correct fields
- [ ] Active session → `mode: "dine_in_table"`, `can_add_to_cart: true`, `can_submit_order: true`
- [ ] No active session → `mode: "browse"`, `can_add_to_cart: false`, `can_submit_order: false`
- [ ] Existing restaurant menu page (`/r/{slug}`) always renders in browse mode
- [ ] Browse mode UI: cart actions disabled, "Scan a table QR to order" CTA visible
- [ ] Dine-in mode UI: cart actions enabled, no login prompt
- [ ] Same device re-scanning same table QR resumes existing device session (not duplicate)
- [ ] Service-level tests for device session minting, capability resolution
- [ ] E2E test: browse-only mode blocks cart interaction

---

## Phase 4: Immutable Ticket Submission

**User stories**: US-23, US-24, US-25, US-27, US-28, US-30, US-74, US-75

### What to build

The core ordering action. A guest with dine-in capability submits their cart and receives an immutable ticket. This phase modifies the existing order creation flow to require a valid device session, enforce idempotency, validate item/modifier availability at submit time, and generate a human-readable ticket code.

The `order.create` procedure is modified: it accepts a `deviceSessionId` and `idempotencyKey` instead of customer name/phone. It validates that the device session is linked to an active table session before creating the order. The order is enriched with `tableSessionId`, `deviceSessionId`, `ticketCode`, and `idempotencyKey`. Duplicate submissions with the same idempotency key return the existing ticket instead of creating a new one. Item and modifier availability is re-checked at submit time. The confirmation screen shows the ticket code and table number.

### Acceptance criteria

- [ ] `order` schema has new columns: `tableSessionId`, `deviceSessionId`, `ticketCode`, `idempotencyKey`
- [ ] `order.create` requires a valid `deviceSessionId` linked to an active table session
- [ ] `order.create` without a valid device session is rejected (browse-mode users cannot submit)
- [ ] Ticket code is auto-generated and human-readable (e.g., "A-042")
- [ ] Duplicate `idempotencyKey` returns existing ticket (no duplicate creation)
- [ ] Item/modifier availability is validated server-side at submit time
- [ ] Submitting against a closed table session is rejected with clear error
- [ ] Multiple devices on the same table session create independent tickets
- [ ] Customer sees ticket confirmation with ticket code, table number, and order summary
- [ ] Special instructions are preserved on the ticket
- [ ] Service-level tests for idempotency, session validation, availability checks, multi-device independence
- [ ] E2E test: full QR → cart → submit → confirmation flow

---

## Phase 5: Owner Ticket Feed + Lifecycle

**User stories**: US-26, US-60, US-61, US-62, US-63, US-64, US-65

### What to build

The owner's operational view of incoming tickets and the ability to progress them through the lifecycle. This phase refactors the existing order management dashboard into a ticket feed with table context, wires auto-accept for branches that opt in, and adds the "Mark as Paid (Cash)" shortcut.

The ticket feed shows tickets grouped or filtered by table, with ticket code, table number, timestamps, and line items (including variants and modifiers). Status progression follows: `placed → accepted → preparing → ready → completed` (or `placed → preparing → ready → completed` for auto-accept branches). The customer-facing ticket status tracking is also wired so guests can see their ticket's current state.

### Acceptance criteria

- [ ] Owner ticket feed shows tickets with: ticket code, table number, timestamp, line items, variants, modifiers, special instructions
- [ ] Owner can accept or reject a ticket (with optional reason)
- [ ] Owner can progress ticket status: accepted → preparing → ready → completed
- [ ] Auto-accept branches skip the accepted step (placed → preparing)
- [ ] Owner can mark a ticket as "Paid (Cash)"
- [ ] Customer sees real-time ticket status on the confirmation/tracking screen
- [ ] Branch authorization enforced: owners only see tickets for their own branches
- [ ] Service-level tests for status transitions, auto-accept logic, branch authorization
- [ ] E2E test: owner accepts ticket, progresses to completed

---

## Phase 6: Feature Flags + Deferred Feature Hiding

**User stories**: (infrastructure — enforces the v1 "does NOT ship" list)

### What to build

A simple feature flag system that gates UI entry points for deferred features. The existing code for saved restaurants, reviews, order history, payment proof, and pickup ordering stays intact but becomes invisible in v1.

The flag system can be config-based (environment variables or a shared config object) — no need for a full feature flag service for v1. Client components check flags before rendering entry points (nav links, buttons, sections). Server procedures for deferred features remain accessible (no breaking changes to the API) but UI paths to reach them are removed.

### Acceptance criteria

- [ ] Feature flag config exists with 5 flags, all defaulting to `false`
- [ ] Saved restaurants: nav link and save button hidden
- [ ] Reviews: review form and ratings display hidden on restaurant pages
- [ ] Order history: customer order history page and reorder button hidden
- [ ] Payment proof: customer payment upload UI hidden; owner payment verification UI hidden (except "Mark as Paid (Cash)")
- [ ] Pickup ordering: order type selector hidden; checkout assumes dine-in
- [ ] Flags are checkable from both server components and client components
- [ ] Toggling a flag to `true` re-enables the feature without code changes
- [ ] E2E test: verify hidden entry points are not rendered with default flags

---

## Phase 7: Dual-mode Search

**User stories**: US-32, US-33, US-34, US-35, US-36

### What to build

Upgrade the existing restaurant search to support two explicit modes. Restaurant mode already works (name + cuisine + city filters). This phase adds Food mode (search by dish name, returns restaurants with matched dishes) and the mode toggle UI.

A new search procedure (or extended existing one) accepts a `mode` parameter. In Food mode, it queries menu items by name (case-insensitive partial match) and returns restaurant cards with matched dishes listed underneath. The search UI gets a Food | Restaurant toggle that defaults to Restaurant. The typed query persists when switching modes. Location defaults to current position when not specified.

### Acceptance criteria

- [ ] Search UI has a Food | Restaurant toggle, defaulting to Restaurant
- [ ] Restaurant mode works as before (name, cuisine, location filters)
- [ ] Food mode requires a non-empty dish query
- [ ] Food mode returns restaurant cards with matched dish names shown per restaurant
- [ ] Case-insensitive partial matching works (e.g., "croiss" matches "Croissant")
- [ ] Switching modes preserves the typed query text
- [ ] Empty location defaults to current position in both modes
- [ ] Search results route to browse-mode restaurant pages (no order capability)
- [ ] Service-level tests for food search (partial matching, empty query rejection, result shape)
- [ ] E2E test: toggle to Food mode, search for a dish, see restaurant results with matched items
