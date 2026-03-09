# User Journey Gaps

> Where user journeys break down today.

---

## Journey 1: Customer Orders Food

```
Customer scans QR code at restaurant
  → Lands on branch menu page              ✅ Legacy had this
    → Browses menu by category              ✅ Legacy had this
      → Taps an item, customizes it         ✅ Legacy had this
        → Adds to cart                      ✅ Legacy had this
          → Reviews cart and total           ✅ Legacy had this
            → Taps "Place Order"            ❌ DEAD END — no ordering
              → Pays                        ❌ DEAD END — no payments
                → Receives order            ❌ DEAD END — no tracking
                  → Gets notified           ❌ DEAD END — no notifications
```

**Where it breaks**: After building a cart, the customer has no way to actually order. The cart is a dead end. The bill page shows a receipt-like view, but it's not connected to anything.

**Impact**: The core value proposition — ordering food — is completely missing.

---

## Journey 2: Restaurant Owner Sets Up

```
Owner wants to list their restaurant
  → Registers an account                   ❌ No restaurant registration
    → Creates restaurant profile            ❌ No self-service setup
      → Adds branches                       ❌ No branch management
        → Builds their menu                 ❌ No menu editor
          → Uploads images                  ❌ No image upload UI
            → Shares QR code/link           ❌ No QR generation
```

**Where it breaks**: Step 1. Restaurant owners have zero self-service. In the legacy product, all restaurant data was manually inserted into the database. There is no path for a restaurant to onboard itself.

**Impact**: The platform cannot scale. Every new restaurant requires manual work.

---

## Journey 3: Customer Discovers a Restaurant

```
Customer is hungry, opens CravingsPH
  → Sees nearby restaurants                 ❌ No discovery
    → Filters by cuisine/location           ❌ No search or filters
      → Picks a restaurant                  ❌ No restaurant listing
        → Browses their menu                ✅ Legacy had this (if they have the direct link)
```

**Where it breaks**: Step 1. There is no way to discover restaurants. Customers must already have a direct link. The home page is a "Coming Soon" landing.

**Impact**: The product depends entirely on restaurants distributing their own links. No organic traffic, no marketplace dynamics.

---

## Journey 4: Returning Customer Reorders

```
Customer wants to reorder from last time
  → Opens CravingsPH
    → Logs in                               ✅ New codebase has this
      → Views order history                 ❌ No order history
        → Taps "Reorder"                    ❌ No reorder flow
          → Confirms and pays               ❌ No checkout
```

**Where it breaks**: After login. Accounts exist but have nothing tied to them — no orders, no favorites, no history.

**Impact**: No retention mechanism. Users have no reason to create an account.

---

## Journey 5: Restaurant Manages Orders

```
Restaurant receives an order
  → Sees order notification                 ❌ No order system
    → Views order details                   ❌ No order dashboard
      → Accepts/prepares order              ❌ No status management
        → Marks as ready                    ❌ No status updates
          → Customer is notified            ❌ No notifications
```

**Where it breaks**: Step 1. No orders can be placed, so no orders can be managed. The entire restaurant-side experience is nonexistent.

**Impact**: Even if ordering were added for customers, restaurants have no tools to receive or fulfill orders.

---

## Summary of Breakpoints

| Journey | Breaks At | Severity |
| --- | --- | --- |
| Customer orders food | After cart — no checkout | Critical |
| Restaurant onboards | Step 1 — no self-service | Critical |
| Customer discovers restaurants | Step 1 — no discovery | High |
| Customer reorders | After login — no history | Medium |
| Restaurant manages orders | Step 1 — no order system | Critical (blocked by ordering) |

The three **critical** gaps — ordering, restaurant onboarding, and order management — must all exist for the product to deliver its core value proposition. They form a chicken-and-egg dependency: customers can't order if restaurants aren't set up, and restaurants won't set up if customers can't order.
