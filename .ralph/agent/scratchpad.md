# UI Audit Resolution — Scratchpad

## Understanding

CravingsPH scaffold was built with seed data and local stores. This resolution replaces all stubs with real Supabase-backed persistence across 18 steps. The foundation is 8 new DB tables + 2 column additions, then 6 new tRPC routers, 8 hook rewrites, and component fixes.

## Plan

Following `specs/ui-audit-resolution/plan.md` — 18 sequential steps:
1. Database migration (foundation — everything depends on this)
2. Storage infrastructure
3. Portal separation
4. Discovery backend
5. Saved restaurants
6. Order system
7. Reviews
8. Payment config
9. Verification
10. Operating hours
11. Admin user access
12. Onboarding wizard
13. Owner nav
14. Component fixes
15. QR scanner
16. Discovery UI polish
17. Seed data
18. E2E tests

## Iteration 1 — DONE

Step 1 complete. Created 8 new Drizzle schemas (saved_restaurant, order, order_item, order_status_history, review, payment_method, verification_document, operating_hours), added portal_preference to profile and lat/lng to branch. All pushed to Supabase via db:push. Typecheck and lint pass. Committed as 044eb22.

Next iteration should pick from the now-unblocked tasks (Steps 2-11, 17 were blocked by Step 1).

## Iteration 2 — DONE

Step 2 complete. Storage infrastructure set up:
- `scripts/seed-storage-buckets.ts` — idempotent seed for 5 buckets (3 public, 2 private) via raw SQL to `storage.buckets`
- `src/shared/infra/supabase/storage.ts` — low-level wrapper (uploadFile, deleteFile, getPublicUrl, getSignedUrl) using admin Supabase client
- `src/modules/storage/storage.service.ts` — validates file size/type per bucket, generates UUID paths, returns upload result with URL
- `src/modules/storage/storage.factory.ts` — singleton factory
- `db:seed:buckets` script added to package.json

Key learning: `storage.buckets.allowed_mime_types` is `text[]` not `jsonb`. Committed as 1b99162.

Next iteration: Steps 3-11 and 17 are all unblocked. Portal separation (Step 3) is a good next pick as it's foundational for auth flows.

## Iteration 3 — DONE

Step 3 complete. Portal separation enforced across 12 files:
- Session interface: added `PortalPreference` type and `portalPreference` field
- Session loading: tRPC context, SSR session, and server caller all query profile table for `portal_preference`
- Register DTO: accepts optional `portalPreference` field
- Register use case + ProfileService: pass `portalPreference` to profile creation
- Customer register form: sends `portalPreference: 'customer'`
- Owner register form: sends `portalPreference: 'owner'`
- Owner layout: rejects `portalPreference === 'customer'` with redirect to `/`
- Organization router: `create` mutation rejects customers with FORBIDDEN error
- Post-login page: routes by portal_preference (customer→/, owner→/organization, null→legacy org check)
- Backward compat: null portal_preference + existing org = treated as owner

Committed as 129cf11. Typecheck and lint pass.

Next iteration: Steps 4-11 and 17 are all unblocked. Discovery backend (Step 4) is a good next pick.

## Iteration 4 — DONE

Step 4 complete. Discovery backend — full module + frontend wiring:

Backend (new module `src/modules/discovery/`):
- `discovery.router.ts` — 4 public procedures: featured, nearby, search, locations
- `discovery.repository.ts` — Drizzle queries: selectDistinctOn restaurant+branch join, Haversine distance sort for nearby, ILIKE for search, DISTINCT city for locations, window-function subquery for top 3 popular menu items per restaurant
- `discovery.service.ts` — hydrates DiscoveryRow → RestaurantPreviewDTO, splits cuisineType CSV into array, enriches with popular items from findPopularItems()
- `discovery.factory.ts` — singleton DI pattern
- `discovery.dto.ts` — Zod input schemas (FeaturedInput, NearbyInput, SearchInput), output DTOs (RestaurantPreviewDTO, LocationDTO)
- Registered in `src/shared/infra/trpc/root.ts`

Frontend:
- `src/app/(public)/page.tsx` — now async SSR, fetches featured+nearby via server caller `api()`
- `src/app/(public)/search/page.tsx` — replaced stub ALL_RESTAURANTS with `useTRPC().discovery.search.queryOptions()`, added loading spinner, uses dynamic locations from `discovery.locations`
- `src/features/discovery/components/location-filter.tsx` — now accepts `locations` prop (LocationDTO[]), removed hardcoded LOCATION_OPTIONS

Key patterns:
- `selectDistinctOn([restaurant.id])` for deduplication when joining 1:N branch
- Haversine SQL expression with LEAST/GREATEST clamping for acos safety
- Window function (ROW_NUMBER PARTITION BY) for top-N popular items
- restaurant.cuisineType is single CSV string, split into array for frontend

Typecheck and lint pass.

Next iteration: Steps 5-11, 16, 17 are all unblocked.
