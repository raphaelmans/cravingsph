# No nav landmarks or skip links for screen readers

Severity: high

## Summary

The customer portal has zero `<nav>` landmark elements and no skip-to-content link. Screen reader users cannot navigate by landmark, cannot skip repeated content, and have no structural orientation. The only `<nav>` elements in the codebase exist in the onboarding wizard, breadcrumb, and pagination components — none of which render in customer flows.

## Why this matters

- Violates WCAG 1.3.1 (Info and Relationships, Level A) — page structure must be programmatically determinable.
- Violates WCAG 2.4.1 (Bypass Blocks, Level A) — a mechanism must exist to skip repeated content.
- Screen reader users depend on landmarks (`<nav>`, `<main>`, `<header>`, `<footer>`) to orient themselves on the page. Without them, every page visit requires listening to the entire page sequentially.
- When persistent navigation is added (issue 001), it must include proper `<nav>` landmarks from the start — retrofitting accessibility is harder than building it in.

## Expected

- `<nav aria-label="Main navigation">` wrapping the bottom nav (once added).
- `<header>` landmark wrapping the persistent header.
- `<main>` landmark wrapping page content (this already exists in `CustomerShell`).
- A skip-to-content link as the first focusable element on the page.

## Actual

- `CustomerShell` renders a bare `<div>` containing `<main>` — no `<header>` or `<nav>` landmarks.
- Homepage renders its own `<main>` tag inside the shell's `<main>`, creating nested `<main>` landmarks (invalid HTML).
- No `<nav>` element exists anywhere in the customer portal.
- No skip-to-content link exists.

## Code evidence

- CustomerShell has `<main>` but no other landmarks: [src/components/layout/customer-shell.tsx:13](src/components/layout/customer-shell.tsx#L13)
- Homepage nests a second `<main>` inside the shell's `<main>`: [src/app/(public)/page.tsx:19](src/app/(public)/page.tsx#L19)
- Orders, saved, and account pages also nest `<main>` inside the shell: [src/features/orders/components/customer-orders-page.tsx:98](src/features/orders/components/customer-orders-page.tsx#L98), [src/features/saved-restaurants/components/saved-restaurants-page.tsx:31](src/features/saved-restaurants/components/saved-restaurants-page.tsx#L31), [src/features/customer-account/components/customer-account-page.tsx:83](src/features/customer-account/components/customer-account-page.tsx#L83)
- No `<nav>` elements in customer routes (only in onboarding wizard and shared UI primitives)

## Recommended fix

1. When adding persistent navigation (issue 001), wrap it in `<nav aria-label="Main navigation">`.
2. Add a visually-hidden skip-to-content link as the first child of `<body>` or `CustomerShell`: `<a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>`.
3. Fix nested `<main>` issue: remove `<main>` from individual page components since `CustomerShell` already provides it.
4. Wrap `CustomerHeader` in `<header>` (it currently uses `<header>` — good, but it must actually render).
