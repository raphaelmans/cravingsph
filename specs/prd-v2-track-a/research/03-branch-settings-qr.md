# Research: Branch Settings & QR Code

## Branch Schema (`src/shared/infra/db/schema/branch.ts`)

| Column | Type | Notable |
|--------|------|---------|
| `id` | uuid PK | defaultRandom() |
| `restaurantId` | uuid FK → restaurant | cascade delete |
| `name`, `slug` | varchar(200) | slug is URL-friendly |
| `address` | text | nullable |
| `province`, `city` | varchar(100) | nullable, used in discovery |
| `phone` | varchar(20) | nullable |
| `coverUrl` | text | nullable |
| `isOrderingEnabled` | boolean | default true |
| `autoAcceptOrders` | boolean | default false |
| `paymentCountdownMinutes` | integer | default 15 |
| `latitude`, `longitude` | numeric(10,7) | nullable |
| `isActive` | boolean | default true (soft-delete flag) |

**Indexes:** `(restaurantId)`, `(slug)`, `(province, city)`

## Org → Restaurant → Branch Hierarchy

- `organization` has `ownerId` (FK → auth.users) — one org per owner
- `restaurant` has `organizationId` (FK) — multiple restaurants per org
- `branch` has `restaurantId` (FK) — multiple branches per restaurant
- Authorization chain: User → Organization → Restaurant → Branch

## Branch Module (`src/modules/branch/`)

**Router procedures:**
- Public: `getBySlug`, `listPublicByRestaurant`
- Protected: `listByRestaurant`, `create`, `update`, `getOperatingHours`, `updateOperatingHours`

**Service:** `assertRestaurantOwnership()` validates user → org → restaurant chain before mutations. Slug auto-generated on create.

## QR Code Generation (Current)

- **Library:** `qrcode` (npm) — `toDataURL()` to generate data-URL PNG
- **Scope:** Branch-level only (single QR per branch)
- **URL encoded:** `/restaurant/{restaurantSlug}` (from current origin)
- **Component:** `QRCodePreview` in `src/features/branch-settings/components/qr-code-preview.tsx`
- **Actions:** Download PNG, print (popup), preview customer page
- **Colors:** OKLCH dark/light tokens (320x320px, margin 1)

## QR Scanning (Customer Side)

- **Library:** `html5-qrcode` — camera-based scanning in `QrScannerModal`
- **Location:** `src/features/discovery/components/qr-scanner-modal.tsx`
- **Parses:** `cravings://slug`, `/restaurant/{slug}`, or plain slug
- **Navigates to:** `/restaurant/{slug}`

## Branch Settings UI (`src/features/branch-settings/`)

- `QRCodePreview` — QR display with download/print
- `WeeklyHoursEditor` — 7-day schedule with time dropdowns
- `useBranchSettings` hook — fetches org/restaurant/branch data, manages draft state, saves settings

**Settings page** (`src/app/(owner)/organization/restaurants/[restaurantId]/branches/[branchId]/settings/page.tsx`):
- 3 stat cards (ordering status, acceptance mode, payment countdown)
- WeeklyHoursEditor + Order Settings (toggles)
- QRCodePreview
- Preview button (customer view)

## Operating Hours (`src/shared/infra/db/schema/operating-hours.ts`)

- `branchId`, `dayOfWeek` (0–6), `opensAt` (time), `closesAt` (time), `isClosed` (boolean)
- Unique index on `(branchId, dayOfWeek)`

## Key Implications for v1

1. **QR URL must change:** From `/restaurant/{slug}` to `/t/{publicId}` (per-table)
2. **QR component reusable:** Same `QRCodePreview` pattern, just different URL
3. **QR scanner must be updated:** Parse `/t/{publicId}` format in addition to existing patterns
4. **Table management UI:** New page under branch settings (or alongside it)
5. **No table entity exists yet:** Must create `table` schema with `branchId` FK and `publicId`
6. **Branch-level ordering toggle stays:** Complements table sessions (branch off = all tables blocked)
