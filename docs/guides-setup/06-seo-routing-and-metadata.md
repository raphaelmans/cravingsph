# 06 — SEO, Routing & Metadata

## Static generation

All guide slugs are known at build time. No `dynamicParams`:

```tsx
// src/app/(public)/guides/[slug]/page.tsx

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDE_ENTRIES.map((entry) => ({ slug: entry.slug }));
}
```

This means:
- Every guide page is pre-rendered at `pnpm build`
- Unknown slugs return 404 automatically
- No runtime DB or API calls for guide content

## Metadata generation

Each guide page exports `generateMetadata` using the registry entry:

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getGuideBySlug(slug);
  if (!entry) return {};

  const url = `${siteConfig.url}/guides/${slug}`;

  return {
    title: entry.title,
    description: entry.description,
    alternates: { canonical: url },
    openGraph: {
      title: entry.title,
      description: entry.description,
      url,
      type: "article",
      siteName: siteConfig.name,
    },
  };
}
```

### Index page metadata

The guides hub has static metadata:

```tsx
// src/app/(public)/guides/page.tsx

export const metadata: Metadata = {
  title: "Guides — CravingsPH",
  description:
    "Step-by-step guides for finding restaurants, setting up your venue, ordering dine-in, managing operations, and administering the platform.",
  alternates: {
    canonical: `${siteConfig.url}/guides`,
  },
};
```

## JSON-LD structured data

Each guide page includes two JSON-LD schemas, injected via a `<script>` tag
with `JSON.stringify` on static data objects (safe — no user input involved):

### 1. Article schema

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to order dine-in at a restaurant",
  "description": "Step-by-step guide to...",
  "dateModified": "2026-03-01",
  "author": {
    "@type": "Organization",
    "name": "CravingsPH"
  },
  "publisher": {
    "@type": "Organization",
    "name": "CravingsPH"
  },
  "mainEntityOfPage": "https://cravings.ph/guides/how-to-order-dine-in"
}
```

### 2. BreadcrumbList schema

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Guides", "item": "https://cravings.ph/guides" },
    { "@type": "ListItem", "position": 2, "name": "How to order dine-in" }
  ]
}
```

### 3. FAQPage schema (if FAQs exist)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Can I order for pickup?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Currently, CravingsPH supports dine-in orders only."
      }
    }
  ]
}
```

### Implementation

Build the schema objects from the `GuideEntry` in the route file, not in
feature components — this keeps the feature layer framework-agnostic.

```tsx
function buildGuideJsonLd(entry: GuideEntry) {
  const url = `${siteConfig.url}/guides/${entry.slug}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: entry.title,
      description: entry.description,
      dateModified: entry.lastUpdated,
      author: { "@type": "Organization", name: "CravingsPH" },
      publisher: { "@type": "Organization", name: "CravingsPH" },
      mainEntityOfPage: url,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Guides", item: `${siteConfig.url}/guides` },
        { "@type": "ListItem", position: 2, name: entry.title },
      ],
    },
    ...(entry.faqs.length > 0
      ? [{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: entry.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }]
      : []),
  ];
}
```

## Route branching

The `[slug]/page.tsx` route branches on slug constants to select the
correct interactive guide component:

```tsx
export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getGuideBySlug(slug);
  if (!entry) notFound();

  const jsonLd = buildGuideJsonLd(entry);

  // Interactive guides — route to journey-specific components
  if (entry.isInteractive) {
    const { header, footer } = buildInteractiveGuideChrome(entry);

    switch (slug) {
      case DISCOVERY_GUIDE_SLUG:
        return (
          <>
            <JsonLd data={jsonLd} />
            <DiscoveryGuideArticlePage header={header} footer={footer} />
          </>
        );
      case OWNER_SETUP_GUIDE_SLUG:
        return (
          <>
            <JsonLd data={jsonLd} />
            <OwnerSetupGuideArticlePage header={header} footer={footer} />
          </>
        );
      // ... other journeys
    }
  }

  // Generic articles
  return (
    <>
      <JsonLd data={jsonLd} />
      <GuideArticlePage entry={entry} />
    </>
  );
}
```

## Header and footer assembly

Interactive guides receive server-rendered `header` and `footer` as props.
This keeps expensive rendering (FAQs, related links) on the server while
the interactive shell hydrates on the client.

```tsx
function buildInteractiveGuideChrome(entry: GuideEntry) {
  const header = (
    <div className="mb-8">
      <Badge variant="outline">{entry.audience}</Badge>
      <h1 className="mt-2 text-2xl font-bold">{entry.title}</h1>
      <p className="mt-1 text-muted-foreground">{entry.description}</p>
      <p className="mt-4">{entry.intro}</p>
    </div>
  );

  const footer = (
    <div className="mt-12 space-y-8">
      {entry.faqs.length > 0 && <FaqAccordion faqs={entry.faqs} />}
      {entry.relatedLinks.length > 0 && <RelatedLinks links={entry.relatedLinks} />}
    </div>
  );

  return { header, footer };
}
```

## Site config

Create or extend a `siteConfig` object for URL generation:

```ts
// src/common/site-config.ts (or extend existing config)

export const siteConfig = {
  name: "CravingsPH",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://cravings.ph",
};
```

## Canonical URLs

Every guide page sets `alternates.canonical` in metadata. The index page
does too. This prevents duplicate content issues if guides are accessible
via multiple paths.

## Route definition

Add the guides route to `src/common/app-routes.ts`:

```ts
export const appRoutes = {
  // ... existing routes
  guides: {
    base: "/guides",
    detail: (slug: string) => `/guides/${slug}` as const,
  },
};
```
