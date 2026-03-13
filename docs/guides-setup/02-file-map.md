# 02 — File Map

Every file in the guides system, grouped by layer.

## Route layer (`src/app/(public)/guides/`)

```
src/app/(public)/guides/
├── page.tsx                       # Guides index — imports GuidesIndexPage
└── [slug]/
    └── page.tsx                   # Guide detail — static generation + branching
```

**Ownership:** Route files stay thin. They import from `src/features/guides/`
and handle only Next.js concerns: `generateStaticParams`, `generateMetadata`,
and component selection.

## Feature layer (`src/features/guides/`)

```
src/features/guides/
│
├── content/
│   └── guides.ts                  # Registry: GuideEntry[], GUIDE_MAP, slug constants
│
├── pages/
│   ├── guides-index-page.tsx      # Hub page — audience grouping, featured cards
│   └── guide-article-page.tsx     # Generic article layout (non-interactive)
│
└── components/
    │
    ├── interactive-guide-types.ts           # TS types for sections, tips, callouts
    ├── interactive-guide-article-page.tsx   # Interactive shell (TOC, observer, sections)
    ├── guide-snippet-wrapper.tsx            # Inert preview wrapper ("What you will see")
    │
    ├── discovery-guide/                     # Journey 1: Discovery & Search
    │   ├── discovery-guide-article-page.tsx     # Thin wiring component
    │   ├── discovery-guide-content.ts           # Sections & subsections
    │   └── discovery-guide-snippets.tsx         # Mock components (search, filters, cards)
    │
    ├── owner-setup-guide/                   # Journey 2: Owner Setup & Launch
    │   ├── owner-setup-guide-article-page.tsx
    │   ├── owner-setup-guide-content.ts
    │   └── owner-setup-guide-snippets.tsx       # Mock onboarding wizard, forms
    │
    ├── ordering-guide/                      # Journey 3: Dine-in Ordering
    │   ├── ordering-guide-article-page.tsx
    │   ├── ordering-guide-content.ts
    │   └── ordering-guide-snippets.tsx          # Mock cart, checkout, tracking
    │
    ├── owner-ops-guide/                     # Journey 4: Owner Operations
    │   ├── owner-ops-guide-article-page.tsx
    │   ├── owner-ops-guide-content.ts
    │   └── owner-ops-guide-snippets.tsx         # Mock order queue, menu editor
    │
    └── admin-guide/                         # Journey 5: Governance
        ├── admin-guide-article-page.tsx
        ├── admin-guide-content.ts
        └── admin-guide-snippets.tsx             # Mock dashboard, invitations, users
```

## File purposes

### Registry (`content/guides.ts`)

Single file containing:
- `GuideEntry` type definition (or re-export from `interactive-guide-types.ts`)
- All guide entries as a flat array `GUIDE_ENTRIES`
- `GUIDE_MAP` for O(1) slug lookup
- Slug string constants for route branching
- `getGuideBySlug()` accessor

### Index page (`pages/guides-index-page.tsx`)

Server component. Receives `GUIDE_ENTRIES` as a prop. Groups by
`entry.audience` and renders featured cards + grid. No data fetching.

### Generic article (`pages/guide-article-page.tsx`)

Server component for non-interactive guides. Renders:
- Header (badge, title, dates)
- Intro "direct answer" block
- Body sections with paragraphs
- FAQ accordion
- Related links

### Interactive shell (`components/interactive-guide-article-page.tsx`)

`"use client"` component. Receives:
- `sections: InteractiveGuideSection[]`
- `getSnippetForSection: (sectionId: string) => ReactNode | null`
- Optional `header` and `footer` ReactNodes (server-rendered, passed down)

Provides:
- Desktop sticky TOC (left column)
- Mobile collapsible TOC
- `IntersectionObserver` tracking active section
- Step numbering with required/optional badges
- Subsection rendering with snippet slots

### Journey-specific triads

Each journey has three files following the same pattern:

| File | Role | Server/Client |
|------|------|---------------|
| `*-article-page.tsx` | Thin component wiring sections + snippets into shell | Client |
| `*-content.ts` | Structured section data (text only, no JSX) | Shared (imported by both) |
| `*-snippets.tsx` | Mock UI components + section-to-snippet map | Client |

### Snippet wrapper (`guide-snippet-wrapper.tsx`)

Wraps any snippet preview with:
- Dashed border + muted background
- "What you will see" label
- `pointer-events-none select-none` to prevent interaction

## Naming conventions

| Pattern | Example |
|---------|---------|
| Guide slug | `how-to-find-restaurants-and-dishes` |
| Content file | `discovery-guide-content.ts` |
| Snippet file | `discovery-guide-snippets.tsx` |
| Article page | `discovery-guide-article-page.tsx` |
| Snippet map export | `DISCOVERY_GUIDE_SNIPPET_MAP` |
| Snippet resolver | `getDiscoverySnippetForSection()` |
| Section ID | `search-restaurants`, `apply-filters`, `view-menu` |
| Subsection ID | `search-restaurants/use-search-bar`, `apply-filters/cuisine` |
