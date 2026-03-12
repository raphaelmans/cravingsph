# CravingsPH — Product Requirements Document v2

> **Version:** v2
> **Date:** 2026-03-11
> **Supersedes:** `docs/prd.md` (retained for reference)
> **Scope lock:** Track A — Table-first dine-in MVP
> **Sources reconciled:**
> - `docs/prd.md` (repo PRD, 85 user stories)
> - `docs/prd/product-guide-v3.md` (journey-based product guide)
> - `docs/alignment/prd-v2-option-a.md` (Option A scope lock)
> - Founder comments (`cravings-v1-comments.docx`) — search spec

---

## 1. Problem Statement

Philippine restaurant customers rely on fragmented methods to browse menus and place orders — printed menus, social media posts, phone calls, and walk-in ordering. There is no unified digital platform that lets customers scan a QR code, browse a menu, customize items, and place an order from their phone. Restaurant owners have no self-service tools to manage their menus or receive digital orders.

A legacy CravingsPH prototype validated the menu-browsing UX (category navigation, modifier system, smart cart merging) but never shipped ordering or restaurant self-service. A new codebase added authentication but has zero restaurant functionality. Neither version delivers a complete ordering loop.

**v2 scope contract:** Rather than ship a broad MVP that risks inconsistent interpretations across teams, this PRD defines one release contract: a **table-first dine-in ordering MVP** with immutable tickets and strict session-gated ordering. Any work outside this contract is backlog unless it resolves a release blocker.

---

## 2. Product Principles

1. **Operational correctness over feature breadth** — v1 ships fewer features but each one works reliably under real service pressure.
2. **Backend-enforced permissions** — All capability gating (ordering, session validation) is enforced server-side. UI-only gating is never sufficient.
3. **Immutable order tickets** — Submitted orders are ledger-grade records. Customers cannot edit or cancel after submit.
4. **Focused test scope** — Defer non-core features until the core ordering loop is stable and tested.
5. **Extensible architecture** — Future contexts (pickup, order-ahead, payments) can be added without rework. Schema and contracts preserve extension points.

---

## 3. Solution (v1 Scope)

### Customer Portal

**Browse mode (discovery / direct URL):**
- Browse restaurant menus via search, discovery pages, or direct restaurant URLs
- Dual-mode search: Food | Restaurant toggle
- Inspect items, variants, and modifiers
- Cannot add to cart or submit orders

**Dine-in ordering (QR-gated table session):**
- Scan table QR code at venue
- Backend validates active table session and mints/resumes device session
- Anonymous ordering — no login required
- Full customization (variants, modifiers) with server-side validation
- Cart with smart merging and persistence
- Submit creates immutable ticket
- Additional requests create new tickets (no editing previous submissions)

### Owner Portal

- Self-service onboarding (organization → restaurant → branch → menu)
- Full menu CRUD (categories, items, variants, modifier groups, modifiers)
- Table session management (open/close sessions per table)
- Ticket feed with table number, ticket code, timestamps, line items, modifiers
- Branch controls (ordering on/off, auto-accept, operating hours)
- "Mark as Paid (Cash)" shortcut for dine-in tickets
- QR code generation per table

### Admin Portal

- Restaurant verification queue and review
- Restaurant and user management
- Platform-wide visibility

### Search (v1)

- Dual-mode toggle: **Food | Restaurant** (default: Restaurant)
- Restaurant mode: optional name + cuisine + location filters
- Food mode: required dish query, returns restaurants with matched dishes
- Case-insensitive partial matching (SQL LIKE)
- Search is discovery/browse path only (not order-enabled)

### Does NOT Ship in v1

- Pickup / order-ahead checkout flows
- In-app or digital payment processing (GCash, Maya, bank transfer proof upload)
- Payment countdown timer
- Customer account features (saved restaurants, order history UI, reorder)
- Customer-side ticket edit/cancel after submit
- Ratings and reviews
- Push notifications
- Team access (invite, roles, permissions)
- Advanced search ranking / AI interpretation / trending
- Daily/weekly order summaries for owners
- Promotional notifications

---

## 4. Personas & Jobs-to-be-Done

### Dine-in Guest
- **Job:** Order quickly and correctly at the table.
- **Pain:** Waiting for staff, unclear options, uncertainty after ordering.
- **Win:** Smooth scan → order → confirmation experience.

### FOH Staff
- **Job:** Keep service moving while avoiding table/order confusion.
- **Pain:** Manual errors, queue chaos, wrong-table incidents.
- **Win:** Clear table session control + reliable ticket lifecycle.

### Kitchen / Ops
- **Job:** Execute complete and accurate tickets fast.
- **Pain:** Order ambiguity, duplicate tickets, late changes.
- **Win:** Clean, immutable, table-accurate tickets with stable status flow.

### Owner
- **Job:** Ship a focused digital ordering experience that proves product value.
- **Pain:** Scope drift, unclear release readiness, operational confusion.
- **Win:** Self-service setup, predictable operations, explicit scope boundaries.

---

## 5. User Journeys

### Journey A — Discovery (browse-only)

1. User opens discovery page, search, or direct restaurant URL.
2. App renders menu in **browse mode** (`menu_context.mode = "browse"`).
3. User can inspect items, variants, modifiers, and prices.
4. Cart and submit actions are disabled. CTA prompts: "Visit the restaurant and scan a table QR to order."
5. If user wants to order dine-in, they must scan a table QR at the venue.

### Journey B — Dine-in Guest Ordering (primary)

1. Guest sits at table and scans table QR code.
2. Backend validates that the table has an active session (staff opened it).
3. If active, backend mints a new device session (or resumes existing) and returns order capability.
4. Guest sees menu with cart enabled (`menu_context.can_add_to_cart = true`).
5. Guest customizes items (variants, modifiers, quantity) and adds to cart.
6. Guest reviews cart and submits order.
7. Backend validates: active session + item/modifier availability + modifier rules + idempotency key.
8. System creates immutable ticket with unique ticket code and shows confirmation.
9. Additional requests from the same guest create new tickets (no editing previous submissions).

### Journey C — Multi-device Same Table

1. Guest A and Guest B scan the same table QR from separate devices.
2. Both receive independent device sessions under the same table session.
3. Both can submit independent tickets.
4. Kitchen sees separate ticket codes with the same table association.

### Journey D — Staff Operations

1. Staff opens a table session when guests are seated (via owner portal or future POS).
2. Table QR becomes active — scanning it now grants ordering capability.
3. Staff monitors incoming tickets in the internal ticket feed.
4. Staff progresses ticket status: placed → accepted → preparing → ready → completed.
5. When guests are done, staff closes the table session.
6. Any open carts from that session can no longer submit — guests see "Session ended" and must re-scan or request assistance.
7. Staff can optionally mark tickets as "Paid (Cash)" before or after closing the session.

---

## 6. Functional Requirements

### Core (FR-01 through FR-11)

| ID | Requirement |
|----|-------------|
| FR-01 | Discovery and direct menu URLs render in browse-only mode; no valid order capability. |
| FR-02 | Table QR does not grant order permission by itself; an active table session (opened by staff) is required. |
| FR-03 | No customer login is required for dine-in ordering. Anonymous ordering via device session. |
| FR-04 | Multiple devices may submit separate tickets for one active table session. |
| FR-05 | Submitted tickets are immutable from the customer side. No edit, no cancel. |
| FR-06 | Item and modifier availability is enforced server-side at submit time. Unavailable items remain visible but disabled. |
| FR-07 | Modifier logic supports required/optional groups, min/max selection rules, and single/multi-select. |
| FR-08 | Order submit must enforce idempotency (duplicate submissions with the same idempotency key are rejected). |
| FR-09 | Internal ticket feed must include ticket code, table number, timestamp, line items with variants, and modifiers. |
| FR-10 | Staff can open and close table sessions from the owner portal. |
| FR-11 | Closed or expired table sessions block new order submissions from existing carts. |

### Search (FR-S1 through FR-S5)

| ID | Requirement |
|----|-------------|
| FR-S1 | Search mode toggle: `Food \| Restaurant` with Restaurant as default. |
| FR-S2 | Restaurant mode supports optional restaurant name, cuisine (multi-select), and location/barangay (multi-select) filters. If no location selected, default to current location. |
| FR-S3 | Food mode requires a dish query (non-empty) and returns restaurants with matched dishes shown underneath each restaurant card. |
| FR-S4 | Case-insensitive partial matching (e.g., `croiss` → `croissant`) is acceptable for v1. SQL LIKE-style logic. |
| FR-S5 | Search is a discovery/browse path only — it does not grant order capability. |

---

## 7. User Stories (v1)

Stories are organized by actor and domain. Each story is tagged with its disposition from the original PRD: **kept** (unchanged), **modified** (scope-adjusted for v1), or **new** (added for v1).

### Customer — Menu Browsing

| # | Story | Disposition |
|---|-------|-------------|
| US-01 | As a customer, I want to scan a QR code at a restaurant and immediately see their menu, so that I can browse without downloading an app. | kept |
| US-02 | As a customer, I want to browse menu items organized by categories (e.g., "Chicken", "Drinks", "Desserts"), so that I can find what I want quickly. | kept |
| US-03 | As a customer, I want to search menu items by name within a restaurant, so that I can jump to a specific item. | kept |
| US-04 | As a customer, I want to see item details (name, description, image, price), so that I can make an informed choice. | kept |
| US-05 | As a customer, I want to see the restaurant's cover photo, profile picture, name, address, and contact info, so that I know where I am ordering from. | kept |
| US-06 | As a customer, I want horizontal-scroll category navigation with a sticky header, so that I can jump between sections without scrolling back to the top. | kept |

### Customer — Item Customization

| # | Story | Disposition |
|---|-------|-------------|
| US-07 | As a customer, I want to select a variant for an item (e.g., Small/Medium/Large) that changes the base price, so that I can pick the right size. | kept |
| US-08 | As a customer, I want to add optional modifiers (e.g., extra cheese +₱25, no onions), so that I can customize my order. | kept |
| US-09 | As a customer, I want to see required modifier groups marked as "Required" and optional ones as "Optional", so that I know what I must choose. | kept |
| US-10 | As a customer, I want modifier groups with min/max selection rules (e.g., "pick 1 to 3 toppings"), so that the restaurant's constraints are enforced. | kept |
| US-11 | As a customer, I want to select a quantity before adding to cart, so that I can order multiples of the same item. | kept |
| US-12 | As a customer, I want to see the total price update live as I select variants and modifiers, so that I know the cost before adding to cart. | kept |

### Customer — Cart

| # | Story | Disposition |
|---|-------|-------------|
| US-13 | As a customer, I want to add items to a running cart, so that I can build my full order before submitting. | kept |
| US-14 | As a customer, I want identical items (same variant + same modifiers) to merge automatically and increase quantity, so that my cart stays clean. | kept |
| US-15 | As a customer, I want to update quantities or remove items from my cart, so that I can adjust my order. | kept |
| US-16 | As a customer, I want to see an itemized breakdown with a running total including all modifier costs, so that I know exactly what I'm paying. | kept |
| US-17 | As a customer, I want my cart to persist across page refreshes (saved locally), so that I don't lose my selections if I accidentally close the browser. | kept |
| US-18 | As a customer, I want to see the cart icon with item count in the header, so that I always know how many items I've added. | kept |

### Customer — Browse Mode

| # | Story | Disposition |
|---|-------|-------------|
| US-19 | As a customer browsing via discovery or direct URL, I want to see the full menu with prices and details, so that I can decide whether to visit the restaurant. | new |
| US-20 | As a customer in browse mode, I want cart and ordering actions to be disabled with a clear message explaining I need to scan a table QR to order, so that I understand the next step. | new |
| US-21 | As a customer in browse mode, I want a visible CTA directing me to scan a table QR at the venue, so that I know how to start ordering. | new |

### Customer — Dine-in Ordering (Table Session)

| # | Story | Disposition |
|---|-------|-------------|
| US-22 | As a dine-in customer, I want to scan a table QR and immediately see the menu with ordering enabled (if the table session is active), so that I can start ordering without friction. | modified |
| US-23 | As a dine-in customer, I want to place an order without creating an account, so that the process is frictionless. | modified |
| US-24 | As a dine-in customer, I want to add special instructions to my order (e.g., "no ice", "extra napkins"), so that the restaurant can accommodate my preferences. | kept |
| US-25 | As a dine-in customer, I want to see a ticket confirmation screen with my ticket code and table number after submitting, so that I know my order was received. | modified |
| US-26 | As a dine-in customer, I want to see the current status of my ticket (placed → accepted → preparing → ready → completed), so that I know when my food is ready. | modified |
| US-27 | As a dine-in customer, I want to submit additional orders that create new tickets (rather than editing previous ones), so that the kitchen receives clear, immutable instructions. | new |
| US-28 | As a dine-in customer, I want to be informed if the table session has been closed while I have items in my cart, so that I know I cannot submit and need assistance. | new |
| US-29 | As a dine-in customer, I want my device to be automatically associated with the table session, so that I don't need to enter a table number manually. | new |
| US-30 | As a dine-in customer sharing a table with others, I want each device to submit independent tickets, so that our orders don't get mixed up. | new |

### Customer — Discovery & Search

| # | Story | Disposition |
|---|-------|-------------|
| US-31 | As a customer, I want to see a home page with featured restaurants, so that I can discover new places to eat. | kept |
| US-32 | As a customer, I want a search mode toggle (Food \| Restaurant) so that I can search by what I want to eat or where I want to eat. | new |
| US-33 | As a customer in Restaurant mode, I want to search by restaurant name, cuisine, and/or location, so that I can find a specific place or type of restaurant. | modified |
| US-34 | As a customer in Food mode, I want to search by dish name and see restaurants with matched dishes listed underneath, so that I can find who serves what I'm craving. | new |
| US-35 | As a customer, I want my search query to persist when I switch between Food and Restaurant modes, so that I don't have to retype. | new |
| US-36 | As a customer, I want search results to default to my current location when I don't specify a location, so that I see relevant nearby results. | new |
| US-37 | As a customer, I want to see restaurant cards with cover photo, name, cuisine tags, and a preview of popular items, so that I can decide which menu to browse. | kept |
| US-38 | As a customer, I want a "Scan QR" call-to-action on the home page, so that I can quickly open a restaurant's menu. | kept |

### Owner — Onboarding

| # | Story | Disposition |
|---|-------|-------------|
| US-39 | As a restaurant owner, I want to register for an account and set my portal preference to "owner", so that I'm routed to the restaurant management dashboard. | kept |
| US-40 | As a restaurant owner, I want a setup wizard that guides me through creating my organization, adding a restaurant, and building my menu, so that I can go live step by step. | kept |
| US-41 | As a restaurant owner, I want to add my restaurant's basic info (name, address, city/province, phone, photos, description), so that customers can find me. | kept |
| US-42 | As a restaurant owner, I want to add multiple branches under my restaurant, so that each branch has its own menu and URL. | kept |
| US-43 | As a restaurant owner, I want to submit verification documents for admin review, so that my restaurant can go live on the platform. | kept |
| US-44 | As a restaurant owner, I want to see my verification status (pending/approved/rejected), so that I know where I stand. | kept |
| US-45 | As a restaurant owner, I want a hub view (non-linear alternative to the wizard), so that I can jump to any setup task directly. | kept |

### Owner — Menu Management

| # | Story | Disposition |
|---|-------|-------------|
| US-46 | As a restaurant owner, I want to create menu categories (e.g., "Main Course", "Drinks"), so that my menu is organized. | kept |
| US-47 | As a restaurant owner, I want to add menu items with name, description, image, and base price, so that customers can see what I offer. | kept |
| US-48 | As a restaurant owner, I want to define item variants (e.g., Small ₱99 / Medium ₱149 / Large ₱199), so that customers can choose sizes. | kept |
| US-49 | As a restaurant owner, I want to create modifier groups (e.g., "Choose your sauce") with min/max selection rules, so that item customization is structured. | kept |
| US-50 | As a restaurant owner, I want to add priced modifiers within groups (e.g., "Extra cheese +₱25"), so that add-ons affect the total. | kept |
| US-51 | As a restaurant owner, I want to reorder categories and items by drag-and-drop, so that I control the menu layout. | kept |
| US-52 | As a restaurant owner, I want to mark items as "sold out" temporarily, so that customers don't order unavailable items. | kept |
| US-53 | As a restaurant owner, I want to search, filter, and sort my menu items in a grid/list view, so that I can manage a large menu efficiently. | kept |
| US-54 | As a restaurant owner, I want to upload images for menu items (with drag-and-drop and preview), so that my menu is visually appealing. | kept |

### Owner — Table Session Management

| # | Story | Disposition |
|---|-------|-------------|
| US-55 | As a restaurant owner/staff, I want to define tables for my branch (with table numbers or names), so that I can manage seating. | new |
| US-56 | As a restaurant owner/staff, I want to open a table session when guests are seated, so that the table QR becomes active for ordering. | new |
| US-57 | As a restaurant owner/staff, I want to close a table session when guests leave, so that no more orders can be submitted for that table. | new |
| US-58 | As a restaurant owner/staff, I want to see which tables have active sessions, so that I can manage the floor. | new |
| US-59 | As a restaurant owner/staff, I want to generate a QR code for each table, so that guests can scan to start ordering. | modified |

### Owner — Ticket Management

| # | Story | Disposition |
|---|-------|-------------|
| US-60 | As a restaurant owner, I want to see incoming tickets in a feed with table number, ticket code, and timestamps, so that I can manage my workflow. | modified |
| US-61 | As a restaurant owner, I want to accept or reject incoming tickets (with an optional reason), so that I have control over what I fulfill. | modified |
| US-62 | As a restaurant owner, I want to configure my branch for auto-accept mode, so that tickets are confirmed instantly without manual action. | kept |
| US-63 | As a restaurant owner, I want to update ticket status (accepted → preparing → ready → completed), so that customers know the progress. | modified |
| US-64 | As a restaurant owner, I want to see ticket details (items, quantities, variants, modifiers, special instructions, table number), so that I can prepare the order correctly. | kept |
| US-65 | As a restaurant owner, I want a "Mark as Paid (Cash)" shortcut for dine-in tickets, so that I can quickly confirm walk-in cash payments. | kept |

### Owner — Settings & Configuration

| # | Story | Disposition |
|---|-------|-------------|
| US-66 | As a restaurant owner, I want to set operating hours per branch, so that customers know when I'm open. | kept |
| US-67 | As a restaurant owner, I want to configure order acceptance mode (manual vs auto-accept) per branch, so that I can choose what works for my workflow. | kept |
| US-68 | As a restaurant owner, I want to toggle online ordering on/off per branch, so that I can temporarily pause receiving orders. | kept |

### Admin — Platform Operations

| # | Story | Disposition |
|---|-------|-------------|
| US-69 | As a platform admin, I want to review restaurant verification submissions (documents, business permits), so that I can approve or reject listings. | kept |
| US-70 | As a platform admin, I want to see a list of all restaurants with their verification status, so that I can track onboarding progress. | kept |
| US-71 | As a platform admin, I want to manage restaurant data (edit, deactivate, feature), so that I can maintain platform quality. | kept |
| US-72 | As a platform admin, I want to view platform-wide order statistics, so that I can track growth. | kept |
| US-73 | As a platform admin, I want to manage user accounts (view, deactivate), so that I can handle support cases. | kept |

### Guardrails & System Behavior

| # | Story | Disposition |
|---|-------|-------------|
| US-74 | As the system, I must enforce idempotent order submission, so that duplicate tickets are never created from retry or double-tap. | new |
| US-75 | As the system, I must validate item and modifier availability at submit time (not just at cart-add time), so that out-of-stock items are never ordered. | new |
| US-76 | As the system, I must enforce the Order Context contract (`menu_context`) so that browse-mode users cannot bypass the UI to submit orders via API. | new |

**v1 story count: 76** (48 kept + 10 modified + 17 new + 1 kept from payments)

---

## 8. Implementation Decisions

### Architecture (kept)

- 5-layer architecture: App Router → Features → Common → Domain Modules → Shared/Kernel
- Factory-based DI with lazy singletons for repos/services
- tRPC routers as controllers, services for domain logic, repositories for data access
- Drizzle ORM with PostgreSQL (Supabase-hosted)
- Supabase Auth for authentication

### Organization Hierarchy (kept)

- Organization → Restaurant → Branch
- Each branch has its own URL slug, menu, operating hours, and order queue
- One organization can have multiple restaurants, each with multiple branches

### Menu Data Model (kept)

- Category → MenuItem → ItemVariant
- MenuItem → ModifierGroup → Modifier
- Required/optional groups with min/max selection rules
- All IDs are UUIDs, all timestamps are `timestamptz`

### Design System (kept)

- shadcn/ui `new-york` style with Radix primitives
- OKLCH color tokens, semantic design tokens
- Pill shapes for customer portal
- Mobile-first (390pt design width)

### Auth for Anonymous Dine-in (modified)

- Menu browsing remains fully anonymous (no account required)
- Dine-in ordering is **capability-gated**, not `protectedProcedure`
- Order submission requires a valid `deviceSessionId` linked to an active `tableSession`
- The device session is minted when a guest scans a table QR with an active session
- No customer login, no guest checkout form — the device session IS the identity for the order

### Discovery for Dual-mode Search (modified)

- Search supports two explicit modes: **Food** and **Restaurant**
- Restaurant mode (default): optional name + cuisine (multi-select) + location/barangay (multi-select)
- Food mode: required dish query, returns restaurant cards with matched dishes underneath
- Query text persists across mode switches
- Location defaults to current location when not specified
- Search results always route to browse-mode restaurant pages

### Order Context & Capability Model (new)

The backend exposes a `menu_context` contract that determines what the client can do:

```ts
menu_context = {
  mode: "browse" | "dine_in_table" | "order_ahead",  // order_ahead disabled in v1
  can_add_to_cart: boolean,
  can_submit_order: boolean,
  table_session_id?: string,   // UUID, present in dine_in_table mode
  device_session_id?: string,  // UUID, present in dine_in_table mode
}
```

- `GET /r/{restaurantSlug}` → `mode: "browse"`, `can_add_to_cart: false`, `can_submit_order: false`
- `GET /t/{tablePublicId}` (active session) → `mode: "dine_in_table"`, `can_add_to_cart: true`, `can_submit_order: true`
- `GET /t/{tablePublicId}` (no active session) → `mode: "browse"`, `can_add_to_cart: false`, `can_submit_order: false`

The client renders UI based on `menu_context`. The server re-validates capability on every state-changing operation (add-to-cart is client-only, but submit is server-validated).

### Feature Flags (new)

Deferred features that have existing code are gated behind feature flags:

| Flag | Default (v1) | Controls |
|------|-------------|----------|
| `ff.saved_restaurants` | `false` | Saved/bookmarked restaurants UI entry points |
| `ff.reviews` | `false` | Ratings and reviews UI entry points |
| `ff.order_ahead` | `false` | Pickup / order-ahead checkout flow |
| `ff.digital_payments` | `false` | Payment proof upload, digital payment methods display |
| `ff.order_history` | `false` | Customer-side order history and reorder UI |

Code and schema remain for extensibility; only UI entry points are hidden.

### Payments (v1 — minimal)

- **Kept:** "Mark as Paid (Cash)" shortcut for dine-in tickets (owner action)
- **Deferred:** Payment method configuration display to customers, proof upload, payment verification flow, payment countdown timer
- **Schema:** Payment-related schema (`payment-method`, `payment-config`) stays in the database for extensibility but is not exposed in v1 customer flows
- **Rationale:** v1 dine-in is cash-at-counter by default. Digital payment integration is a Phase 2 concern.

### Order Lifecycle (v1 — simplified)

```
placed → accepted → preparing → ready → completed
```

- No payment gate between placed and accepted (unlike original PRD)
- For auto-accept branches: `placed → preparing → ready → completed` (skips accepted)
- Tickets are immutable after submit — no customer-side edit or cancel
- Each device submission creates a new ticket (no appending to previous tickets)
- `cancelled` status exists for owner-initiated rejection only

---

## 9. Data Model Updates

### New Entities

**`table`**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| branchId | UUID | FK to branch |
| tableNumber | varchar | Display number/name (e.g., "T1", "Patio 3") |
| publicId | varchar | Short URL-safe ID for QR codes |
| isActive | boolean | Whether table is available for sessions |
| createdAt | timestamptz | |
| updatedAt | timestamptz | |

**`tableSession`**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tableId | UUID | FK to table |
| branchId | UUID | FK to branch (denormalized for query efficiency) |
| status | enum | `active`, `closed` |
| openedBy | UUID | FK to profile (staff who opened) |
| closedBy | UUID | FK to profile (staff who closed, nullable) |
| openedAt | timestamptz | |
| closedAt | timestamptz | nullable |

**`deviceSession`**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tableSessionId | UUID | FK to tableSession |
| deviceFingerprint | varchar | Browser/device identifier |
| createdAt | timestamptz | |
| lastActiveAt | timestamptz | |

### Modified Entities

**`order`** — new columns:
| Column | Type | Description |
|--------|------|-------------|
| tableSessionId | UUID | FK to tableSession (nullable for future pickup) |
| deviceSessionId | UUID | FK to deviceSession (nullable for future pickup) |
| ticketCode | varchar | Human-readable ticket code (e.g., "A-042") |
| idempotencyKey | varchar | Client-generated key to prevent duplicate submissions |

The existing `tableNumber` varchar field is retained for display but populated from the `table` entity rather than manual input.

---

## 10. Phased Delivery (v1 Track A)

### v1-A: Foundation

- Table, TableSession, DeviceSession schema and migrations
- Capability model (`menu_context` contract) and backend enforcement
- Feature flag infrastructure and initial flags
- QR bootstrap flow (`/t/{tablePublicId}` → session validation → device session mint)
- Browse-only mode enforcement on discovery/direct URL paths

### v1-B: Dine-in Ordering Loop

- Wire checkout to create immutable tickets (not editable orders)
- Idempotency key enforcement on order submit
- Server-side item/modifier availability validation at submit time
- Browse-only UI gating (disable cart/submit in browse mode, show CTA)
- Ticket confirmation screen with ticket code and table number
- Ticket status tracking for customers (placed → accepted → preparing → ready → completed)

### v1-C: Owner Operations

- Table management UI (define tables, generate QR per table)
- Session open/close UI for staff
- Ticket feed (replaces order dashboard for v1)
- Auto-accept wiring for branches that opt in
- Branch authorization hardening (ensure tickets only flow to correct branch)
- "Mark as Paid (Cash)" for dine-in tickets

### v1-D: Search v1

- Dual-mode toggle (Food | Restaurant) on search interface
- Food search API endpoint (dish query → restaurants with matched dishes)
- Query persistence across mode switches
- Location fallback to current position
- Partial matching implementation

---

## 11. Acceptance Criteria (Release Gate)

1. Discovery and direct URLs cannot submit orders (browse-only enforced server-side).
2. Valid table-session QR flow can submit a ticket without customer login.
3. Submitted tickets cannot be edited or cancelled by the customer.
4. Multiple devices can submit separate tickets for the same active table session.
5. Internal ticket feed shows correct table number, ticket code, and modifier details on every ticket.
6. Saved Restaurants and Reviews UI entry points are not visible in v1.
7. Idempotent submit prevents duplicate ticket creation on retry or double-tap.
8. Closed table sessions block new submissions from any associated device session.
9. Item/modifier availability is re-validated at submit time (not just at add-to-cart).
10. Search supports Food | Restaurant toggle with correct result shapes for each mode.

---

## 12. Implementation Status

### Built (ready to use)

| Component | Location | Notes |
|-----------|----------|-------|
| Auth (Supabase) | `src/modules/auth/` | Login, register, magic link, Google OAuth |
| Organization/Restaurant/Branch management | `src/modules/organization/`, `restaurant/`, `branch/` | Full CRUD |
| Onboarding wizard | `src/features/onboarding/` | 10 files, 7-step flow |
| Menu management (owner) | `src/modules/menu/`, `src/features/menu-management/` | Full CRUD for categories, items, variants, modifiers |
| Menu browsing (customer) | `src/features/menu/` | 13 components |
| Cart store (Zustand) | `src/features/cart/stores/cart.store.ts` | Persisted, smart merging, `useShallow` optimized |
| Cart UI | `src/features/cart/` | Drawer, floating button, items, summary |
| Discovery/search (restaurant mode) | `src/modules/discovery/`, `src/features/discovery/` | Text + cuisine + city filters, featured, nearby |
| Branch settings | `src/features/branch-settings/` | QR code, weekly hours, ordering toggle, auto-accept |
| Admin dashboard | `src/features/admin/`, `src/modules/admin/` | Verification queue, restaurant/user management |
| Verification flow | `src/modules/verification/`, `src/features/verification/` | Document upload + admin review |
| Payment method config (owner) | `src/modules/payment-config/`, `src/features/payment-config/` | GCash, Maya, bank account setup |
| Profile management | `src/modules/profile/`, `src/features/profile/` | User profile CRUD |
| Storage/uploads | `src/modules/storage/` | File upload integration |

### Needs Modification

| Component | What Changes |
|-----------|-------------|
| Order module | `src/modules/order/` — Add `tableSessionId`, `deviceSessionId`, `ticketCode`, `idempotencyKey` to order creation. Add server-side capability validation. |
| Order schema | `src/shared/infra/db/schema/order.ts` — Add new columns for table session, device session, ticket code, idempotency key. |
| Checkout flow | `src/features/checkout/` — Wire to immutable ticket creation instead of editable orders. Add browse-mode gating. |
| Order management (owner) | `src/features/order-management/` — Refactor from order dashboard to ticket feed with table context. |
| Order tracking (customer) | `src/features/order-tracking/` — Show ticket code and table number. Remove payment-related UI. |
| Discovery search | `src/modules/discovery/` — Add Food mode search endpoint. Add dual-mode toggle. |
| QR code generation | `src/features/branch-settings/` — Change from branch-level QR to per-table QR generation. |
| Restaurant menu page | Route handler — Add `menu_context` contract to determine browse vs. dine-in mode. |

### Must Build (new)

| Component | Description |
|-----------|-------------|
| Table schema + module | `table`, `tableSession`, `deviceSession` entities, repositories, services, router |
| Table management UI (owner) | Define tables, open/close sessions, floor status view |
| QR bootstrap flow | `/t/{tablePublicId}` route → session validation → device session creation |
| Capability model | `menu_context` contract, server-side enforcement on order submit |
| Feature flag infrastructure | Flag definitions, server-side and client-side gating |
| Browse-only mode UI | Disable cart/submit, show "Scan QR to order" CTA |
| Idempotency enforcement | Idempotency key generation (client) and dedup (server) |
| Ticket code generation | Human-readable code generation (e.g., "A-042") for each submitted order |
| Food search API | Dish-name search returning restaurants with matched items |
| Dual-mode search UI | Food \| Restaurant toggle with query persistence |

### Must Hide (feature-flagged)

| Component | Flag | Current State |
|-----------|------|---------------|
| Saved restaurants UI | `ff.saved_restaurants` | Fully built (`src/features/saved-restaurants/`, `src/modules/saved-restaurant/`) — hide entry points |
| Reviews UI | `ff.reviews` | Fully built (`src/modules/review/`) — hide entry points |
| Customer order history | `ff.order_history` | Partially built (`src/features/orders/`) — hide entry points |
| Payment proof flow | `ff.digital_payments` | Partially built (`src/features/payment/`) — hide customer-facing surfaces |
| Pickup ordering | `ff.order_ahead` | Schema supports `orderType: 'pickup'` — hide from checkout UI |

---

## 13. Deferred Backlog

### Phase 2 (near-term — after v1 stability)

| # | Story (from original PRD) | Original # | Reason Deferred |
|---|---------------------------|-----------|-----------------|
| D-01 | Choose between dine-in and pickup at checkout | 21 | Pickup flow out of v1 scope |
| D-02 | Place a pickup order with name and phone number | 20 | Pickup flow out of v1 scope |
| D-03 | See accepted payment methods with account details | 27 | Digital payments out of v1 scope |
| D-04 | Copy-to-clipboard for payment account numbers | 28 | Digital payments out of v1 scope |
| D-05 | Upload payment proof (reference + screenshot) | 29 | Digital payments out of v1 scope |
| D-06 | Payment countdown timer | 30 | Digital payments out of v1 scope |
| D-07 | Pay with cash at the counter (customer-side UI) | 31 | Cash is default for v1; no separate UI needed |
| D-08 | Configure accepted payment methods (owner display to customers) | 66 | Payment config stays owner-only for v1 |
| D-09 | Add multiple payment methods with default | 67 | Payment config stays owner-only for v1 |
| D-10 | Review payment proof submitted by customers | 68 | No proof upload in v1 |
| D-11 | Confirm or reject payment per order | 69 | Simplified to "Mark as Paid (Cash)" only |
| D-12 | Set payment countdown duration | 78 | No payment countdown in v1 |

### Phase 3 (medium-term — after ordering loop proven)

| # | Story (from original PRD) | Original # | Reason Deferred |
|---|---------------------------|-----------|-----------------|
| D-13 | Bookmark/save restaurants for later | 37 | Retention feature; code exists, UI hidden |
| D-14 | View past orders (if logged in) | 38 | Retention feature; requires account |
| D-15 | "Reorder" button on past orders | 39 | Depends on order history |
| D-16 | Rate and review a restaurant | 40 | Retention feature; code exists, UI hidden |
| D-17 | See ratings and reviews on restaurant pages | 41 | Depends on reviews |
| D-18 | Receive promotional notifications | 42 | Notifications infrastructure not in v1 |
| D-19 | Push notifications on order status change | 26 | Notifications infrastructure not in v1 |
| D-20 | Push notifications on new order (owner) | 60 | Notifications infrastructure not in v1 |
| D-21 | Daily/weekly order summaries (owner) | 65 | Analytics feature |

### Future (later phases)

| # | Story (from original PRD) | Original # | Reason Deferred |
|---|---------------------------|-----------|-----------------|
| D-22 | Invite team members by email | 71 | Team access not in v1 |
| D-23 | Assign roles (Manager/Viewer) with permissions | 72 | Team access not in v1 |
| D-24 | Manager operational access | 73 | Team access not in v1 |
| D-25 | Viewer read-only access | 74 | Team access not in v1 |
| D-26 | Revoke team member access | 75 | Team access not in v1 |

---

## 14. Out of Scope

Permanent exclusions (not planned for any phase):

- **Bill splitting** — Designed in Figma but deferred indefinitely. Separate PRD when core loop is stable.
- **In-platform payment processing** — No Stripe/GCash API integration. Payments are manual/offline.
- **Platform commission / transaction fees** — No revenue model in the initial release.
- **Delivery orders** — Requires address management, fee calculation, driver assignment.
- **SEO guide pages** — Content marketing deferred.
- **Native mobile app** — PWA-first. Native apps may come later.
- **Multi-language support** — English only at launch.
- **Loyalty programs / promotions** — Deferred to retention phase.
- **Full analytics dashboard** — Basic order counts only.
- **Automated payment verification** — No bank/wallet API integration.
- **Chat/messaging** — Phone number is the contact method.

v1-specific clarity:

- **Pickup ordering** is deferred, not permanently excluded. The `orderType` enum and schema support it; UI entry points are hidden behind `ff.order_ahead`.
- **Digital payments** are deferred, not permanently excluded. Payment method schema exists; customer-facing UI is hidden behind `ff.digital_payments`.
- **Saved restaurants and reviews** are deferred, not permanently excluded. Code is fully built; UI entry points are hidden behind feature flags.

---

## 15. Testing Decisions

### Primary Test Surfaces (v1 Track A)

| Module | Why | Test Type |
|--------|-----|-----------|
| Cart store (Zustand) | Smart merging, quantity logic, price calculation | Unit (Vitest) |
| Table session service | Open/close lifecycle, multi-device joins, closed-session blocking | Unit (Vitest) |
| Order/ticket service | Capability validation, idempotency, immutability enforcement, status transitions | Unit (Vitest) |
| Menu service | Category/item CRUD, variant/modifier rules, availability checks | Unit (Vitest) |
| Capability model | `menu_context` contract enforcement (browse vs. dine-in gating) | Unit (Vitest) |
| Price calculation | Variant + modifier pricing, cart totals | Unit (Vitest) |
| Dual-mode search | Food mode vs. restaurant mode, partial matching, location fallback | Unit (Vitest) |
| Ticket lifecycle | Full flow from QR scan → session → cart → submit → status progression | Integration (Vitest) |
| Dine-in ordering flow | QR scan → browse → customize → cart → submit → confirmation | E2E (Playwright) |
| Browse-only enforcement | Discovery/direct URL → verify cart/submit disabled | E2E (Playwright) |
| Restaurant onboarding wizard | Multi-step flow completion | E2E (Playwright) |

### Test Infrastructure (kept)

- Vitest with jsdom environment, `server-only` shimmed
- `restoreMocks: true`, `clearMocks: true` — no mock leakage
- Service-level tests mock only the repository layer
- Tests in `src/__tests__/` mirroring the source tree

---

## 16. Further Notes

- The legacy CravingsPH validated that the modifier system (required/optional groups with min/max rules and priced add-ons) covers real restaurant needs. The new schema adds item variants as a first-class concept.
- The manual payment model is intentional and matches Philippine market behavior (GCash screenshots are the norm). v1 simplifies further to cash-only for dine-in.
- The organization → restaurant → branch hierarchy supports future features like chain management, franchise dashboards, and cross-branch analytics without schema changes.
- The `menu_context` capability model is the architectural keystone of v1. It cleanly separates "can see the menu" from "can place an order" and makes the distinction enforceable at the API layer rather than just the UI layer.
- Immutable tickets (no customer edit/cancel) simplify the kitchen workflow and eliminate a class of race conditions. Additional items are submitted as new tickets, which the kitchen already understands as separate orders for the same table.
- The `order_ahead` context is preserved in the capability model contract but disabled in v1. When pickup ships in Phase 2, it plugs into the same capability check without architectural changes.
