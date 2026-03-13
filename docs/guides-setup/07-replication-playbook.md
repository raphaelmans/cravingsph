# 07 — Replication Playbook

Step-by-step checklist for implementing the guides system and adding new
guides. Follow in order.

---

## Phase 1 — Foundation (one-time setup)

### Step 1: Create the feature directory

```
mkdir -p src/features/guides/{content,pages,components}
```

### Step 2: Define types

Create `src/features/guides/components/interactive-guide-types.ts` with:
- `InteractiveGuideTip`
- `InteractiveGuideCallout`
- `InteractiveGuideAccordionItem`
- `InteractiveGuideSubsection`
- `InteractiveGuideSection`

See doc 04 for the full type definitions.

### Step 3: Create the content registry

Create `src/features/guides/content/guides.ts` with:
- `GuideEntry`, `GuideSection`, `GuideFaq`, `GuideLink` types
- Slug constants for all 5 interactive guides
- `GUIDE_ENTRIES` array (start with just the 5 interactive entries)
- `GUIDE_MAP` and `getGuideBySlug()` helper

See doc 03 for the content model.

### Step 4: Build the snippet wrapper

Create `src/features/guides/components/guide-snippet-wrapper.tsx`:
- Dashed border container
- "What you will see" label
- `pointer-events-none select-none`

### Step 5: Build the interactive shell

Create `src/features/guides/components/interactive-guide-article-page.tsx`:
- Client component with `IntersectionObserver`
- Desktop sticky TOC + mobile collapsible TOC
- Section/subsection rendering with snippet slots

See doc 04 for layout and tracking details.

### Step 6: Build the generic article page

Create `src/features/guides/pages/guide-article-page.tsx`:
- Server component
- Renders header, intro, sections, FAQs, related links
- Receives `GuideEntry` as prop

### Step 7: Build the index page

Create `src/features/guides/pages/guides-index-page.tsx`:
- Server component
- Groups entries by `audience`
- Featured card per audience (the interactive guide)
- Grid for supplementary guides

### Step 8: Create routes

Create `src/app/(public)/guides/page.tsx`:
- Static metadata
- Import and render `GuidesIndexPage`

Create `src/app/(public)/guides/[slug]/page.tsx`:
- `dynamicParams = false`
- `generateStaticParams` from registry
- `generateMetadata` from entry
- Route branching for interactive vs generic
- JSON-LD injection

### Step 9: Add route definition

In `src/common/app-routes.ts`, add:
```ts
guides: {
  base: "/guides",
  detail: (slug: string) => `/guides/${slug}` as const,
},
```

### Step 10: Verify foundation

```bash
pnpm build    # Should generate /guides and /guides/[slug] pages
pnpm lint     # Should pass
npx tsc --noEmit  # Should have no errors
```

At this point the guides hub should render (with empty/placeholder content)
and all static pages should generate.

---

## Phase 2 — Journey guides (repeat per journey)

### Adding an interactive guide

Each interactive guide follows the same three-file pattern. Use this
checklist for each of the five journeys.

#### Step A: Create the content file

Create `src/features/guides/components/{journey}-guide/{journey}-guide-content.ts`:

1. Import `InteractiveGuideSection` type
2. Import Lucide icons for each step
3. Define `{JOURNEY}_GUIDE_SECTIONS` array
4. Each section needs: `id`, `title`, `icon`, `stepNumber`, `paragraphs`
5. Add subsections where the flow has distinct sub-steps
6. Add `tips`, `callouts`, `accordion` for helpful context
7. Set `hasSnippet: true` on sections/subsections that get a preview

**Reference section IDs:** See doc 03 for the proposed IDs per journey.

#### Step B: Create the snippets file

Create `src/features/guides/components/{journey}-guide/{journey}-guide-snippets.tsx`:

1. Import real CravingsPH components where possible
2. Build `Mock*` components with hardcoded Filipino data
3. Export the snippet map: `{JOURNEY}_GUIDE_SNIPPET_MAP`
4. Export the resolver: `get{Journey}SnippetForSection()`
5. Wrap each mock in appropriate containers (cards, borders, etc.)

**Guidelines:**
- Import from `@/features/` and `@/components/ui/`
- Use realistic data (restaurant names, dish names, PHP prices)
- Keep mocks minimal — 2-3 items max per list
- No tRPC hooks, no Zustand stores, no side effects

#### Step C: Create the article page

Create `src/features/guides/components/{journey}-guide/{journey}-guide-article-page.tsx`:

```tsx
"use client";

import { InteractiveGuideArticlePage } from "../interactive-guide-article-page";
import { {JOURNEY}_GUIDE_SECTIONS } from "./{journey}-guide-content";
import { get{Journey}SnippetForSection } from "./{journey}-guide-snippets";

interface Props {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function {Journey}GuideArticlePage({ header, footer }: Props) {
  return (
    <InteractiveGuideArticlePage
      sections={{JOURNEY}_GUIDE_SECTIONS}
      getSnippetForSection={get{Journey}SnippetForSection}
      header={header}
      footer={footer}
    />
  );
}
```

#### Step D: Wire into the route

In `src/app/(public)/guides/[slug]/page.tsx`, add a `case` for the new
journey's slug constant in the `switch` statement.

#### Step E: Fill registry content

In `content/guides.ts`, ensure the entry has:
- Complete `description` and `intro` text
- FAQs relevant to the journey
- Related links to other guides and relevant app pages

#### Step F: Verify

```bash
pnpm build
# Check: /guides/{slug} generates without errors
# Check: Guide renders with TOC, sections, snippets
```

---

## Phase 3 — Supplementary guides

### Adding a generic guide

1. Add a `GuideEntry` to `GUIDE_ENTRIES` with `isInteractive: false`
2. Fill `sections` with `GuideSection[]` (id, title, paragraphs)
3. Add FAQs and related links
4. No snippet map needed
5. `generateStaticParams` picks it up automatically
6. The index page groups it under the right audience

---

## Recommended implementation order

| Order | Guide | Rationale |
|-------|-------|-----------|
| 1 | Owner Setup (Journey 2) | Most complex onboarding flow, tests all shell features |
| 2 | Dine-in Ordering (Journey 3) | Customer-facing, exercises cart/checkout snippets |
| 3 | Discovery & Search (Journey 1) | Exercises filter and search UI snippets |
| 4 | Owner Operations (Journey 4) | Owner portal components |
| 5 | Governance (Journey 5) | Admin components, likely simplest |

Start with Owner Setup because it has the most steps (7) and subsections,
which will validate the interactive shell thoroughly. If that guide works
well, the rest follow the same pattern with less complexity.

---

## Checklist summary

```
Foundation:
[ ] interactive-guide-types.ts
[ ] content/guides.ts (registry)
[ ] guide-snippet-wrapper.tsx
[ ] interactive-guide-article-page.tsx (shell)
[ ] guide-article-page.tsx (generic)
[ ] guides-index-page.tsx
[ ] src/app/(public)/guides/page.tsx
[ ] src/app/(public)/guides/[slug]/page.tsx
[ ] app-routes.ts update
[ ] pnpm build passes

Journey 1 — Discovery & Search:
[ ] discovery-guide-content.ts
[ ] discovery-guide-snippets.tsx
[ ] discovery-guide-article-page.tsx
[ ] Route wiring
[ ] Registry content complete

Journey 2 — Owner Setup:
[ ] owner-setup-guide-content.ts
[ ] owner-setup-guide-snippets.tsx
[ ] owner-setup-guide-article-page.tsx
[ ] Route wiring
[ ] Registry content complete

Journey 3 — Dine-in Ordering:
[ ] ordering-guide-content.ts
[ ] ordering-guide-snippets.tsx
[ ] ordering-guide-article-page.tsx
[ ] Route wiring
[ ] Registry content complete

Journey 4 — Owner Operations:
[ ] owner-ops-guide-content.ts
[ ] owner-ops-guide-snippets.tsx
[ ] owner-ops-guide-article-page.tsx
[ ] Route wiring
[ ] Registry content complete

Journey 5 — Governance:
[ ] admin-guide-content.ts
[ ] admin-guide-snippets.tsx
[ ] admin-guide-article-page.tsx
[ ] Route wiring
[ ] Registry content complete

Supplementary:
[ ] Generic guides added to registry
[ ] pnpm build passes
[ ] pnpm lint passes
[ ] npx tsc --noEmit passes
```
