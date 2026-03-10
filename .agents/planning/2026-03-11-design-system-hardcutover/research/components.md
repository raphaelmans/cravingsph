# Components Audit

## Button Component (`src/components/ui/button.tsx`)

| Aspect | Current | Spec | Status |
|--------|---------|------|--------|
| Primary bg | bg-primary text-primary-foreground | bg primary, white text | MATCH |
| Primary padding | h-9 px-4 py-2 (~12px 16px) | 12px 16px | MATCH |
| Primary radius | rounded-md | radius-md | MATCH |
| Primary hover | hover:bg-primary/90 (opacity) | brightness increase | MISMATCH |
| Active state | none | scale 0.98 | MISSING |
| Secondary bg | bg-secondary (solid) | transparent + primary border | MISMATCH |

## Restaurant Card (`src/features/discovery/components/restaurant-card.tsx`)

| Aspect | Current | Spec | Status |
|--------|---------|------|--------|
| Image ratio | h-32 w-full (~2.3:1) | 4:3 (1.33:1) | MISMATCH |
| Padding | p-3 (12px) | 16px | MISMATCH |
| Shadow | shadow-sm | shadow-sm | MATCH |
| Hover shadow | none | shadow-md elevation | MISSING |
| Click feedback | none | subtle scale | MISSING |
| Radius | default | radius-lg | NEEDS CHECK |

## Menu Item Card (`src/features/menu/components/menu-item-card.tsx`)

| Aspect | Current | Spec | Status |
|--------|---------|------|--------|
| Image ratio | size-20 (1:1) | 1:1 | MATCH |
| Description | line-clamp-2 | 2 lines | MATCH |
| Price emphasis | text-primary font-semibold | visually emphasized | MATCH |
| Spacing | gap-3 (12px) | 12-16px | MATCH |
| Compliance | 85% | | |

## Input Fields (`src/components/ui/input.tsx`)

| Aspect | Current | Spec | Status |
|--------|---------|------|--------|
| Border | border-input | color-border | MATCH |
| Padding | px-3 py-1 (8px vert) | 12px all | MISMATCH |
| Radius | rounded-md | radius-md | MATCH |
| Focus | border-ring + ring-ring/50 | border primary + shadow | MATCH |

## Badge/Tags (`src/components/ui/badge.tsx`)

| Aspect | Current | Spec | Status |
|--------|---------|------|--------|
| Radius | rounded-full | radius-xl | MISMATCH (rounder than spec) |
| Padding | px-2 py-0.5 (varies) | 6px 10px | INCONSISTENT |
| Background | bg-primary (varies) | muted | MISMATCH for chips |
