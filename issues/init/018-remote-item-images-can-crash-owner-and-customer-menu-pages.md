# Remote item images can crash owner and customer menu pages

Severity: high

## Summary

Saving a menu item with a remote image URL from a hostname not allowed by `next.config.ts` can break both the owner menu management screen and the public restaurant page. The resulting runtime error pushes the user into the error boundary instead of degrading gracefully.

## Why this matters

- A single item image can take down the owner menu workspace and customer restaurant page.
- This blocks both menu management and customer ordering flows.
- Owners are encouraged to enter an image URL, but the app does not enforce host compatibility up front.

## Expected

- Unsupported image hosts should be validated before save, or the UI should fall back safely without crashing the page.

## Actual

- After creating an item with `https://example.com/chicken.jpg`, the owner menu route hit the owner error boundary.
- Opening the public restaurant page for that restaurant also hit the customer error boundary.
- The console reported `Invalid src prop ... hostname "example.com" is not configured under images in your next.config.js`.

## Browser evidence

- Verified with `playwright-cli` on:
  - owner menu route
  - public restaurant route `/restaurant/qa-test-kitchen-1773072231`

## Code evidence

- Owner add-item dialog accepts arbitrary image URLs: [src/features/menu-management/components/add-item-dialog.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/features/menu-management/components/add-item-dialog.tsx#L108)
- Remote images are restricted to Supabase storage only: [next.config.ts](/Users/raphaelm/Documents/Coding/startups/cravingsph/next.config.ts#L3)

## Repro

1. Open owner menu management.
2. Add an item with a remote image URL outside the configured remote patterns.
3. Observe the owner menu page crash.
4. Open the corresponding public restaurant page.
5. Observe the customer page crash as well.

## Recommended fix

- Validate image hosts before accepting the URL.
- Restrict owner input to supported storage URLs or upload-backed media.
- Add a defensive fallback so bad image data cannot crash the page.
