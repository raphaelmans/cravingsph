import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ADMIN_GUIDE_SLUG,
  type GuideEntry,
  ORDERING_GUIDE_SLUG,
  OWNER_SETUP_GUIDE_SLUG,
} from "@/features/guides/content/guides";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function FeaturedGuideCard({
  guide,
  badgeLabel,
  tagline,
  ctaLabel,
  ctaHref,
}: {
  guide: GuideEntry;
  badgeLabel: string;
  tagline: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <article className="relative overflow-hidden rounded-4xl border border-primary/15 bg-background p-6 shadow-2xl shadow-primary/10 md:p-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 size-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 size-32 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-end">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-primary text-primary-foreground">
              {badgeLabel}
            </Badge>
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary/80">
              <BookOpen className="size-3.5" />
              {tagline}
            </span>
            <span className="text-xs text-muted-foreground">
              Updated {formatDate(guide.updatedAt)}
            </span>
          </div>

          <div className="max-w-3xl space-y-3">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance md:text-4xl">
              <Link
                href={`/guides/${guide.slug}`}
                className="transition-colors hover:text-primary"
              >
                {guide.title}
              </Link>
            </h2>
            <p className="text-base leading-7 text-muted-foreground md:text-lg">
              {guide.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="font-heading">
              <Link href={`/guides/${guide.slug}`}>
                {ctaLabel}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="font-heading"
            >
              <Link href={ctaHref}>Browse first</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-primary/15 bg-background/80 p-5 backdrop-blur-sm">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-primary/80">
            Quick path
          </p>
          <div className="mt-4 space-y-3">
            {guide.relatedLinks.slice(0, 3).map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-sm"
              >
                <span className="flex items-center gap-3">
                  <span className="font-heading text-xs text-primary/70">
                    0{index + 1}
                  </span>
                  <span>{link.label}</span>
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function GuideCard({ guide }: { guide: GuideEntry }) {
  return (
    <article className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{guide.heroEyebrow}</Badge>
          <span className="text-xs text-muted-foreground">
            Updated {formatDate(guide.updatedAt)}
          </span>
        </div>
        <div className="space-y-2">
          <h3 className="font-heading text-xl font-semibold tracking-tight">
            <Link href={`/guides/${guide.slug}`} className="hover:text-primary">
              {guide.title}
            </Link>
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            {guide.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {guide.relatedLinks.slice(0, 2).map((link) => (
            <Button key={link.href} asChild variant="outline" size="sm">
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </div>
      </div>
    </article>
  );
}

export function GuidesIndexPage({ guides }: { guides: GuideEntry[] }) {
  const customerGuides = guides.filter((g) => g.audience === "customer");
  const ownerGuides = guides.filter((g) => g.audience === "owner");
  const adminGuides = guides.filter((g) => g.audience === "admin");

  const featuredCustomer =
    customerGuides.find((g) => g.slug === ORDERING_GUIDE_SLUG) ??
    customerGuides[0];
  const remainingCustomer = customerGuides.filter(
    (g) => g.slug !== featuredCustomer?.slug,
  );

  const featuredOwner =
    ownerGuides.find((g) => g.slug === OWNER_SETUP_GUIDE_SLUG) ??
    ownerGuides[0];
  const remainingOwner = ownerGuides.filter(
    (g) => g.slug !== featuredOwner?.slug,
  );

  const featuredAdmin =
    adminGuides.find((g) => g.slug === ADMIN_GUIDE_SLUG) ?? adminGuides[0];
  const remainingAdmin = adminGuides.filter(
    (g) => g.slug !== featuredAdmin?.slug,
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      <div className="space-y-10">
        {/* Hero */}
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Guides
          </p>
          <h1 className="font-heading text-4xl font-bold tracking-tight md:text-5xl">
            How CravingsPH works — for customers, owners, and admins
          </h1>
          <p className="text-base leading-7 text-muted-foreground md:text-lg">
            Step-by-step guides for finding restaurants, setting up your venue,
            ordering dine-in, managing operations, and administering the
            platform.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="font-heading">
              <Link href="/search">Find restaurants</Link>
            </Button>
            <Button asChild variant="outline" className="font-heading">
              <Link href="/guides#owner-guides">For restaurant owners</Link>
            </Button>
          </div>
        </div>

        {/* Customer guides */}
        {featuredCustomer ? (
          <FeaturedGuideCard
            guide={featuredCustomer}
            badgeLabel="Featured customer guide"
            tagline="Start here"
            ctaLabel="Read the ordering guide"
            ctaHref="/search"
          />
        ) : null}

        {remainingCustomer.length > 0 ? (
          <section className="space-y-5">
            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                More guides for customers
              </h2>
              <p className="text-sm text-muted-foreground">
                Discover restaurants, search for dishes, and learn how to make
                the most of CravingsPH.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {remainingCustomer.map((guide) => (
                <GuideCard key={guide.slug} guide={guide} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Owner guides */}
        <section id="owner-guides" className="scroll-mt-24 space-y-5">
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Guides for restaurant owners
            </h2>
            <p className="text-sm text-muted-foreground">
              Set up your restaurant, manage orders, and keep operations running
              smoothly.
            </p>
          </div>

          {featuredOwner ? (
            <FeaturedGuideCard
              guide={featuredOwner}
              badgeLabel="Featured owner guide"
              tagline="For owners"
              ctaLabel="Read the setup guide"
              ctaHref="/organization"
            />
          ) : null}

          {remainingOwner.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {remainingOwner.map((guide) => (
                <GuideCard key={guide.slug} guide={guide} />
              ))}
            </div>
          ) : null}
        </section>

        {/* Admin guides */}
        <section id="admin-guides" className="scroll-mt-24 space-y-5">
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Guides for platform admins
            </h2>
            <p className="text-sm text-muted-foreground">
              Monitor the dashboard, manage invitations, and oversee the
              platform.
            </p>
          </div>

          {featuredAdmin ? (
            <FeaturedGuideCard
              guide={featuredAdmin}
              badgeLabel="Featured admin guide"
              tagline="For admins"
              ctaLabel="Read the admin guide"
              ctaHref="/admin"
            />
          ) : null}

          {remainingAdmin.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {remainingAdmin.map((guide) => (
                <GuideCard key={guide.slug} guide={guide} />
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
