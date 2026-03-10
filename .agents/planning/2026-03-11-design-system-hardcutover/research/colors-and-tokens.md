# Colors & Design Tokens Audit

## Token Comparison: Current vs Design System Spec

| Token | Current | Spec | Status |
|-------|---------|------|--------|
| --background | oklch(1 0 0) | oklch(1 0 0) | MATCH |
| --foreground | oklch(0.145 0 0) | oklch(0.18 0.02 260) | MISMATCH — achromatic, wrong lightness |
| --primary | #f86006 | oklch(0.66 0.23 40) | MISMATCH — hex instead of OKLCH |
| --primary-foreground | oklch(0.985 0 0) | oklch(1 0 0) | MISMATCH — slightly off |
| --secondary | oklch(0.97 0 0) | oklch(0.97 0.01 260) | PARTIAL — missing chroma/hue |
| --secondary-foreground | oklch(0.205 0 0) | oklch(0.18 0.02 260) | MISMATCH |
| --muted | oklch(0.97 0 0) | oklch(0.96 0.01 260) | PARTIAL — wrong lightness, missing chroma |
| --muted-foreground | oklch(0.556 0 0) | oklch(0.45 0.02 260) | MISMATCH — too light |
| --accent | oklch(0.97 0 0) | oklch(0.66 0.23 40) | COMPLETELY WRONG — gray instead of orange |
| --accent-foreground | oklch(0.205 0 0) | oklch(1 0 0) | COMPLETELY WRONG |
| --border | oklch(0.922 0 0) | oklch(0.92 0.01 260) | PARTIAL — missing chroma/hue |
| --input | oklch(0.922 0 0) | oklch(0.92 0.01 260) | PARTIAL — missing chroma/hue |
| --ring | oklch(0.708 0 0) | oklch(0.66 0.23 40) | MISMATCH — gray instead of orange |

## Additional Tokens (not in Design System baseline, project-specific)
- --card, --card-foreground, --popover, --popover-foreground — present
- --destructive, --success, --warning — custom semantic tokens (keep)
- --peach, --peach-foreground — warm brand accent (keep)
- --sidebar-* (11 tokens) — sidebar color system (keep)
- --chart-1 through --chart-5 — charting (keep)

## Hardcoded Hex Values Found
- `globals.css`: #f86006 for primary and sidebar-primary (should be OKLCH)
- `qr-code-preview.tsx`: #f8fafc, #0f172a, #e2e8f0, #475569, rgba(15,23,42,0.12) in print popup
- `google-sign-in-button.tsx`: Google brand colors (#4285F4, #34A853, #FBBC05, #EA4335) — OK, external brand

## Tailwind Color Classes (red-500, green-600, etc.)
**NONE FOUND** — fully compliant with CLAUDE.md rule

## Compliance: ~40%
