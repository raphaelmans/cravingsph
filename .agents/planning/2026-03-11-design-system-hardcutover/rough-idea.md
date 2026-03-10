# Rough Idea

Overhaul the entire CravingsPH application — all components, screens, and pages — to align with the Design System document from the knowledge base (`default:cravingsph/Design System.docx`).

## Scope

This is NOT limited to the customer portal navigation hard cutover. It covers:

- **All customer-facing pages** (home/discovery, restaurant detail, menu, search, orders, saved, account)
- **All admin/owner pages** (dashboard, restaurant management, menu editing, categories, modifiers)
- **All shared components** (buttons, cards, inputs, tags/chips, modals, headers, navigation)
- **Typography** — enforce Plus Jakarta Sans for headlines, Inter for body text, with the specified scale (H1 32px SemiBold, H2 24px SemiBold, H3 20px Medium, Body Large 16px, Body 14px, Caption 12px)
- **Spacing** — enforce 8px grid system (4/8/16/24/32/48/64px scale)
- **Colors** — enforce semantic token system (primary #F86006, dark text #1D1D1D, neutrals #FFFFFF/#F7F7F7/#EAEAEA/#6B6B6B) via OKLCH design tokens
- **Motion & interactions** — 150-250ms animations, ease-out curves, hover/press states on buttons and cards
- **Component guidelines** — buttons (primary/secondary styles), restaurant cards (4:3 image, shadow-sm → shadow-md hover), menu item cards (1:1 image, 2-line description cap), input fields, cuisine chips
- **Admin dashboard** — align with modern productivity tool aesthetic (Notion/Linear/Stripe), inline editing, live preview, structured content editing
- **Design tokens** — ensure all OKLCH tokens match the Design System spec

## Source Document

The authoritative Design System document lives at `default:cravingsph/Design System.docx` (Google Drive via rclone). Its full text was extracted and reviewed as part of this planning session.
