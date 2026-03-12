# 🍽️ CravingsPH Product Guide (Detailed, Blackbox)

> **Version:** v3  
> **Audience:** Product Head, Product Team, QA, Ops, Founders  
> **Purpose:** A relay-ready guide to explain how CravingsPH works end-to-end, what is already implemented, and what still needs alignment.

---

## 📚 Table of Contents

1. [Guide Purpose & How to Use This](#1-guide-purpose--how-to-use-this)
2. [Platform at a Glance](#2-platform-at-a-glance)
3. [Personas & Jobs-to-be-Done](#3-personas--jobs-to-be-done)
4. [End-to-End Journey Map](#4-end-to-end-journey-map)
5. [Detailed Journey Guides](#5-detailed-journey-guides)
   - [Journey 1: Discovery & Search (Proposed MVP UX)](#journey-1--discovery--search-proposed-mvp-ux)
   - [Journey 2: Owner Setup & Launch Readiness](#journey-2--owner-setup--launch-readiness)
   - [Journey 3: Dine-in Ordering Flow](#journey-3--dine-in-ordering-flow)
   - [Journey 4: Owner Operations & Fulfillment](#journey-4--owner-operations--fulfillment)
   - [Journey 5: Governance & Maturity](#journey-5--governance--maturity)
6. [Existing Implementation Inventory (Today)](#6-existing-implementation-inventory-today)
7. [KPI Scoreboard by Journey Stage](#7-kpi-scoreboard-by-journey-stage)
8. [Scope Boundaries: Now vs Next](#8-scope-boundaries-now-vs-next)
9. [Product Head Relay Script](#9-product-head-relay-script)
10. [Onboarding Checklist](#10-onboarding-checklist)

---

## 1) Guide Purpose & How to Use This

This guide is intentionally **blackbox**.

That means every section is explained as:
- **User action** →
- **Platform response** →
- **Business outcome**

Use this document in:
- Product planning
- Leadership updates
- QA acceptance walkthroughs
- Cross-functional onboarding

✅ **Use this for alignment**  
❌ **Don’t use this as code-level implementation documentation**

---

## 2) Platform at a Glance

CravingsPH is a dine-in-first restaurant ordering platform.

### Core promise
- For customers: fast and clear ordering
- For restaurants: predictable operations under real service pressure
- For product leadership: explicit scope control and measurable outcomes

### Current release lens
🎯 **Table-first dine-in reliability**

---

## 3) Personas & Jobs-to-be-Done

### 👤 Dine-in Customer
- **Job:** Order quickly and correctly at the table.
- **Pain:** Waiting for staff, unclear options, uncertainty after ordering.
- **Win:** Smooth scan → order → confirmation experience.

### 🧑‍🍳 Owner / Floor Staff
- **Job:** Keep service moving while avoiding table/order confusion.
- **Pain:** Manual errors, queue chaos, wrong-table incidents.
- **Win:** Branch controls + clear ticket lifecycle.

### 🔥 Kitchen / Ops
- **Job:** Execute complete and accurate tickets fast.
- **Pain:** Order ambiguity, duplicate tickets, late changes.
- **Win:** Clean, stable tickets and reliable status flow.

### 📈 Product Team / Leadership
- **Job:** Ship a focused MVP that proves product value safely.
- **Pain:** Scope drift and unclear release readiness.
- **Win:** Stage-based metrics and explicit now-vs-next boundaries.

---

## 4) End-to-End Journey Map

### Stage A — Discover
Users browse/search restaurants and menus to build intent.

### Stage B — Setup
Owners configure org, restaurant, branch, menu, and branch controls.

### Stage C — Order
Customer enters dine-in context, customizes, and submits an order.

### Stage D — Fulfill
Owner/staff process tickets and complete service lifecycle.

### Stage E — Govern & Improve
Admin/product teams manage quality, scope, and maturity roadmap.

---

## 5) Detailed Journey Guides

## Journey 1 — Discovery & Search (Proposed MVP UX)

### Objective
Support both user intents clearly:
1) find a **restaurant**  
2) find a **dish/food**

This journey is based on `cravings-v1-comments.docx` search proposal.

### Prerequisites
- Search interface is available
- Restaurant and dish metadata are indexed
- Location is available for default fallback behavior

### Step-by-step flow

#### Step 1: Mode selection
- User enters search screen
- User sees: **Food | Restaurant** toggle
- Default mode: **Restaurant**

✅ Done when user understands there are 2 search intents.

#### Step 2: Query persistence across modes
- User types in search field
- User switches modes
- Typed text stays in field (no reset)

✅ Done when switching mode does not force retyping.

#### Step 3: Restaurant mode inputs (all optional)
- Restaurant name (optional)
- Cuisine (multi-select)
- Barangay (multi-select)

Valid combinations include:
- name only
- cuisine only
- barangay only
- any mixed combination

✅ Done when user can search with partial info.

#### Step 4: Restaurant mode location fallback
- If no barangay selected → default to current location

✅ Done when user still gets relevant results without manual location input.

#### Step 5: Restaurant mode results
- Output: restaurant cards
- MVP ranking priority:
  1. Distance
  2. Query match (name/cuisine)

✅ Done when users can shortlist restaurants quickly.

#### Step 6: Food mode required input
- Food Name is **required**
- Empty food query should be blocked

✅ Done when users are guided to enter dish term before search.

#### Step 7: Food mode location behavior
- Barangay optional and multi-select
- If blank → default to current location

✅ Done when scope can be narrowed or broadened predictably.

#### Step 8: Food mode results shape
- Output should still be **restaurant-first**
- Each restaurant shows matched dishes underneath

Example:
- ABC Cafe (Guadalupe) → Matched: Butter Croissant, Chocolate Croissant

✅ Done when users are encouraged to open restaurant menu pages.

#### Step 9: MVP matching behavior
- Case-insensitive
- Partial matching (e.g., `croiss` → `croissant`)
- Simple SQL LIKE-style logic is acceptable for MVP

✅ Done when search is predictable, simple, and testable.

### Checkpoints for Product/QA
- Toggle exists and defaults to Restaurant
- Query persists when switching mode
- Food mode enforces required dish input
- Barangay fallback to current location works in both modes
- Restaurant results and Food results have distinct expected output structures

### Current status
🟡 **Partial / mixed**

- Search currently works for restaurant discovery flow
- Full dual-mode contract (with all proposed constraints/output patterns) needs final parity

---

## Journey 2 — Owner Setup & Launch Readiness

### Objective
Enable owner to self-serve setup from blank state to branch-ready operations.

### Steps
1. Create organization
2. Add restaurant profile
3. Add branch
4. Build menu (categories, items, variants, modifiers)
5. Configure branch settings (ordering, auto-accept, countdown, hours)
6. Configure payment methods
7. Submit verification docs

✅ Done when branch is ready for live service and verification state is visible.

### Current status
🟢 **Live now**

- 7-step onboarding flow exists
- Restaurant/branch/menu/payment/verification surfaces are available

---

## Journey 3 — Dine-in Ordering Flow

### Objective
Convert seated customer intent into an accurate, fulfillable ticket.

### Steps
1. Customer activates dine-in ordering context
2. Customer customizes items and adds to cart
3. Customer reviews and submits
4. Customer views order confirmation + tracking state
5. Customer handles payment flow (where applicable)

✅ Done when customer gets clear confirmation and can understand current order state.

### Current status
🟡 **Partial / mixed**

- Customization/cart UX is strong
- Checkout/tracking/payment screens exist
- But submit/tracking/payment lifecycle wiring still has partial/placeholder behavior in current flow
- Guest dine-in policy alignment still needs closure

---

## Journey 4 — Owner Operations & Fulfillment

### Objective
Keep service execution predictable during live operations.

### Steps
1. Monitor branch order queue (inbox/active/completed/cancelled)
2. Accept/reject and progress order statuses
3. Review/confirm/reject payment proof states
4. Use branch controls (pause/live, auto-accept policy)

✅ Done when order flow is branch-correct, auditable, and operationally stable.

### Current status
🟡 **Partial / mixed**

- Owner order operations are feature-rich today
- Remaining risk is hardening and strict alignment:
  - branch authorization correctness
  - deterministic ingestion behavior
  - payment proof lifecycle symmetry

---

## Journey 5 — Governance & Maturity

### Objective
Maintain platform quality while preparing next-wave capabilities.

### Steps
1. Admin processes verification queue
2. Admin monitors users/restaurants
3. Product decides retention exposure (saved/reviews) based on release scope
4. Leadership prioritizes maturity gaps (team access + notifications)

✅ Done when governance is active and maturity gaps are explicit/owned.

### Current status
🟡 **Partial / mixed**

- Admin governance surfaces are live
- Retention surfaces currently exist but may conflict with strict v1 deferment
- Team access + notifications are not fully delivered end-to-end

---

## 6) Existing Implementation Inventory (Today)

## ✅ Live Now

### Owner setup and management
- Onboarding wizard (org → restaurant → branch → menu → payment → verification)
- Restaurant and branch management pages
- Menu management flows

### Branch settings
- Ordering on/off toggle
- Auto-accept toggle
- Payment countdown settings
- Weekly operating hours editor
- QR preview surface

### Admin governance
- Admin dashboard
- Verification queue and review
- Restaurant management
- User management

---

## 🟡 Partial / Mixed

### Customer order completion loop
- Strong discovery/menu/cart UX
- Checkout/tracking/payment screens exist
- Final submit/tracking/payment lifecycle parity still incomplete

### Owner operations hardening
- Rich queue/action surfaces exist
- Needs strict policy hardening and alignment closure

### Search proposed contract parity
- Current search exists
- Proposed dual-mode UX from comments doc not fully implemented end-to-end

---

## ⚪ Not Yet in Product (End-to-End)

### Team access workflows
- Invite/manage/revoke team in owner portal not fully surfaced

### Notifications/realtime user-facing behavior
- Full push/realtime lifecycle not fully delivered in product UX

---

## 7) KPI Scoreboard by Journey Stage

### Discover
- Search mode usage split (Food vs Restaurant)
- Search-to-restaurant-click rate
- Browse-to-order-intent progression

### Setup
- Onboarding completion rate
- Time to first operational branch
- Menu completeness rate

### Order
- Activation-to-submit conversion
- Submit success rate
- Duplicate/invalid submit incidents

### Fulfill
- Accept-to-ready time
- Completion SLA by branch
- Payment decision turnaround

### Govern
- Verification turnaround time
- Support/dispute volume
- Scope adherence (no accidental out-of-scope release)

---

## 8) Scope Boundaries: Now vs Next

## 🟢 Now
- Table-first dine-in reliability
- Owner setup + operations hardening
- Journey-based QA acceptance

## 🟡 Next
- Owner team access workflows
- Notifications/realtime polish
- Retention expansion only after explicit release decision

⚠️ **Important:** Saved/reviews currently appear in some implementation surfaces; keep this an explicit product decision.

---

## 9) Product Head Relay Script

### 1) Opening (60 sec)
“CravingsPH is a dine-in operating loop: discovery creates intent, table context enables valid ordering, submit creates reliable tickets, and owner operations close the service loop.”

### 2) Current-state truth (90 sec)
“Owner setup and admin governance are already strong. Customer order completion is partially wired and needs final reliability hardening. Team access and notifications are known maturity gaps.”

### 3) Release focus (60 sec)
“We should prioritize policy and lifecycle correctness—search contract clarity, submit reliability, branch authorization, and payment lifecycle symmetry—before adding breadth.”

### 4) Decision ask (30 sec)
“Confirm now-vs-next boundaries explicitly, especially retention exposure, so teams do not accidentally ship outside the release contract.”

---

## 10) Onboarding Checklist

- [ ] Read all 5 journeys end-to-end
- [ ] Pick your team role and map to a journey stage
- [ ] For your current task, define user action → platform response → business outcome
- [ ] Verify whether target capability is Live / Partial / Not Yet
- [ ] Confirm your task belongs to Now scope
- [ ] Define KPI movement expected from your change

---

## ✅ Final North-Star

CravingsPH should make dine-in ordering effortless for customers and dependable for restaurant teams—while giving product leadership precise control over scope and release risk.
