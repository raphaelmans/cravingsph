# Design Tokens & Component System — Research Notes

## Button Sizes

| Size | Dimensions | Touch-safe? |
|------|-----------|-------------|
| default | h-9 (36px) | No (< 44px) |
| sm | h-8 (32px) | No |
| lg | h-10 (40px) | No |
| icon | size-9 (36px) | No |
| icon-sm | size-8 (32px) | No |
| icon-lg | size-10 (40px) | No |

None of the button sizes meet 44px minimum. For touch compliance, need either:
- New `icon-xl` at size-11 (44px)
- Or extend hit areas via padding/pseudo-elements

User decided: default to shadcn/ui sizing. The existing sizes are acceptable; just use appropriate variant per context.

## Color Tokens (OKLCH)

- `--peach: oklch(0.95 0.03 65)` — light warm beige
- `--peach-foreground: oklch(0.35 0.05 50)` — dark warm brown
- `--primary: #f86006` — brand orange
- Dark mode variants exist but app is forced light

## Z-Index Scale

| Z | Usage |
|---|-------|
| z-50 | Modals, dialogs, sheets, tooltips |
| z-40 | Fixed CTAs (QR button, cart float), CustomerHeader |
| z-30 | Search page header |
| z-20 | Account-style page headers |
| z-10 | Category tabs, form focus states |

Bottom nav should be z-40 (same level as header).

## Tailwind Config

Using Tailwind v4 with inline `@theme` in globals.css — no tailwind.config.ts. Custom fonts: Inter (sans), League Spartan (display), Antonio (display-alt), Geist Mono.

## ScanQRCTA

- Fixed bottom-0, z-40, safe-area-inset-bottom
- Pill button, size=lg, shadow-lg
- Will be replaced by center FAB in bottom nav

## Quantity Picker

- Uses `icon-sm` (size-8 = 32px)
- Per user decision: keep shadcn sizes, don't override
