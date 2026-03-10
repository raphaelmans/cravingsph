# Ad-Hoc Headers Audit — Research Notes

## Common Pattern (Saved, Orders, Account)

All three share nearly identical markup:
```
sticky top-0 z-20 border-b border-primary/10 bg-background/90 backdrop-blur
```

Back button:
```
size-10, rounded-full, border border-primary/10, bg-background, text-primary
hover:bg-primary/5, ArrowLeft size-5
```

Label:
```
text-xs font-medium uppercase tracking-[0.24em] text-primary
```

Title: `font-heading text-xl font-bold`

## Inconsistencies

| Page | max-width | Label | Title |
|------|-----------|-------|-------|
| Saved | max-w-4xl | "Retention" | "Saved restaurants" |
| Orders | max-w-3xl | "Retention" | "Order history" |
| Account | max-w-4xl | "Account" | "Profile settings" |

- max-width differs between Orders (3xl) and others (4xl)

## Search Page (outlier)

```
sticky top-0 z-30 border-b bg-background (NO backdrop-blur)
```

Back button:
```
size-9, rounded-full, NO border, NO bg, hover:bg-accent
```

- Higher z-index (z-30 vs z-20)
- No backdrop-blur
- Smaller back button with different styling
- Includes integrated search input + filter bars

## Hardcoded Gradient (Issue 007)

All three account pages use:
```
from-[#fff8f2] via-background to-background
```
Should be `from-peach` — the token exists and hero-section uses it correctly.

## Recommendation

Create a shared `SubpageHeader` component. Normalize:
- z-index to z-20 across all
- back button to consistent size-10 with border pattern
- max-width to max-w-4xl
- backdrop-blur on all
- Replace hardcoded hex with `from-peach` token
