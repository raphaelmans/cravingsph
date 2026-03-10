# Redundant ad-hoc headers across pages

Severity: medium

## Summary

Every customer subpage (orders, saved, account, search, order detail) builds its own one-off header with a back-arrow button, page title, and sometimes additional icons. These headers share no common component, have inconsistent styling, and will conflict with a persistent `CustomerHeader` or bottom navigation when added.

## Why this matters

- Duplicated layout code across 5+ pages increases maintenance cost and inconsistency risk.
- Each header has slightly different styling (padding, font size, background, border treatment), making the app feel unpolished.
- When a shared header is added to `CustomerShell`, these ad-hoc headers will create double-header UIs unless they are removed or refactored.
- The back-arrow pattern assumes a linear journey (subpage → home), which breaks when users arrive via deep links or bottom nav.

## Expected

- A single shared navigation pattern handles page identity (title, back behavior) consistently.
- Individual pages declare their title/metadata; the shell renders it.
- No duplicated header markup across feature pages.

## Actual

- Saved restaurants page builds its own sticky header with back arrow: `<header className="sticky top-0 z-20 border-b ...">` with inline `<ArrowLeft>` link.
- Orders page builds its own header with back arrow and title.
- Account page builds its own header with back arrow and title.
- Search page builds its own header with back arrow and search input.
- Order detail page builds its own header with back arrow.
- Each uses slightly different classes, z-indexes, and layout structures.

## Code evidence

- Saved page ad-hoc header: [src/features/saved-restaurants/components/saved-restaurants-page.tsx:32–50](src/features/saved-restaurants/components/saved-restaurants-page.tsx#L32)
- Orders page ad-hoc header: [src/features/orders/components/customer-orders-page.tsx:106](src/features/orders/components/customer-orders-page.tsx#L106)
- Account page ad-hoc header: [src/features/customer-account/components/customer-account-page.tsx:91](src/features/customer-account/components/customer-account-page.tsx#L91)
- Search page ad-hoc header with back arrow: [src/app/(public)/search/page.tsx:71](src/app/(public)/search/page.tsx#L71)
- Order detail page ad-hoc header: [src/app/(public)/restaurant/[slug]/order/[orderId]/page.tsx:102](src/app/(public)/restaurant/[slug]/order/[orderId]/page.tsx#L102)
- A shared `BackButton` component exists but is not used by most of these pages: [src/components/brand/back-button.tsx](src/components/brand/back-button.tsx)
- `CustomerHeader` exists as the intended shared header but is unused: [src/components/layout/customer-header.tsx](src/components/layout/customer-header.tsx)

## Recommended fix

1. Adopt `CustomerHeader` as the shared persistent header in `CustomerShell`.
2. Create a `PageHeader` or `SubpageHeader` component that provides consistent page title and optional back navigation for subpages, rendering below the main header.
3. Refactor each page to remove its inline header and use the shared component instead.
4. Use the existing `BackButton` component (or extend it) rather than re-implementing `<ArrowLeft>` links in each page.
5. For pages where back navigation is contextual (e.g., order detail → order list), use `router.back()` or breadcrumb-style navigation rather than hardcoded `href="/"`.
