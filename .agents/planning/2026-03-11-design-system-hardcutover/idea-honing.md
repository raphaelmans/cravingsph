# Idea Honing — Design System Overhaul

Requirements clarification Q&A for the full app-wide design system alignment.

---

## Q1: Phasing Strategy

The research uncovered 6 major gap areas with very different effort levels:

| Area | Compliance | Effort | Risk |
|------|-----------|--------|------|
| **A. Design tokens** (colors in globals.css) | 40% | Low — one file change | Low |
| **B. Typography** (import Plus Jakarta Sans, define font-heading, heading scale) | 30% | Low-Medium — font import + 22 file touches | Medium (visual change) |
| **C. Component polish** (button hover/active, card hover elevation, badge consistency) | 55% | Medium — touches base UI components | Medium |
| **D. Spacing normalization** (8px grid, card padding, arbitrary values) | 65% | Medium-High — 100+ file touches | High (layout shifts) |
| **E. Motion & interactions** (scale feedback, ease-out, page transitions) | 40% | Medium — CSS additions + sheet timing | Low |
| **F. Admin dashboard** (drag-and-drop, live preview, inline editing) | 45% | Very High — new library + major refactors | High |

Should we tackle all 6 areas in one plan, or phase it? For example:
- **Phase 1 (Foundation):** A + B + C + E — tokens, typography, components, motion
- **Phase 2 (Normalization):** D — spacing grid enforcement across all files
- **Phase 3 (Admin overhaul):** F — drag-and-drop, preview, inline editing

**A1:** Proceed by phases. All three phases planned, implemented sequentially.

---

## Q2: Typography Font Decision

The Design System doc specifies **Plus Jakarta Sans** for headlines, but the current codebase uses **League Spartan** (mapped to `font-display`). The CLAUDE.md also lists League Spartan as the heading font.

Two options:
1. **Follow the Design System doc** — replace League Spartan with Plus Jakarta Sans for headings. This changes the visual identity of all headlines.
2. **Keep League Spartan** — treat the Design System doc as aspirational, keep League Spartan since it's already established and referenced in CLAUDE.md.

Which direction?

**A2:** Follow the Design System doc. Replace League Spartan with Plus Jakarta Sans for all headings. Update CLAUDE.md to reflect the change.

---

## Q3: Accent Token Semantics

The Design System doc defines `--accent` as the same orange as `--primary` (oklch(0.66 0.23 40)). Currently `--accent` is a light gray used for hover backgrounds on ghost buttons, dropdown items, sidebar items, etc.

If we change `--accent` to orange, every ghost button hover, every dropdown item highlight, and every sidebar active state will turn orange. This is a **major visual change** that may look aggressive.

Options:
1. **Follow the spec exactly** — accent = orange. Adjust component styles afterward to tone down any overly orange hovers.
2. **Keep accent as neutral** — deviate from the doc for usability. Use `--primary` directly where orange accent is needed.
3. **Create a middle ground** — make accent a warm-tinted neutral (e.g., oklch with hue 40 but very low chroma) so it's warm but not fully orange.

**A3:** Follow the spec exactly. Accent = orange (same as primary). Adjust component hover opacities as needed to avoid overly aggressive surfaces. The Design System document is the authoritative source — output quality is what matters.

---

## Q4: Requirements Complete

All key decisions established:
- **Phasing:** 3 phases (Foundation → Spacing → Admin)
- **Typography:** Plus Jakarta Sans replaces League Spartan
- **Accent token:** Follow spec (orange), adjust component opacities
- **Source of truth:** Design System doc is authoritative
- **Quality gates:** Apply /web-design-guidelines, /colorize, /critique to validate output

Proceeding to design.
