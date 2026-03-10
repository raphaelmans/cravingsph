# No portal switching between customer and owner

Severity: medium

## Summary

Users who have both customer and owner roles cannot switch between the customer portal (`/`) and the owner portal (`/organization`) from within the UI. There is no toggle, menu item, or link that bridges the two portals. The only way to switch is to manually type the URL for the other portal.

## Why this matters

- Restaurant owners are also customers — they should be able to browse and order food, then switch back to managing their restaurant.
- The auth system supports both roles via the same session (Supabase user), but the UI treats them as completely separate apps.
- Owners who land on `/` have no indication that `/organization` exists or how to reach it.
- Customers who also own a restaurant have no way to discover the owner portal after initial onboarding.

## Expected

- Authenticated users with owner privileges see a "Switch to Owner Portal" option in their account page or navigation menu.
- Owner portal includes a "Switch to Customer View" link.
- The switch preserves the session — no logout/login required.

## Actual

- Customer portal has no link, button, or menu item pointing to `/organization`.
- Owner portal sidebar/nav does not link back to `/` as a general navigation option.
- The owner portal does have "Public Page" / "Open customer preview" buttons on restaurant and branch detail pages, but these open the customer portal in a new window as a preview action — they are not portal-switching affordances.
- `useSession()` returns the user's auth state but the UI never checks for owner role to conditionally show a portal switch.
- Route config defines both `organization` and public route groups as separate concerns with no cross-linking: [src/common/app-routes.ts:22–88](src/common/app-routes.ts#L22)

## Code evidence

- Customer account page has no portal-switch option: [src/features/customer-account/components/customer-account-page.tsx](src/features/customer-account/components/customer-account-page.tsx)
- `useSession()` returns the current user but the customer portal never uses it to offer owner-portal access: [src/features/auth/hooks/use-auth.ts:11–18](src/features/auth/hooks/use-auth.ts#L11)
- Route config separates public, protected, and organization route groups with no shared links: [src/common/app-routes.ts:110–142](src/common/app-routes.ts#L110)
- Proxy redirects are role-unaware — it checks auth status but not user role: [src/proxy.ts:57–78](src/proxy.ts#L57)
- Owner portal has "Public Page" preview buttons that open customer portal in a new window (not portal switching): [src/app/(owner)/organization/restaurants/[restaurantId]/page.tsx:102](src/app/(owner)/organization/restaurants/[restaurantId]/page.tsx#L102), [src/app/(owner)/organization/restaurants/[restaurantId]/branches/[branchId]/settings/page.tsx:401](src/app/(owner)/organization/restaurants/[restaurantId]/branches/[branchId]/settings/page.tsx#L401)

## Recommended fix

1. Add a "Switch to Owner Portal" link in the customer account page (visible only when the user has an organization).
2. Add a "Switch to Customer View" link in the owner portal sidebar.
3. Use the session/profile data to determine if the user has owner privileges and conditionally render the switch.
4. Consider a role indicator in the header or bottom nav (e.g., a small badge or icon) that shows which portal the user is currently in.
5. Long-term: evaluate whether a unified navigation with role-aware sections would be better than two separate portal shells.
