# Research: Discovery & Search Module

## Discovery Backend (`src/modules/discovery/`)

**Router procedures (all `publicProcedure`):**
- `discovery.featured({ limit? })` — featured + active restaurants
- `discovery.nearby({ lat?, lng?, limit? })` — Haversine distance sort (or alphabetical)
- `discovery.search({ query?, cuisine?, city?, limit? })` — ILIKE on restaurant name OR cuisineType, plus cuisine and city filters
- `discovery.locations()` — distinct cities with restaurant counts

**Key: Current search only searches restaurant name/cuisineType, NOT menu items.**

**RestaurantPreviewDTO:**
```ts
{ id, slug, name, coverImageUrl, logoUrl, cuisineTypes: string[], popularItems: string[], branchCity }
```

**Service:** `hydrate()` enriches raw rows with top-3 popular items per restaurant (via ROW_NUMBER window function).

**Repository:** Complex queries with optional WHERE clauses, ILIKE matching, Haversine distance calculation. `findPopularItems()` uses raw SQL.

## Discovery Frontend (`src/features/discovery/`)

**Components:**
- `restaurant-card.tsx` — cover image, logo overlay, name, city, cuisine tags, popular items, save button (heart)
- `restaurant-card-list.tsx` — horizontal scroll or vertical grid container
- `cuisine-filter.tsx` — horizontal pill buttons (10 cuisines with emojis)
- `cuisine-pill.tsx` — individual cuisine button/link
- `location-filter.tsx` — Select dropdown with MapPin
- `hero-section.tsx` — home banner with search form
- `scan-qr-cta.tsx` — fixed "Scan cravings QR" button
- `qr-scanner-modal.tsx` — camera-based QR scanner using `html5-qrcode`

## Search Page (`src/app/(public)/search/page.tsx`)

- Client component with `useTRPC()` hooks
- URL params: `q` (query), `cuisine`, `location`
- `updateParams()` rebuilds URLSearchParams → `router.replace()` (no page reload)
- Sticky header with search input, location dropdown, cuisine pills
- Grid of RestaurantCard components
- Empty state with SearchX icon

## Home Page (`src/app/(public)/page.tsx`)

- Server component with `api()` server caller
- Parallel fetch: featured (limit 6) + nearby (limit 8)
- Sections: HeroSection → cuisine categories → featured (horizontal) → nearby (vertical)

## Key Implications for Food Mode (Phase 7)

1. **New backend procedure or extension needed:** Current `discovery.search()` only searches restaurant name/cuisine — must add menu item name search
2. **Data shape changes:** Food mode returns restaurants grouped with matched dishes underneath
3. **New DTO needed:** Something like `FoodSearchResultDTO { restaurant, matchedDishes: { name, price, imageUrl }[] }`
4. **Repository query:** JOIN restaurant → branch → category → menu_item, ILIKE on menu_item.name
5. **UI additions:** Food | Restaurant toggle (pill buttons in sticky header), FoodSearchResult component showing dishes per restaurant
6. **Query persistence:** Typed query text should persist when switching modes (URL param `mode=food|restaurant`)
7. **Location default:** Current search doesn't auto-detect location — needs geolocation API or IP-based fallback
