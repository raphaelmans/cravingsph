# Research: Deferred Features (Feature Flag Targets)

## 1. Saved Restaurants (`ff.saved_restaurants`)

**Status:** Fully implemented.

**Entry points to hide:**
| Location | What | Type |
|----------|------|------|
| `src/components/layout/customer-bottom-nav.tsx` | "Saved" nav tab → `/saved` | Nav link |
| `src/features/discovery/components/restaurant-card.tsx` | Heart save/unsave button overlay on every restaurant card | Button |
| `src/app/(protected)/saved/page.tsx` | Full saved restaurants page | Route |

**Backend stays:** `src/modules/saved-restaurant/` (router, service, repository) — no changes needed.

## 2. Reviews (`ff.reviews`)

**Status:** Fully implemented.

**Entry points to hide:**
| Location | What | Type |
|----------|------|------|
| `src/app/(public)/restaurant/[slug]/page.tsx` | `<RestaurantReviews>` section below menu | Component |
| `src/features/orders/components/customer-orders-page.tsx` | "Leave a review" button on completed orders | Button |
| `src/features/orders/components/review-sheet.tsx` | Review submission modal (1–5 stars + comment) | Sheet |

**Backend stays:** `src/modules/review/` (router, service, repository) — no changes needed.

## 3. Order History (`ff.order_history`)

**Status:** Fully implemented.

**Entry points to hide:**
| Location | What | Type |
|----------|------|------|
| `src/components/layout/customer-bottom-nav.tsx` | "Orders" nav tab → `/orders` | Nav link |
| `src/app/(protected)/orders/page.tsx` | Full customer orders page | Route |
| `src/features/orders/components/customer-orders-page.tsx` | Stats, order cards, reorder buttons | Component |

**Backend stays:** `order.listMine`, `order.reorder` procedures — no changes needed.

## 4. Payment Proof Flow (`ff.digital_payments`)

**Status:** UI implemented, backend partially stubbed.

**Customer-facing to hide:**
| Location | What | Type |
|----------|------|------|
| `src/features/payment/components/payment-sheet.tsx` | Payment method cards, countdown, proof upload | Sheet |
| `src/features/menu/components/restaurant-menu.tsx` | PaymentSheet integration after order placement | Integration |
| `src/app/(public)/restaurant/[slug]/order/[orderId]/page.tsx` | "Upload Payment Proof" button | Button |

**Owner-facing to hide:**
| Location | What | Type |
|----------|------|------|
| `src/app/(owner)/organization/payments/page.tsx` | Payment method configuration page | Route |
| `src/features/payment-config/` | Add/edit payment method dialogs | Components |
| `src/features/order-management/components/payment-proof-review.tsx` | Screenshot review + confirm/reject (EXCEPT "Mark as Paid (Cash)") | Component |

**Keep visible:** "Mark as Paid (Cash)" button for dine-in tickets.

## 5. Pickup Ordering (`ff.order_ahead`)

**Status:** Partially implemented.

**Entry points to hide:**
| Location | What | Type |
|----------|------|------|
| `src/features/checkout/components/order-type-selector.tsx` | Dine-in/Pickup radio toggle | Component |
| `src/features/checkout/components/checkout-sheet.tsx` | Pickup-specific fields (customerName, customerPhone) | Form fields |
| `src/features/payment/components/payment-sheet.tsx` | Pickup-specific payment branching | Conditional |

**When hidden:** Default to `orderType: "dine-in"`. Remove selector entirely. Schema field stays (`order.orderType` varchar).

## Summary

| Feature | # Entry Points | Complexity |
|---------|---------------|------------|
| Saved Restaurants | 3 (nav, card button, page) | Low |
| Reviews | 3 (restaurant page, order button, sheet) | Low |
| Order History | 3 (nav, page, component) | Low |
| Digital Payments | 6+ (customer sheet, owner page, config, review) | Medium |
| Pickup Ordering | 3 (selector, form fields, payment logic) | Low |

**Total:** ~18 entry points across 5 flags. All are UI-only gates — backend procedures remain accessible.
