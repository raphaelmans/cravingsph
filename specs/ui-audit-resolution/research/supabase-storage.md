# Supabase Storage Audit

## What EXISTS
- @supabase/ssr@0.8.0 and @supabase/supabase-js@2.89.0 installed
- next.config.ts configured for `*.supabase.co/storage/v1/object/public/**`
- Supabase client at src/shared/infra/supabase/create-client.ts (basic, no storage)
- Environment vars configured (SUPABASE_URL, keys)
- DB schema has image URL fields (menu_item.imageUrl, restaurant.logoUrl/coverUrl, etc.)
- UI file inputs exist (verification document card, payment proof form)

## What's MISSING
- No Storage client initialization
- No bucket references or definitions
- No upload API endpoints
- No file path generation utilities
- No signed URL generation
- Zero actual upload functionality — all UI is presentation only

## Buckets to Create (seed-storage-buckets.ts pattern)
1. `menu-item-images` (public) — menu item photos
2. `restaurant-assets` (public) — logos, covers
3. `verification-docs` (private) — business permits, IDs
4. `avatars` (public) — user profile photos
5. `payment-proofs` (private) — payment screenshots

## Implementation Needed
1. Storage bucket seed script (following next16bp pattern)
2. Storage client wrapper: src/shared/infra/supabase/storage-client.ts
3. Upload utility with file validation (size, type)
4. tRPC procedures for server-side upload URLs or direct upload
5. Image component with Supabase URL generation
