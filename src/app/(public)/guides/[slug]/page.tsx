import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import { Badge } from "@/components/ui/badge";
import { AdminGuideArticlePage } from "@/features/guides/components/admin-guide/admin-guide-article-page";
import { DiscoveryGuideArticlePage } from "@/features/guides/components/discovery-guide/discovery-guide-article-page";
import { OrderingGuideArticlePage } from "@/features/guides/components/ordering-guide/ordering-guide-article-page";
import { OwnerOpsGuideArticlePage } from "@/features/guides/components/owner-ops-guide/owner-ops-guide-article-page";
import { OwnerSetupGuideArticlePage } from "@/features/guides/components/owner-setup-guide/owner-setup-guide-article-page";
import type { GuideEntry } from "@/features/guides/content/guides";
import {
  ADMIN_GUIDE_SLUG,
  DISCOVERY_GUIDE_SLUG,
  GUIDE_ENTRIES,
  getGuideBySlug,
  ORDERING_GUIDE_SLUG,
  OWNER_OPS_GUIDE_SLUG,
  OWNER_SETUP_GUIDE_SLUG,
} from "@/features/guides/content/guides";
import { GuideArticlePage } from "@/features/guides/pages/guide-article-page";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://cravings.ph";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDE_ENTRIES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return { title: "Guide", robots: { index: false, follow: false } };
  }

  const canonicalUrl = new URL(`/guides/${guide.slug}`, appUrl);

  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.description,
      url: canonicalUrl,
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function buildStructuredData(guide: GuideEntry) {
  const canonicalUrl = `${appUrl}/guides/${guide.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: guide.title,
        description: guide.description,
        datePublished: guide.publishedAt,
        dateModified: guide.updatedAt,
        inLanguage: "en-PH",
        mainEntityOfPage: canonicalUrl,
        author: { "@type": "Organization", name: "CravingsPH" },
        publisher: { "@type": "Organization", name: "CravingsPH" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: appUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Guides",
            item: `${appUrl}/guides`,
          },
          { "@type": "ListItem", position: 3, name: guide.title },
        ],
      },
      ...(guide.faqs.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: guide.faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: { "@type": "Answer", text: faq.answer },
              })),
            },
          ]
        : []),
    ],
  };
}

// ---------------------------------------------------------------------------
// Interactive guide wrapper
// ---------------------------------------------------------------------------

const INTERACTIVE_SLUGS = new Set([
  DISCOVERY_GUIDE_SLUG,
  OWNER_SETUP_GUIDE_SLUG,
  ORDERING_GUIDE_SLUG,
  OWNER_OPS_GUIDE_SLUG,
  ADMIN_GUIDE_SLUG,
]);

function InteractiveGuideWrapper({
  guide,
  children,
}: {
  guide: GuideEntry;
  children: React.ReactNode;
}) {
  const structuredData = buildStructuredData(guide);

  return (
    <>
      <Script id={`guide-article-${guide.slug}`} type="application/ld+json">
        {JSON.stringify(structuredData).replace(/</g, "\\u003c")}
      </Script>
      <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <article className="mx-auto max-w-5xl">{children}</article>
      </div>
    </>
  );
}

function buildGuideHeader(guide: GuideEntry) {
  return (
    <header className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Badge
          variant={guide.audience === "customer" ? "secondary" : "default"}
        >
          {guide.heroEyebrow}
        </Badge>
      </div>
      <div className="space-y-3">
        <h1 className="font-heading text-4xl font-bold tracking-tight md:text-5xl">
          {guide.title}
        </h1>
        <p className="text-base leading-7 text-muted-foreground md:text-lg">
          {guide.description}
        </p>
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>Published {formatDate(guide.publishedAt)}</span>
        <span>Updated {formatDate(guide.updatedAt)}</span>
      </div>
      <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5">
        <p className="font-heading text-sm font-semibold text-foreground">
          Direct answer
        </p>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          {guide.intro}
        </p>
      </div>
    </header>
  );
}

function buildGuideFooter(guide: GuideEntry) {
  return (
    <>
      <div className="space-y-4">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {guide.faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-2xl border border-border/60 bg-card p-5"
            >
              <h3 className="font-heading text-lg font-semibold tracking-tight">
                {faq.question}
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Keep exploring
        </h2>
        <ul className="space-y-3">
          {guide.relatedLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) return notFound();

  if (INTERACTIVE_SLUGS.has(slug)) {
    const header = buildGuideHeader(guide);
    const footer = buildGuideFooter(guide);

    const ArticleMap: Record<
      string,
      React.ComponentType<{
        header?: React.ReactNode;
        footer?: React.ReactNode;
      }>
    > = {
      [DISCOVERY_GUIDE_SLUG]: DiscoveryGuideArticlePage,
      [OWNER_SETUP_GUIDE_SLUG]: OwnerSetupGuideArticlePage,
      [ORDERING_GUIDE_SLUG]: OrderingGuideArticlePage,
      [OWNER_OPS_GUIDE_SLUG]: OwnerOpsGuideArticlePage,
      [ADMIN_GUIDE_SLUG]: AdminGuideArticlePage,
    };

    const Article = ArticleMap[slug];
    if (Article) {
      return (
        <InteractiveGuideWrapper guide={guide}>
          <Article header={header} footer={footer} />
        </InteractiveGuideWrapper>
      );
    }
  }

  return <GuideArticlePage guide={guide} />;
}
