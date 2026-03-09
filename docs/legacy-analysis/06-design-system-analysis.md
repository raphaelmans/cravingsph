# Design System Analysis

> Brand identity, visual language, and theme comparison — informed by the Figma source of truth and the legacy codebase.
> Figma file: `Cravings-PH` (cBJhwBIWN5aTPWd3thXuLT)

---

## The Core Issue

The Figma file defines a **complete, opinionated brand** — warm orange, pill-shaped, food-forward, with clear visual hierarchy. The legacy code implemented roughly 60% of these designs. The new codebase shipped with **shadcn's stock neutral theme** (monochrome black/white/gray) — the brand is entirely gone.

---

## Brand Identity (from Figma)

### Brand Color: `#f86006`

A bold, warm orange that appears on every single screen in the Figma file:
- The **"cravings" wordmark** — always orange, always lowercase, always with a dot over the "i" that resembles a plate/food
- **Primary action buttons** — "Add to cart", "Finish", "Next", "Split bill" — all solid orange pill buttons with white text
- **Price highlights** — peso amounts in orange (e.g. "₱138" on menu item sheets)
- **"Required" badge** — solid orange pill with white text
- **"Optional" badge** — orange-bordered pill with orange text (outlined variant)
- **Cart icon** — orange basket in the top-right header
- **Floating cart bar** — solid orange bottom bar
- **Category nav active state** — orange text
- **Quick-add button** — orange "+" circle on menu item cards
- **"Your total" label** — orange text
- **Bill page border** — full orange border framing the receipt
- **"Scan cravings QR" CTA** — orange pill button on home/discovery page
- **Coming Soon page** — cascading orange text with fading opacity
- **Admin sidebar active state** — orange text with orange left-border accent

Orange is not decorative — it IS the brand. Every interaction point, every call to action, every price display uses it.

### The Wordmark

"**cravings**" — all lowercase, custom styling where the dot on the "i" is stylized. It appears in the top-left of the header bar on every customer-facing screen. This is the primary brand element and it's always in orange.

### Secondary Color Palette (Bill Splitting)

The bill splitting feature introduces a **warm avatar color system** for identifying people:
- Orange circles (warm, darker)
- Yellow-orange circles (warm, medium)
- Yellow circles (warm, lighter)

This stays within the warm color family — no blues, greens, or cool tones anywhere in the customer experience.

### Admin Accent: Deep Purple/Indigo

The desktop admin panel (Menu Items screen) introduces a **secondary color**:
- Sidebar text and icons use a **deep indigo/navy** for non-active states
- The active nav item ("Menu Items") uses the brand orange
- "Dashboard" and "Restaurant" nav items are in this darker indigo tone

This creates a clear visual separation: **orange = customer-facing, indigo = admin/management**.

---

## Visual Language (from Figma)

### Shape: Pill-Shaped Everything

The single most distinctive design decision. Nearly every interactive element is **fully rounded (pill-shaped)**:

| Element | Shape | Notes |
| --- | --- | --- |
| Search bar | Pill | Full-width, light gray fill |
| "Add to cart" button | Pill | Solid orange, white text |
| "Split bill" button | Pill | Orange border, white fill |
| "Finish" / "Next" buttons | Pill | Solid orange, full-width |
| Quantity controls | Pill | Orange border container with -/+ |
| "Required" badge | Pill | Solid orange, small |
| "Optional" badge | Pill | Orange outline, small |
| Quick-add "+" button | Circle | Orange, overlapping item card corner |
| Profile picture | Circle | Overlaps cover photo |
| Person avatars (bill split) | Circle | Warm-colored initials |
| "Scan cravings QR" CTA | Pill | Solid orange, full-width, bottom-fixed |
| Category filter chips | Pill | Text only, no border (scrollable) |
| Person name input | Pill | Light gray fill |
| Person list items | Rounded rectangle | Softer corner, not fully pill |

Standard rectangles are only used for: menu item image containers, the bill receipt box, and content cards.

### Layout Patterns

**Customer Mobile (390pt width)**:
- Top bar: "cravings" wordmark (left) + cart icon (right)
- Hero: full-bleed cover photo with circular profile picture overlapping bottom
- Restaurant info: centered name, address, phone
- Search bar: full-width pill
- Category nav: horizontal scroll with hamburger menu icon
- Menu items: two layouts seen in Figma — list view (image left, text right) and the legacy layout (text left, image right)
- Bottom sheet: item details, cart, and bill splitting all slide up from bottom

**Admin Desktop (1512pt width)**:
- Left sidebar: "cravings" logo, nav items (Dashboard, Restaurant, Menu Items)
- Main content: header with "Add Item" button, search, category filter, sort
- Grid: 4-column card layout with item images, names, descriptions, prices
- Category sections with horizontal scroll arrows

### Spacing and Density

- **Generous white space** — content is never cramped
- **Clear section breaks** — thin divider lines between menu items
- **Comfortable touch targets** — buttons are large (full-width pills with ~48px height)
- **Content hierarchy** — bold headings, regular descriptions, orange prices

### Imagery

- **Food photography is prominent** — large item images, full-bleed cover photos
- **Rounded corners on images** — `rounded-lg` for item thumbnails
- **No illustrations or icons** beyond the Lucide icon set and the brand wordmark

---

## What Figma Designed but Legacy Never Built

The Figma file contains screens that go beyond what was coded:

| Screen | In Figma | In Legacy Code | In New Code |
| --- | --- | --- | --- |
| Restaurant menu (list layout) | Yes | Yes (different layout) | No |
| Restaurant menu (card + image-left layout) | Yes | No | No |
| Menu item sheet (customization) | Yes | Yes | No |
| Bill / receipt | Yes | Yes | No |
| Bill splitting — add people | Yes | No | No |
| Bill splitting — assign items | Yes | No | No |
| Bill splitting — per-person total | Yes | No | No |
| Home / discovery page | Yes | No | No |
| Restaurant search results | Yes | No | No |
| Category browsing (F&B, Restaurant) | Yes | No | No |
| "Scan cravings QR" CTA | Yes | No | No |
| Admin: Menu Items grid | Yes | No | No |
| Admin: Sidebar navigation | Yes | No | No |
| Coming Soon (mobile) | Yes | Yes | No |
| Coming Soon (desktop) | Yes | Yes (different) | No |

### Key Figma-Only Features

1. **Home / Discovery Page** — "Craving for something?" heading, search bar, category icons (F&B, Restaurant), restaurant cards with horizontal-scroll item previews, "Scan cravings QR" bottom CTA. This is a marketplace entry point that was never built.

2. **Bill Splitting** — A multi-step flow: add people by name → assign items to people (colored dot system) → view per-person totals. This is a significant social feature designed in detail (~20 screen variants in Figma).

3. **Admin Menu Management** — Desktop layout with sidebar nav, grid of menu items by category, search, category filter, sort by price, "Add Item" button.

4. **Alternative Menu Item Layout** — Figma shows a card layout with image on the left and text on the right (with orange "+" quick-add button), different from the legacy code's text-left/image-right layout.

---

## Theme Comparison: Figma vs New Codebase

| Token | Figma Design Intent | New Codebase Value | Match? |
| --- | --- | --- | --- |
| `--primary` | `#f86006` (warm orange) | `oklch(0.205 0 0)` (near-black) | **No** |
| `--primary-foreground` | White | White | Yes |
| `--background` | White | White | Yes |
| `--foreground` | Near-black | Near-black | Yes |
| `--border` | Light gray | Light gray | Yes |
| `--muted` | Light gray fills | Light gray | Yes |
| `--radius` | Pill (`rounded-full`) for most elements | `0.625rem` (standard rounded) | **No** |
| `--destructive` | Not shown in Figma | Red | N/A |
| Sidebar accent | Deep indigo/navy | Neutral gray | **No** |
| Shape language | Pill-first | Rectangle-first | **No** |
| Price color | Orange (`--primary`) | Would be foreground (black) | **No** |

**4 out of 5 brand-defining tokens/patterns are wrong in the new codebase.**

---

## Recommendations

### Before Any Feature Work

1. **Set `--primary` to `#f86006`** — one change, entire brand returns. Every shadcn button, checkbox, radio, and focus ring will pick it up automatically.

2. **Consider a custom `--brand-accent`** for the admin sidebar indigo color — or map it to `--sidebar-primary` so admin and customer experiences feel distinct.

### During Menu UI Build

3. **Use `rounded-full` for all customer-facing action elements** — buttons, badges, search bars, inputs, quantity controls. This is the strongest visual differentiator from generic shadcn apps.

4. **Keep `rounded-lg` for content containers** — image thumbnails, item cards, the bill receipt box. Not everything should be a pill.

5. **Orange for prices** — In Figma, peso amounts on item detail sheets are orange. This is a small but important detail for visual scanning.

### For New Features Not Yet in Legacy

6. **Bill splitting needs a warm avatar palette** — oranges, yellows, warm tones only. Don't default to shadcn's cool chart colors.

7. **Discovery/home page** uses the same orange-first design language plus horizontal-scroll restaurant cards with food imagery. The visual pattern is: large food photos sell, text supports.

8. **Admin dashboard** should use the indigo/navy sidebar with orange as the active accent — this creates a professional feel while staying on-brand. The shadcn sidebar variables (`--sidebar-primary`, etc.) can handle this.

### Consider

9. **A soft peach/cream background variant** — the Coming Soon page uses a warm peach gradient wash. This could become a branded background for hero sections or empty states, mapped to `--accent` or a custom token.

10. **The "cravings" wordmark** needs to be treated as a logo component, not just styled text — it appears on every screen and is the primary brand mark.
