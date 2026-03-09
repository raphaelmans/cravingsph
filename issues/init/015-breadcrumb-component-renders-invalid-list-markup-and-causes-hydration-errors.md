# Breadcrumb component renders invalid list markup and causes hydration errors

Severity: medium

## Summary

The shared breadcrumb component renders `<li>` elements inside other `<li>` elements via `BreadcrumbSeparator`, which causes invalid HTML and repeated hydration errors across owner pages.

## Why this matters

- Produces noisy client-side errors on multiple routes.
- Forces React to regenerate trees on the client.
- Makes real runtime issues harder to spot in the console.

## Expected

- Breadcrumb markup should be valid list structure and hydrate cleanly.

## Actual

- Owner branches, menu, orders, settings, and verification pages all logged nested-`li` hydration errors.
- The console explicitly reports `<li>` cannot contain nested `<li>`.

## Browser evidence

- Verified with `playwright-cli` console logs on:
  - branch list
  - branch menu
  - branch orders
  - branch settings
  - verification

## Code evidence

- `BreadcrumbItem` renders `<li>`: [src/components/ui/breadcrumb.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/components/ui/breadcrumb.tsx#L24)
- `BreadcrumbSeparator` also renders `<li>` and is placed inside `BreadcrumbItem`: [src/components/ui/breadcrumb.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/components/ui/breadcrumb.tsx#L65)
- `DashboardNavbar` inserts `BreadcrumbSeparator` inside each `BreadcrumbItem`: [src/components/layout/dashboard-navbar.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/components/layout/dashboard-navbar.tsx#L40)

## Recommended fix

- Render separators as non-list elements, or make them sibling list items instead of descendants of `BreadcrumbItem`.
- Recheck hydration on owner/admin pages after the markup is corrected.
