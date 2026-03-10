# Summary — Design System Hard Cutover

## Artifacts

| File | Purpose |
|------|---------|
| `rough-idea.md` | Full scope definition: app-wide overhaul to align with Design System doc |
| `idea-honing.md` | 4 Q&A decisions: phasing, typography, accent token, quality gates |
| `research/typography.md` | Font audit: Plus Jakarta Sans missing, font-heading undefined, no heading scale |
| `research/colors-and-tokens.md` | Token audit: accent/ring wrong, primary in hex, 40% compliance |
| `research/spacing.md` | Spacing audit: 65% grid-aligned, 200+ non-grid values |
| `research/components.md` | Component audit: restaurant card ratio off, no hover states, badge inconsistent |
| `research/motion-and-interactions.md` | Motion audit: no scale feedback, sheets too slow, no page transitions |
| `research/admin-dashboard.md` | Admin audit: no DnD, no preview, no inline editing, 45% compliance |
| `research/page-compliance.md` | Per-page notes across all customer-facing screens |
| `design/detailed-design.md` | Full design with critique + UI/UX Pro Max recommendations incorporated |
| `implementation/plan.md` | 20-step plan across 3 phases with visual QA gates |

## Overview

CravingsPH's codebase had significant deviations from the Design System document:
- **Typography (30%):** Wrong heading font, undefined font-heading class
- **Color tokens (40%):** Accent and ring tokens completely wrong, primary in hex
- **Spacing (65%):** 200+ non-8px-grid values
- **Components (55%):** Missing hover states, wrong image ratios, inconsistent badges
- **Motion (40%):** No button/card interaction feedback
- **Admin (45%):** No drag-and-drop, no live preview, no inline editing

## Phased Approach

### Phase 1: Foundation (Steps 1-9, ~30 files)
Design tokens, Plus Jakarta Sans font, button/card polish, accent migration, motion system, hardcoded value cleanup. Ends with visual QA gate.

### Phase 2: Spacing (Steps 10-14, ~100+ files)
Card padding normalization, 8px grid enforcement across all features/routes/components, arbitrary value removal. Ends with visual QA gate.

### Phase 3: Admin Overhaul (Steps 15-20, ~15-20 new/modified files)
Dedicated PDD session, database schema, dnd-kit integration, modifier refactor, live preview panel, inline editing. Ends with visual QA gate.

## Key Decisions

1. **Plus Jakarta Sans replaces League Spartan** for headings (Design System is authoritative)
2. **Accent token = orange** (same as primary), mitigated with `bg-primary/5` hovers
3. **Restaurant card image: 3:2 ratio** (compromise between current 2.3:1 and spec's 4:3)
4. **Secondary button dual behavior**: transparent-border in admin, solid pill in customer portal
5. **Sheet timing: 250ms open / 200ms close** (asymmetric for natural feel)
6. **Phase 3 requires its own PDD session** before implementation (highest complexity)
7. **Visual QA gates mandatory** between each phase

## Next Steps

1. Review the design at `design/detailed-design.md`
2. Review the implementation plan at `implementation/plan.md`
3. Begin implementation following the 20-step plan

To start implementation:
- `ralph run --config presets/pdd-to-code-assist.yml --prompt "Implement Phase 1 of the Design System Hard Cutover following .agents/planning/2026-03-11-design-system-hardcutover/implementation/plan.md"`
- `ralph run -c ralph.yml -H builtin:pdd-to-code-assist -p "Implement Phase 1 of the Design System Hard Cutover following .agents/planning/2026-03-11-design-system-hardcutover/implementation/plan.md"`
