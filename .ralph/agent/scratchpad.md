# Design System Hard Cutover — Scratchpad

## Iteration 1

### Completed
- Phase 1 (Foundation): Steps 1-8 implemented
  - Token alignment (globals.css → OKLCH, accent=primary, ring=primary)
  - Font overhaul (League Spartan → Plus Jakarta Sans, heading scale utilities)
  - Button polish (hover:brightness, active:scale, cursor-pointer, secondary dual behavior)
  - Card hover elevation + restaurant card 3:2 image ratio
  - Badge chip variant + input padding fix
  - Accent hover migration (all UI components → bg-primary/5)
  - Motion system (sheet timing 250ms/200ms, prefers-reduced-motion)
  - Hardcoded cleanup (text-[10px]→text-xs, hex→oklch, touch targets)
- Phase 2 (Spacing): Steps 10-13 implemented
  - Card padding normalized (24px→16px)
  - 8px grid enforcement across src/features/ (~30 files)
  - 8px grid enforcement across src/app/ and src/components/ (~25 files)
  - Skeleton loading screens updated to match new card layouts
  - Arbitrary value removal verified

### Remaining
- Phase 3 (Admin Overhaul): Steps 15-20
  - Requires dedicated PDD planning session (Step 15)
  - Involves: dnd-kit, sort_order schema, live preview, inline editing
  - This is new feature development, not a design system alignment task
