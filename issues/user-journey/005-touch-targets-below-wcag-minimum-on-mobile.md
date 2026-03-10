# Touch targets below WCAG minimum on mobile

Severity: high

## Summary

Multiple interactive elements across the customer portal use touch targets smaller than the 44×44px minimum recommended by WCAG 2.5.8 (Target Size). Default buttons are 36px tall, small buttons are 32px, and icon-only buttons (save heart, quantity picker) are 32px. On a mobile-first food-ordering app, undersized targets cause misclicks — especially mid-ordering when users are adjusting quantities or saving restaurants.

## Why this matters

- The app is mobile-first — touch target compliance is not optional.
- Misclicks on the quantity picker during ordering are high-frustration moments (user wants +1 but accidentally taps the item sheet or nearby modifier).
- The save heart button on restaurant cards (32px) overlaps the card's link area — a miss-tap navigates away from the page.
- WCAG 2.5.8 (Level AAA) and Apple HIG both specify 44px minimum; Android Material specifies 48dp.

## Expected

- All tappable elements are at least 44×44px in touch target area (visual size can be smaller if padding extends the hit area).
- Quantity picker buttons are large enough for confident tapping.
- Icon-only buttons have sufficient hit areas even if the icon is visually small.

## Actual

- Default button height: `h-9` = 36px (below 44px)
- Small button height: `h-8` = 32px (below 44px)
- Quantity picker +/- buttons: `size-8` = 32×32px
- Restaurant card save heart: `size-8` = 32×32px
- Menu item quick-add buttons: `size-9` = 36×36px
- Only the review star buttons at `size-11` = 44px meet the minimum.

## Code evidence

- Button size variants define h-8 and h-9 as standard sizes: [src/components/ui/button.tsx:23–30](src/components/ui/button.tsx#L23)
- Quantity picker buttons are 32px: [src/features/menu/components/quantity-picker.tsx:25–47](src/features/menu/components/quantity-picker.tsx#L25)
- Save heart button is 32px: [src/features/discovery/components/restaurant-card.tsx:126](src/features/discovery/components/restaurant-card.tsx#L126)
- Review star buttons correctly use 44px: [src/features/orders/components/review-sheet.tsx:78](src/features/orders/components/review-sheet.tsx#L78)

## Decision

Per requirements clarification (Q6 in `specs/customer-portal-navigation/requirements.md`): default to shadcn/ui sizing variations. Use existing component size variants (e.g., `size="lg"`) rather than custom sizing. No custom overrides. This is a conscious trade-off — shadcn's `size="icon"` is 36px, still below 44px. Revisit if user testing reveals tap accuracy issues on mobile.

## Recommended fix (if revisited)

1. Increase icon-only button minimum to `size-11` (44px) or add transparent padding to extend the hit area to 44×44px while keeping the visual size at 32px.
2. For the quantity picker, increase button size to at least 44px — this is a high-frequency interaction during ordering.
3. For the save heart, increase hit area or add padding. Consider moving it further from the card link edge to reduce accidental navigation.
4. Audit all customer-facing interactive elements against the 44px threshold.
