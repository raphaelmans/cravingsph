# Gap Analysis

> Missing product capabilities by user type.
> Updated with Figma designs as the source of truth — the Figma file contains features designed but never coded.

## Customer Gaps

| Capability | Designed (Figma) | Built (Legacy) | Built (New) | Gap |
| --- | --- | --- | --- | --- |
| Browse a restaurant menu | Yes | Yes | No | Must be rebuilt |
| Search menu items | Yes | Yes | No | Must be rebuilt |
| Customize items (add-ons, sizes) | Yes | Yes | No | Must be rebuilt |
| Build a cart | Yes | Yes | No | Must be rebuilt |
| View bill/total | Yes | Yes | No | Must be rebuilt |
| Split bill with friends | Yes (20+ screens) | No | No | Designed, never built |
| Discover restaurants (home feed) | Yes | No | No | Designed, never built |
| Search/browse by category (F&B, Restaurant) | Yes | No | No | Designed, never built |
| Scan QR to open menu | Yes (CTA designed) | No | No | Designed, never built |
| Create an account | No | No | Yes | Done |
| Place an order | No | No | No | Never designed or built |
| Pay online | No | No | No | Never designed or built |
| Track order status | No | No | No | Never designed or built |
| View order history | No | No | No | Never designed or built |
| Rate/review a restaurant | No | No | No | Never designed or built |
| Receive notifications | No | No | No | Never designed or built |
| Use on desktop (customer) | No | No | No | Never designed |

## Restaurant Owner Gaps

| Capability | Designed (Figma) | Built (Legacy) | Built (New) | Gap |
| --- | --- | --- | --- | --- |
| View menu items (admin grid) | Yes | No | No | Designed, never built |
| Add menu items | Yes (button designed) | No | No | Designed, never built |
| Search/filter/sort menu | Yes | No | No | Designed, never built |
| Admin sidebar navigation | Yes | No | No | Designed, never built |
| Dashboard (admin home) | Yes (nav item only) | No | No | Designed, details TBD |
| Restaurant settings | Yes (nav item only) | No | No | Designed, details TBD |
| Register as a restaurant | No | No | No | Never designed |
| Set prices and customizations | No | No | No | Never designed |
| Upload images | No | No | No | Never designed |
| Manage branches | No | No | No | Never designed |
| View incoming orders | No | No | No | Never designed |
| Update order status | No | No | No | Never designed |
| View sales/analytics | No | No | No | Never designed |
| Set operating hours | No | No | No | Never designed |
| Mark items sold out | No | No | No | Never designed |

## Platform / Business Gaps

| Capability | Status | Notes |
| --- | --- | --- |
| Revenue generation (any) | Not designed or built | No payment or subscription flow |
| Customer retention | Partial | Accounts exist (new) but nothing to come back for |
| Restaurant onboarding | Not designed | No self-service, requires manual data entry |
| Multi-restaurant support | Partially designed | Figma home page shows multiple restaurants |
| Restaurant discovery | Designed, not built | Home feed with restaurant cards and category browsing |
| QR code distribution | Designed, not built | "Scan cravings QR" CTA on home page |
| Bill splitting (social feature) | Fully designed, not built | Could drive group usage and word-of-mouth |
| Brand identity | Fully designed | `#f86006` orange, pill shapes — see [06-design-system-analysis.md](./06-design-system-analysis.md) |
| Data isolation between restaurants | Not addressed | |
| Content moderation | Not addressed | |
| Customer support channel | Not addressed | |

## What Can Be Carried Forward

These product patterns are validated by both design and legacy implementation:

1. **Branch-based URL structure** — `/restaurant/[slug]` works well for QR codes and sharing
2. **Category-based menu organization** — natural mental model for customers
3. **Modifier system with rules** — required/optional, min/max, priced add-ons covers real restaurant needs
4. **Cart merging behavior** — identical items combine automatically
5. **Persistent local cart** — customers don't lose selections on refresh
6. **Philippine address model** — province → city → barangay hierarchy

## Figma-Only Opportunities (Designed but Never Prioritized for Code)

These represent product thinking that was done but never shipped:

1. **Bill Splitting** — The most heavily designed feature never built (~20 screen variants). Multi-step: add people → assign items with color-coded avatars → view per-person totals. This is a social/viral feature that could drive group adoption.

2. **Restaurant Discovery** — Home page with "Craving for something?" prompt, search, category icons, restaurant cards with horizontal food image previews. This transforms the product from "menu viewer for one restaurant" into a marketplace.

3. **QR Code Entry** — "Scan cravings QR" is a designed CTA, suggesting the intended distribution model: restaurants display QR codes → customers scan → land on menu.

4. **Admin Menu Management** — Desktop grid layout for restaurant owners to view and manage menu items by category, with search, filter, sort, and "Add Item" capability.
