# Spacing Audit

## 8px Grid Compliance: ~65%

### Grid-Aligned Values (65%)
- gap-1 (4px): 16 uses
- gap-2 (8px): 129 uses
- gap-4 (16px): 57 uses
- gap-6 (24px): 25 uses
- p-4 (16px): 83 uses
- p-6 (24px): 44 uses
- space-y-1 (4px): 52 uses
- space-y-2 (8px): 48 uses
- space-y-4 (16px): 63 uses
- space-y-6 (24px): 30 uses

### Non-Standard Values (30%)
- gap-3 (12px): 122 uses
- gap-1.5 (6px): 10 uses
- p-5 (20px): 35 uses
- p-3 (12px): 27 uses
- px-3 (12px): 19 uses
- py-3 (12px): 15 uses
- space-y-3 (12px): 28 uses

### Arbitrary Values (5%)
- `[3px]` — 6 occurrences
- `[10px]` — 13 occurrences
- `[2px]` — 6 occurrences
- `w-[260px]`, `w-[220px]`, `w-[180px]`, `w-[140px]` — hardcoded card widths

## Card Padding
- Current: `px-6 py-6` (24px) via shadcn Card defaults
- Spec: 16-20px padding
- **Exceeds spec**

## Page Margins
- Mobile: `px-4` (16px) — matches spec
- Desktop: `p-4 md:p-6` or `p-6 md:p-8` — matches spec range
- Some pages use `px-6` mobile — slightly over spec

## Max-Width
- Largest: `max-w-7xl` (1280px) — close to spec's 1200px
- Common: max-w-3xl (768px), max-w-md (448px), max-w-4xl (896px)
