---
tags:
  - agent-context
  - frontend/app
date: 2026-03-09
previous: null
related_contexts: []
---

# [01-00] Initialize CravingsPH Design System

> Date: 2026-03-09
> Previous: N/A (first context note)

## Summary

Replaced the stock shadcn slate theme with the CravingsPH brand identity: `#f86006` warm orange primary, Inter body font, neutral (pure gray) palette, and dark mode support via next-themes. Also added display fonts (League Spartan, Antonio), Supabase image remote patterns, and a project implementation-intent doc.

## Related Contexts

None — this is the first context note for the project.

## Changes Made

### Implementation

| File | Change |
|------|--------|
| `components.json` | `baseColor: slate → neutral`, added shadcnstudio registry |
| `src/app/globals.css` | Full theme overhaul: slate → neutral palette, `--primary: #f86006` in both modes, white `--primary-foreground`, Inter as `--font-sans`, display font vars, `--color-destructive-foreground` mapping, `no-scrollbar` utility |
| `src/lib/fonts.ts` | **New** — Inter, League Spartan, Antonio, Geist Mono font definitions |
| `src/app/layout.tsx` | Swapped Geist → Inter + display fonts, `suppressHydrationWarning`, metadata → "CravingsPH" |
| `src/components/providers.tsx` | Wrapped provider tree with `ThemeProvider` from next-themes |
| `next.config.ts` | Added `images.remotePatterns` for `*.supabase.co` storage |
| `src/components/ui/resizable.tsx` | Fixed pre-existing type error — `react-resizable-panels` v4 API change (`Group`/`Panel`/`Separator`) |

### Documentation

| File | Change |
|------|--------|
| `docs/implementation-intent.md` | **New** — project intent doc: stack, architecture, conventions, what carries over from legacy |

## Key Decisions

- **Neutral over slate**: Slate has a blue-gray tint (oklch hue ~264°) that clashes with warm orange. Neutral uses hue 0 (pure gray) for clean pairing.
- **White foreground on orange in both modes**: Figma shows white text on orange buttons everywhere. Legacy dark mode had dark text on orange — we follow Figma as source of truth.
- **`#f86006` as raw hex**: Used directly instead of oklch conversion to ensure exact brand color match. CSS variables still work seamlessly.
- **`disableTransitionOnChange` on ThemeProvider**: Prevents visible color transition flash when toggling dark/light mode.

## Next Steps

- [ ] Verify visually: buttons, checkboxes, links should be orange (`#f86006`)
- [ ] Test dark mode toggle (system preference detection)
- [ ] Auth pages (login, register) should render with orange accents
- [ ] Set up env vars (`.env.local`) to enable full build with Supabase

## Commands to Continue

```bash
# Verify build (needs .env.local with Supabase vars)
pnpm build

# Type check only (no env vars needed)
npx tsc --noEmit

# Dev server
pnpm dev
```
