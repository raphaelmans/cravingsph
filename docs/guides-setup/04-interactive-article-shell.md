# 04 — Interactive Article Shell

The interactive article shell is the client-side layout that powers
step-by-step journey guides. It provides a sticky table of contents,
active section tracking, and snippet rendering slots.

## Type system

Interactive guides use a richer type hierarchy than generic articles.
Defined in `interactive-guide-types.ts`:

```ts
interface InteractiveGuideTip {
  text: string;
}

interface InteractiveGuideCallout {
  title: string;
  body: string;
}

interface InteractiveGuideAccordionItem {
  trigger: string;
  content: string;
}

interface InteractiveGuideSubsection {
  id: string;                      // e.g. "browse-and-add/select-variant"
  title: string;
  paragraphs: string[];
  tips?: InteractiveGuideTip[];
  callouts?: InteractiveGuideCallout[];
  accordion?: InteractiveGuideAccordionItem[];
  hasSnippet?: boolean;            // true → snippet map queried for this ID
}

interface InteractiveGuideSection {
  id: string;                      // e.g. "browse-and-add"
  title: string;
  icon: LucideIcon;               // Lucide component reference
  stepNumber: number;
  isOptional?: boolean;            // renders "(optional)" badge
  paragraphs: string[];
  tips?: InteractiveGuideTip[];
  callouts?: InteractiveGuideCallout[];
  accordion?: InteractiveGuideAccordionItem[];
  subsections?: InteractiveGuideSubsection[];
  hasSnippet?: boolean;
}
```

## Shell component API

`InteractiveGuideArticlePage` accepts:

```ts
interface InteractiveGuideArticlePageProps {
  sections: InteractiveGuideSection[];
  getSnippetForSection: (sectionId: string) => ReactNode | null;
  header?: ReactNode;   // Server-rendered header (title, badges, dates)
  footer?: ReactNode;   // Server-rendered footer (FAQs, related links)
}
```

This design keeps the shell generic. Each journey provides its own sections
and snippet resolver; the shell handles layout and interactivity.

## Layout structure

```
┌──────────────────────────────────────────────────┐
│ header (server-rendered: title, badge, dates)    │
├────────────┬─────────────────────────────────────┤
│            │                                     │
│  Sticky    │  Section 1                          │
│  TOC       │    paragraphs                       │
│            │    tips / callouts                   │
│  ● Step 1  │    [snippet preview]                │
│  ○ Step 2  │    Subsection 1a                    │
│  ○ Step 3  │      paragraphs                     │
│  ○ Step 4  │      [snippet preview]              │
│  ○ Step 5  │                                     │
│  ○ Step 6  │  Section 2                          │
│            │    ...                               │
│            │                                     │
├────────────┴─────────────────────────────────────┤
│ footer (server-rendered: FAQs, related links)    │
└──────────────────────────────────────────────────┘
```

**Desktop:** `lg:grid-cols-[220px_1fr]` — TOC is sticky left column.
**Mobile:** TOC collapses into a `Collapsible` above the content.

## Active section tracking

The shell uses `IntersectionObserver` with `rootMargin: "-96px 0px -60% 0px"`:

```ts
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      }
    },
    { rootMargin: "-96px 0px -60% 0px" }
  );

  for (const section of sections) {
    const el = document.getElementById(section.id);
    if (el) observer.observe(el);
  }

  return () => observer.disconnect();
}, [sections]);
```

The `-96px` top offset accounts for the sticky header. The `-60%` bottom
offset means a section becomes "active" when its top enters the upper 40%
of the viewport — providing early highlighting as the user scrolls.

## TOC rendering

The `TableOfContents` component renders:

```tsx
<nav>
  {sections.map((section) => (
    <div key={section.id}>
      <a
        href={`#${section.id}`}
        className={cn(
          "block py-1 text-sm transition-colors",
          activeId === section.id
            ? "font-medium text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {section.stepNumber}. {section.title}
      </a>
      {section.subsections?.map((sub) => (
        <a
          key={sub.id}
          href={`#${sub.id}`}
          className="block py-0.5 pl-4 text-xs text-muted-foreground hover:text-foreground"
        >
          {sub.title}
        </a>
      ))}
    </div>
  ))}
</nav>
```

## Section rendering

Each section renders in order:
1. **Step badge** — circle with number, optional "(optional)" label
2. **Icon** — Lucide icon from section definition
3. **Title** — `<h2 id={section.id}>`
4. **Paragraphs** — plain text blocks
5. **Tips** — light background callout with bulb icon
6. **Callouts** — bordered callout with title
7. **Accordion** — expandable Q&A items
8. **Snippet** — if `hasSnippet`, renders `getSnippetForSection(section.id)`
   wrapped in `GuideSnippetWrapper`
9. **Subsections** — recursively render with `<h3>` headings, same content
   blocks, and their own snippet slots

## Step numbering

Steps are numbered based on `section.stepNumber`. Optional steps get a
subtle styling treatment:

```tsx
<div className={cn(
  "flex size-8 items-center justify-center rounded-full text-sm font-medium",
  section.isOptional
    ? "border border-dashed text-muted-foreground"
    : "bg-primary text-primary-foreground"
)}>
  {section.stepNumber}
</div>
```

## CravingsPH-specific considerations

- **Sticky header offset:** CravingsPH uses a sticky header in the public
  layout. The `rootMargin` top value should match the header height (measure
  from `src/components/layout/` after integration).
- **Mobile bottom nav:** On customer-facing pages, the bottom nav is present.
  Ensure the TOC collapsible doesn't conflict with the nav's z-index.
- **Color tokens:** Use semantic tokens (`primary`, `muted`, `accent`) — never
  hardcoded Tailwind colors per `CLAUDE.md`.
- **Pill shapes:** Customer-facing guides should use `rounded-full` for badges
  and `rounded-4xl` for large cards, matching the customer portal design language.
