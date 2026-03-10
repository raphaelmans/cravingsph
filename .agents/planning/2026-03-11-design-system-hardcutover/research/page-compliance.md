# Page-Level Compliance Audit

## Summary
Pages are internally consistent with each other but have systemic gaps vs the Design System spec (captured in other research files — typography, colors, spacing, components, motion).

## Per-Page Notes

### Home/Discovery
- Layout: `flex min-h-dvh flex-col`, horizontal scroll sections
- Hero: `bg-peach px-6 pb-8 pt-12` with `text-peach-foreground`
- Cards: ScrollArea horizontal, vertical grid `gap-3 px-4`
- Issues: Restaurant card image ratio wrong (2.3:1 not 4:3), p-3 not p-4

### Restaurant Detail
- RestaurantHeader with full-width cover image, logo overlay
- Menu section with category tabs
- Typography: `font-heading text-xl font-bold` (font-heading undefined)
- Clean layout with good hierarchy

### Search
- Sticky header z-30, search with pill input
- Filter bar: location dropdown + cuisine horizontal scroll
- Results: `grid gap-3 sm:grid-cols-2` responsive
- Well-structured empty state

### Orders
- Gradient: `from-peach via-background to-background`
- Stats cards: `sm:grid-cols-3`, `font-heading text-3xl font-bold`
- Uses `text-[10px]` in nav labels (should be text-xs)
- Order cards with status badges using semantic colors

### Saved Restaurants
- Same gradient pattern as Orders
- Max-width: `max-w-4xl`
- Saved cards with cuisine badges, notes section
- Consistent with Orders page styling

### Account
- Same gradient pattern
- Two-column layout on lg: `lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]`
- Navigation links as flex rows with arrows
- Portal switch link for org owners

### Auth Pages
- Centered: `flex min-h-screen items-center justify-center`
- Gradient: `from-peach/60 via-background to-background`
- Card max-width: `max-w-md`
- Clean form hierarchy

## Cross-Cutting Issues
All pages share these systemic gaps (detailed in other research files):
- `font-heading` undefined (affects all pages using it)
- Design tokens don't match spec (accent, ring, foreground colors wrong)
- No hover elevation on cards
- No button scale feedback
- 12px spacing values break 8px grid
