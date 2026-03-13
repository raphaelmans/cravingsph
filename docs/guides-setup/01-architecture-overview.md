# 01 — Architecture Overview

## Design philosophy

The guides system serves three audiences — **customers**, **restaurant owners**,
and **platform admins** — with walkthroughs of CravingsPH's core flows. Each
guide is a standalone article that can be:

1. **Indexed** on the guides hub page (`/guides`)
2. **Deep-linked** via its slug (`/guides/how-to-order-dine-in`)
3. **Statically generated** at build time for instant loads and SEO

### Principles

| Principle | Rationale |
|-----------|-----------|
| **Thin routes, fat features** | App Router files import from `src/features/guides/` — no business logic in route files |
| **Content as data** | Guide text, sections, FAQs, and metadata live in typed TS objects, not MDX files — enables type-safe registry, filtering, and JSON-LD generation |
| **Real component previews** | Interactive guides embed actual CravingsPH UI components (cart, checkout, menu) rendered inert — users see exactly what they will encounter |
| **Static generation** | All slugs known at build time via `generateStaticParams` — no runtime DB queries for guide pages |

## Three guide types

### 1. Generic article

A straightforward prose guide with sections, paragraphs, and an FAQ accordion.
Suitable for informational content like "How to find restaurants near you" or
"Understanding cuisine categories".

**Rendering:** `GuideArticlePage` component — server-rendered, no client JS
beyond hydration.

### 2. Interactive article

A step-by-step walkthrough with:
- Numbered sections (required vs optional steps)
- Sticky table of contents with active-section tracking
- Expandable tips, callouts, and accordions
- Embedded snippet previews of real UI

Suitable for the five core journey guides.

**Rendering:** `InteractiveGuideArticlePage` (client component) — uses
`IntersectionObserver` for TOC highlighting, renders snippet slots.

### 3. Specialized interactive article

An interactive article with a dedicated entry component and snippet map.
Each core journey gets its own:
- `*-content.ts` — section/subsection definitions
- `*-snippets.tsx` — mock component map
- `*-article-page.tsx` — thin wiring component

This separation means content authors can edit text without touching React
components, and designers can iterate on snippets without modifying content.

## Rendering strategy

```
Route file (src/app/(public)/guides/[slug]/page.tsx)
  │
  ├─ generateStaticParams()  →  slugs from registry
  ├─ generateMetadata()      →  title, description, openGraph from entry
  │
  └─ Page component
       │
       ├─ Interactive guide?  →  Journey-specific article page
       │    ├─ Sections from *-content.ts
       │    ├─ Snippets from *-snippets.tsx
       │    └─ Shell: InteractiveGuideArticlePage
       │
       └─ Generic guide?      →  GuideArticlePage
            └─ Sections from registry entry
```

## Audience segmentation

The guides index page groups guides by audience:

| Audience | Badge colour | Guides |
|----------|-------------|--------|
| Customers | `primary` | Discovery & Search, Dine-in Ordering |
| Owners | `peach` | Owner Setup, Owner Operations |
| Admins | `muted` | Governance & Maturity |

Each audience gets a featured guide card (the interactive walkthrough) plus
any supplementary generic guides in a grid below.

## Data flow

```
guides.ts (registry)
  │
  ├─ GUIDE_ENTRIES: GuideEntry[]     →  index page, static params, metadata
  ├─ GUIDE_MAP: Map<slug, entry>     →  O(1) lookup by slug
  ├─ getGuideBySlug(slug)            →  typed accessor
  │
  └─ Slug constants
       ├─ DISCOVERY_GUIDE_SLUG
       ├─ OWNER_SETUP_GUIDE_SLUG
       ├─ ORDERING_GUIDE_SLUG
       ├─ OWNER_OPS_GUIDE_SLUG
       └─ ADMIN_GUIDE_SLUG
```

No database, no CMS, no runtime fetches. The registry is the single source
of truth and is tree-shaken per page at build time.
