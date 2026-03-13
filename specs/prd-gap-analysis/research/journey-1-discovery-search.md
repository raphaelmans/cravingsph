# Journey 1 — Discovery & Search: Audit Findings

## Summary

**5/8 requirements fully implemented, 1 partial, 3 missing.**

Strong foundations for mode toggle, query persistence, food results shape, and matching logic. Critical gaps in multi-select cuisine, barangay filtering UI, and geolocation fallback.

---

## Detailed Findings

### 1. Mode selection (Food | Restaurant toggle, default Restaurant)
**Status:** ✅ Implemented
- `src/app/(public)/search/page.tsx` — two-button toggle, defaults to "restaurant" when mode param absent

### 2. Query persistence across modes
**Status:** ✅ Implemented
- `updateParams()` preserves all URLSearchParams except those explicitly changed
- `handleModeChange()` only changes `mode`, leaving `q` intact

### 3. Restaurant mode inputs

| Sub-requirement | Status | Notes |
|---|---|---|
| 3a. Restaurant name (optional) | ✅ | Optional `q` param, no validation blocks empty |
| 3b. Cuisine (multi-select) | ❌ | **Single-select only** — clicking new cuisine overwrites previous. URL uses single string param, not array. Backend DTO: `cuisine: z.string()` |
| 3c. Barangay (multi-select) | ❌ | **No UI exposed** — backend support exists (`SearchInputSchema.barangay`) but frontend never renders a barangay selector. Location filter only shows cities |

### 4. Restaurant mode location fallback (no barangay → current location)
**Status:** ❌ Missing
- No `navigator.geolocation` calls anywhere
- No location store for persisting current location
- Search passes `city: location || undefined` with no fallback

### 5. Food mode required input (food name required, empty blocked)
**Status:** ✅ Implemented
- Backend: `query: z.string().min(1).max(200)` enforces non-empty
- Frontend: empty state shown if `!query`, query hook disabled when empty

### 6. Food mode location behavior

| Sub-requirement | Status | Notes |
|---|---|---|
| 6a. Barangay filter in food mode | ❌ | Location filter only rendered in restaurant mode (`{mode === "restaurant" && <LocationFilter />}`). Food search call never passes barangay param |
| 6b. Blank → current location | ❌ | Same geolocation gap as #4 |

### 7. Food mode results shape (restaurant-first with matched dishes)
**Status:** ✅ Implemented
- `src/features/discovery/components/food-search-results.tsx` — restaurant cards with matched items (name, price, image) displayed underneath
- `FoodSearchResultDTO` includes `matchedItems` array per restaurant

### 8. MVP matching (case-insensitive, partial matching)
**Status:** ✅ Implemented
- Uses Drizzle `ilike()` (PostgreSQL ILIKE) with `%query%` pattern

---

## Key Gaps to Close

### High Priority
1. **Cuisine multi-select** — Redesign `cuisine-filter.tsx` to allow multiple selections. Update URL to use comma-separated values or array. Update backend DTO from `z.string()` to support multiple values. Update repository query logic.

2. **Barangay filter UI** — Create barangay selector component. Backend already has `barangay` param in DTO and repository logic. Need to surface it in both restaurant and food mode.

3. **Geolocation fallback** — Implement `navigator.geolocation` integration for auto-detecting user location when no barangay/city selected. Needed in both search modes.

### Medium Priority
4. **Food mode location filter** — Show location filter in food mode too (currently only in restaurant mode).

### Key Files
- `src/app/(public)/search/page.tsx` — main search orchestration
- `src/features/discovery/components/cuisine-filter.tsx` — needs multi-select redesign
- `src/features/discovery/components/location-filter.tsx` — needs barangay support
- `src/modules/discovery/dtos/discovery.dto.ts` — DTO updates for multi-select
- `src/modules/discovery/repositories/discovery.repository.ts` — multi-cuisine query logic
