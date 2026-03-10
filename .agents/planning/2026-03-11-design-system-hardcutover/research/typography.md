# Typography Audit

## Current Setup
- **Imported fonts:** Inter, League Spartan, Antonio, Geist Mono (`src/lib/fonts.ts`)
- **CSS variables:** `--font-sans` (Inter), `--font-display` (League Spartan), `--font-display-alt` (Antonio), `--font-mono` (Geist Mono)

## Critical Issues

### 1. Plus Jakarta Sans NOT imported
- Design System specifies Plus Jakarta Sans for all headlines (H1-H3)
- Codebase uses League Spartan for headings instead
- Plus Jakarta Sans is not in `fonts.ts` at all

### 2. `font-heading` class undefined (22 uses)
- Used across 15+ files for headings
- No corresponding CSS rule or Tailwind config
- Produces no font-family — text falls back to inherited font
- Files affected: subpage-header, customer-account-page (6x), hero-section, restaurant-header, customer-orders-page (4x), order-history-card, restaurant-reviews, review-sheet, saved-restaurant-card, saved-restaurants-page (4x), order detail page, restaurant loading

### 3. No semantic heading scale
- Design System: H1=32px SemiBold, H2=24px SemiBold, H3=20px Medium
- Actual: ad-hoc mix of text-xl, text-2xl, text-3xl with varying weights
- No CSS utility classes mapping to the spec scale

### 4. Arbitrary font sizes
- `text-[10px]` used in 10+ files (bottom nav labels, small badges)
- Should use `text-xs` (12px) per the Design System caption size

### 5. No line-height scale
- Design System: body text 1.5-1.6
- Actual: ad-hoc mix of leading-snug, leading-relaxed, leading-none, leading-tight
- No consistent application

## Font Size Usage (counts)
- `text-sm` (14px): 119 uses
- `text-2xl` (24px): 52 uses
- `text-lg` (18px): 26 uses
- `text-xs` (12px): 18 uses
- `text-3xl` (30px): 9 uses
- `text-xl` (20px): 6 uses
- `text-base` (16px): 6 uses
