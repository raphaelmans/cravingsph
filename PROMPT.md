# CravingsPH UI Audit Resolution — Production Readiness

## Objective

Resolve all 18 issues from the initial UI audit (`issues/init/`) to make CravingsPH production-ready. Replace all stub data and local stores with real Supabase-backed persistence, enforce portal separation, add file upload infrastructure, implement QR scanning, and fix component-level bugs.

## Key Requirements

1. Follow the design and plan in `specs/ui-audit-resolution/`.
2. Apply schema changes with `pnpm db:push` (Drizzle push) — do NOT use `drizzle-kit generate`/`migrate`.
3. Create 8 new Drizzle schema files: saved_restaurant, order, order_item, order_status_history, review, payment_method, verification_document, operating_hours.
4. Add `portal_preference` column to profile table and `latitude`/`longitude` to branch table.
5. Create 6 new tRPC routers (discovery, savedRestaurant, order, review, paymentConfig, verification) and extend 3 existing routers (branch, admin, menu).
6. Rewrite 8 frontend hooks to use tRPC instead of local stores/seed data.
7. Replace stub arrays on landing page and search page with live discovery queries.
8. Enforce portal separation: `profile.portal_preference` checked in owner layout, org mutations, and post-login routing.
9. Set up Supabase Storage: seed 5 buckets, create upload utilities, replace image URL input with file upload.
10. Implement browser camera QR scanner using `html5-qrcode`.
11. Fix breadcrumb hydration errors, add-item dialog defaults/validation, onboarding wizard completion state.
12. Create 4 Cebu City restaurant seed fixtures with lat/lng coordinates.
13. Verify all 18 fixes with Playwright E2E tests.

## Acceptance Criteria

```gherkin
# AC-001: Discovery shows live data
Given a published restaurant exists in the database
When a customer visits /
Then the restaurant appears in the featured or nearby section
And clicking the card navigates to a working /restaurant/{slug} page

# AC-002: Search filters by location
Given restaurants exist in "Cebu City" and "Mandaue"
When a customer selects "Cebu City" from the location filter on /search
Then only restaurants with branches in Cebu City are shown

# AC-003: QR scanner works
Given a valid QR code encoding a restaurant slug
When a customer taps "Scan cravings QR" and scans the code
Then the scanner decodes the slug and navigates to /restaurant/{slug}

# AC-004: Save-for-later on discovery
Given an authenticated customer on /
When they tap the save button on a restaurant card
Then the restaurant is saved to their account and persists across sessions

# AC-005: Saved restaurants are account-scoped
Given a new customer account with no saved restaurants
When they visit /saved
Then the page shows the empty state

# AC-006: Order history is account-scoped
Given a new customer account with no orders
When they visit /orders
Then the page shows the empty state with zero orders and zero spend

# AC-007: Reorder validates target
Given a customer with a completed order for a valid restaurant
When they tap "Reorder"
Then items are added to cart and they navigate to the working restaurant page

# AC-008: Portal separation enforced
Given a customer account (portal_preference = 'customer')
When they navigate to /organization/get-started
Then they are redirected to /

# AC-009: Owner nav has no dead links
Given an owner in the dashboard
When they click any sidebar link
Then the route exists and renders correctly

# AC-010: Onboarding completion is honest
Given an owner who completed steps 1-3 but skipped 4-6
When they view the wizard completion step
Then it does NOT show "You're All Set!"

# AC-011: Branch orders are branch-scoped
Given a new branch with no orders
When the owner views that branch's orders page
Then the page shows the empty state

# AC-012: Payment methods are org-scoped
Given a new organization with no configured payment methods
When the owner visits /organization/payments
Then the page shows the empty state

# AC-013: Verification starts in draft
Given a newly created restaurant
When the owner visits /organization/verify
Then the restaurant shows "Draft" status with 0 of 3 documents

# AC-014: Operating hours persist
Given an owner sets Monday hours to 9:00-21:00 for a branch
When they refresh the page
Then Monday hours still show 9:00-21:00

# AC-015: Breadcrumb hydration clean
Given any owner page with breadcrumbs
When the page loads
Then zero hydration errors appear in the console

# AC-016: Admin user toggle persists
Given an admin deactivates a user
When they refresh the admin user list
Then the user still shows as deactivated

# AC-017: Add item dialog works on first try
Given a branch with one category
When the owner opens the Add Item dialog
Then the category is pre-selected and leaving Image empty causes no validation error

# AC-018: No image URL crashes
Given menu items use Supabase Storage uploads only
When a customer views the restaurant page
Then all images load correctly with no hostname errors
```

## References

- `specs/ui-audit-resolution/design.md` — architecture, data models, error handling
- `specs/ui-audit-resolution/plan.md` — 18-step implementation plan
- `specs/ui-audit-resolution/research/` — 6 research documents covering schema, routers, hooks, storage, auth, and components
- `issues/init/` — original 18 issue files with repro steps and code evidence
- `docs/prd.md` — product requirements
- `specs/frontend-ui-scaffold/` — original scaffold design

## Notes

- Always run `pnpm db:push` after any schema file changes.
- Follow existing module conventions: factory DI, cascading auth checks, transaction wrapping.
- Storage bucket seed script follows the pattern in the next16bp boilerplate (`scripts/seed-storage-buckets.ts`).
- Seed data focuses on Cebu City for realistic geolocation testing.
- Use playwright-cli for E2E verification after each major step.
- Apply frontend-design, copywriting, product-designer, and ui-ux-pro-max skills for empty states, error copy, and UI polish.
