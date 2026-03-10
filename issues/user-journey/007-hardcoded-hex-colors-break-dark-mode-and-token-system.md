# Hardcoded hex colors break dark mode and token system

Severity: medium

## Summary

Three customer pages use the hardcoded hex color `#fff8f2` (warm peach) in their background gradient instead of a design token. This color is not part of the OKLCH token system defined in `globals.css` and has no dark-mode counterpart, meaning these pages show a light peach gradient even in dark mode.

## Why this matters

- The codebase has a well-defined OKLCH color token system with dark-mode variants — this bypasses it entirely.
- In dark mode, `from-[#fff8f2]` renders a light peach gradient on a dark background, creating a jarring visual break.
- The same hardcoded value appears in three separate files — a change requires updating all three.
- A `bg-peach` token already exists in the CSS that handles dark mode correctly, making this an unnecessary deviation.

## Expected

- Page background gradients use design tokens that respect dark-mode switching.
- The warm peach accent comes from the existing `--peach` / `--peach-foreground` tokens.

## Actual

- Orders page: `from-[#fff8f2] via-background to-background`
- Saved page: `from-[#fff8f2] via-background to-background`
- Account page: `from-[#fff8f2] via-background to-background`
- All three are identical copy-paste of the same hardcoded gradient.

## Code evidence

- Orders page hardcoded gradient: [src/features/orders/components/customer-orders-page.tsx:98](src/features/orders/components/customer-orders-page.tsx#L98)
- Saved page hardcoded gradient: [src/features/saved-restaurants/components/saved-restaurants-page.tsx:31](src/features/saved-restaurants/components/saved-restaurants-page.tsx#L31)
- Account page hardcoded gradient: [src/features/customer-account/components/customer-account-page.tsx:83](src/features/customer-account/components/customer-account-page.tsx#L83)
- Peach token exists in globals.css and is used correctly by hero section: [src/features/discovery/components/hero-section.tsx:26](src/features/discovery/components/hero-section.tsx#L26) (`bg-peach`)
- Restaurant card cover image has `alt=""` marking it decorative when it should have meaningful alt text: [src/features/discovery/components/restaurant-card.tsx:62](src/features/discovery/components/restaurant-card.tsx#L62)

## Recommended fix

1. Replace `from-[#fff8f2]` with `from-peach` (or a new `--page-gradient-start` token) across all three pages.
2. Ensure the token has a dark-mode variant in `globals.css`.
3. Consider extracting the common page wrapper pattern (gradient background + `pb-24` + `min-h-dvh`) into a shared component to prevent future copy-paste drift.
