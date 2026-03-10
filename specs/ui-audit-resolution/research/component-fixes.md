# Component-Level Fixes

## Breadcrumb Hydration Error (Issue 015)
**File:** src/components/ui/breadcrumb.tsx + src/components/layout/dashboard-navbar.tsx
**Problem:** BreadcrumbSeparator renders `<li>` inside BreadcrumbItem's `<li>` — invalid nested list markup
**Fix:** Change BreadcrumbSeparator to render `<span>` instead of `<li>`, or make separators siblings rather than children of BreadcrumbItem in dashboard-navbar.tsx

## Add Item Dialog (Issue 017)
**File:** src/features/menu-management/components/add-item-dialog.tsx
**Problems:**
1. categoryId defaults to "" (not valid UUID), not preselected even when one category exists
2. imageUrl defaults to "" which fails z.string().url().optional() — empty string isn't undefined
**Schema:** src/modules/menu/dtos/menu.dto.ts line 30: `imageUrl: z.string().url().optional()`
**Fixes:**
1. Pass defaultCategoryId from parent, or auto-detect sole category
2. Transform empty imageUrl to undefined before validation (or use `.or(z.literal(""))` in schema)

## Remote Image Crash (Issue 018)
**Problem:** Arbitrary image URLs crash Next.js Image component if hostname not in next.config.ts
**Fix:** Replace URL input with Supabase Storage upload. All images from allowed host.

## Scan QR Placeholder (Issue 003)
**File:** src/features/discovery/components/scan-qr-cta.tsx
**Current:** toast.info("QR scanner coming soon!")
**Fix:** Implement browser camera scanner using html5-qrcode library

## Discovery Save-for-Later (Issue 004)
**File:** src/features/discovery/components/restaurant-card.tsx
**Current:** Card only has link, image, tags, preview text — no save affordance
**Fix:** Add save/unsave button to card, prompt login for guests

## Seed Runner Extension
**Pattern:** Create multiple fixture files in scripts/seed-data/, loop over them in main()
**Needed:** 3-4 Cebu City restaurant fixtures with realistic data
