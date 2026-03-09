# Product Priorities

> Recommended build order by business value and dependency chain.

---

## Phase 1: Restore the Menu Experience

**Goal**: Get back to where the legacy product was — customers can browse menus and build carts.

**Why first**: This is the only validated user-facing feature. Everything else builds on top of it. Without a menu, there's nothing to order from.

**Delivers**:
- Customer can visit `/restaurant/[branch-slug]` and browse the full menu
- Customer can customize items with add-ons and modifiers
- Customer can build and manage a cart with a running total
- Customer can view restaurant info, contact number, location

**Key decisions**:
- Keep the cart local-only (no account required to browse/cart) or require login?
- Support desktop this time or stay mobile-first?

---

## Phase 2: Restaurant Onboarding

**Goal**: Let restaurant owners set up their own presence without manual database work.

**Why second**: Without self-service onboarding, every new restaurant is a manual ops task. This is the scaling bottleneck.

**Delivers**:
- Restaurant owner creates an account and registers their restaurant
- Owner adds branch locations with address, contact, and images
- Owner builds their menu: categories, items, prices, images
- Owner configures item customizations (sizes, add-ons, extras)
- Owner can edit and update everything after initial setup

**Key decisions**:
- Approval flow? (owner signs up → admin approves → goes live) or instant publish?
- Who pays for onboarding — free tier or paid from day one?
- Image upload limits or guidelines?

---

## Phase 3: Ordering & Checkout

**Goal**: Close the loop — customers can actually place orders.

**Why third**: This is the core value proposition. Menu browsing without ordering is a brochure, not a product. But it depends on Phase 1 (menu) and Phase 2 (restaurants to order from).

**Delivers**:
- Customer submits cart as an order
- Customer sees order confirmation with details
- Order appears on the restaurant's dashboard
- Basic order status: placed → accepted → preparing → ready
- Customer can view current order status

**Key decisions**:
- Payment at this phase or cash-only first? (Cash-only de-risks and ships faster)
- Dine-in only, or also pickup/delivery?
- Does the customer need an account to order, or allow guest checkout?
- Real-time order updates or polling?

---

## Phase 4: Order Management for Restaurants

**Goal**: Give restaurants the tools to handle incoming orders efficiently.

**Why fourth**: Tightly coupled with Phase 3 — once orders flow in, restaurants need to manage them.

**Delivers**:
- Restaurant dashboard showing incoming orders
- Accept/reject orders
- Update order status (preparing → ready → completed)
- Order history and daily summary
- Notification when new order arrives

**Key decisions**:
- Sound/push notification for new orders?
- Auto-accept or manual accept?
- Estimated preparation time?

---

## Phase 5: Payments

**Goal**: Enable online payment so the platform can take a cut and customers can pay digitally.

**Why fifth**: Cash-on-pickup/dine-in can work for early adopters. Payments unlock revenue but add complexity (refunds, disputes, compliance).

**Delivers**:
- Customer pays online during checkout
- Restaurant receives payout
- Platform takes a transaction fee or commission
- Refund handling for cancelled orders

**Key decisions**:
- Payment provider? (GCash, Maya, card payments — what's standard in PH?)
- Commission model? (per-transaction fee, monthly subscription, or hybrid?)
- Handle refunds automatically or manually?

---

## Phase 6: Discovery & Growth

**Goal**: Let customers find restaurants without needing a direct link.

**Delivers**:
- Home page with restaurant listings
- Search by name, cuisine, location
- Filter by area, category, rating
- Restaurant profiles with menus, hours, reviews
- QR code generation for restaurants to distribute

**Key decisions**:
- Geographic scope at launch? (one city? one province? nationwide?)
- Curated listings or open marketplace?
- SEO strategy for restaurant pages?

---

## Phase 7: Retention & Engagement

**Goal**: Give customers reasons to come back.

**Delivers**:
- Order history with reorder capability
- Favorite restaurants and items
- Push notifications for order updates
- Ratings and reviews
- Loyalty program or promotions

---

## Dependency Chain

```
Phase 1 (Menu) ─────→ Phase 3 (Ordering) ─────→ Phase 5 (Payments)
                          │                           │
Phase 2 (Onboarding) ────┘                           │
                          │                           │
                     Phase 4 (Order Mgmt) ────────────┘
                                                      │
                                              Phase 6 (Discovery)
                                                      │
                                              Phase 7 (Retention)
```

## Minimum Viable Product

The absolute minimum to test product-market fit:

**Phases 1 + 2 + 3** — A customer can browse a restaurant's menu, customize and cart items, and place an order. A restaurant owner can set up their menu and see incoming orders. Cash payment only. Single city.

This answers the fundamental question: **will Philippine restaurants and their customers use a digital ordering platform?**
