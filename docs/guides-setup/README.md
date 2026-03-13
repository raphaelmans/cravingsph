# CravingsPH — Guides System Setup

> Implementation blueprint for the `/guides` section — interactive,
> SEO-optimised walkthroughs of CravingsPH's five core user journeys.

## What this document set covers

| Doc | Purpose |
|-----|---------|
| [01 — Architecture Overview](./01-architecture-overview.md) | Design philosophy, rendering strategy, three guide types |
| [02 — File Map](./02-file-map.md) | Every file you will create or touch, with ownership labels |
| [03 — Content Model & Slugs](./03-content-model-and-slugs.md) | `GuideEntry` type, slug conventions, the registry file |
| [04 — Interactive Article Shell](./04-interactive-article-shell.md) | Client-side TOC, section rendering, step numbering |
| [05 — Snippet Preview Pattern](./05-snippet-preview-pattern.md) | "What You Will See" inert previews using real components |
| [06 — SEO, Routing & Metadata](./06-seo-routing-and-metadata.md) | `generateStaticParams`, `generateMetadata`, JSON-LD schemas |
| [07 — Replication Playbook](./07-replication-playbook.md) | Step-by-step checklist for adding a new guide |

## Five core journeys

The guides system covers the five journeys defined in PRD v4:

| # | Journey | Audience | Slug (interactive) |
|---|---------|----------|---------------------|
| 1 | Discovery & Search | Customers | `how-to-find-restaurants-and-dishes` |
| 2 | Owner Setup & Launch Readiness | Owners | `how-to-set-up-your-restaurant` |
| 3 | Dine-in Ordering Flow | Customers | `how-to-order-dine-in` |
| 4 | Owner Operations & Fulfillment | Owners | `how-to-manage-orders-and-operations` |
| 5 | Governance & Maturity | Admins | `how-to-administer-the-platform` |

Each interactive guide walks its audience through the end-to-end flow with
step-by-step sections, embedded UI previews, tips, and FAQs.

## Quick start

1. Read **01 — Architecture Overview** for the mental model.
2. Skim **02 — File Map** to see what goes where.
3. Follow **07 — Replication Playbook** to scaffold a guide.
4. Use **03–06** as reference while building content and snippets.

## Prerequisites

- Familiarity with the CravingsPH codebase (see `CLAUDE.md`)
- Understanding of shadcn/ui component library
- Basic Next.js App Router knowledge (route groups, `generateStaticParams`)
