# Motion & Interactions Audit

## Animation Library
- **tw-animate-css** (v1.4.0) — Tailwind-compatible CSS animations
- **No Framer Motion** — all CSS/Tailwind-based
- Radix UI primitives with built-in animation support

## Duration Compliance (Spec: 150-250ms)

| Usage | Current | Spec Range | Status |
|-------|---------|-----------|--------|
| Most transitions | 200ms | 150-250ms | MATCH |
| Sheet open | 500ms | 150-250ms | EXCEEDS |
| Sheet close | 300ms | 150-250ms | EXCEEDS |
| Item component | 100ms | 150-250ms | BELOW |
| OTP caret blink | 1000ms | N/A | OK (blink) |

## Easing Curves (Spec: ease-out for most)

| Usage | Current | Spec | Status |
|-------|---------|------|--------|
| Sheet animations | ease-in-out | ease-out | MISMATCH |
| Sidebar | ease-linear | ease-out | MISMATCH |
| Most hovers | default (ease) | ease-out | NOT EXPLICIT |

## Hover/Active States

### Buttons (Spec: scale 1.02-1.04 hover, scale 0.98 active)
- Current: `hover:bg-primary/90` — color change only
- **Missing:** scale feedback on hover
- **Missing:** press/active animation

### Cards (Spec: shadow elevation on hover, click scale)
- Current: static `shadow-sm`, no hover change
- **Missing:** hover shadow-md elevation
- **Missing:** click scale feedback
- Exception: payment proof card has `group-hover:opacity-80`

## Loading States
- Skeleton loaders: `bg-accent animate-pulse rounded-md` — good
- Spinners: `Loader2Icon animate-spin` — good
- Dedicated loading components: PublicPageLoading, DashboardPageLoading, AuthPageLoading

## Page Transitions
- **NONE implemented** — relies on Next.js default behavior
- Spec calls for "soft fade or slight upward motion (8-12px)"

## Existing Animations
- Dialog: zoom-in-95 / fade-in — good
- Sheet: slide-in-from-* — good but too slow
- Accordion: expand/collapse — good
- Skeleton pulse — good
