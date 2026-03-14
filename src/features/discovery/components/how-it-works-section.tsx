import { ArrowRight, ScanLine, ShoppingBag, Store } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: ShoppingBag,
    eyebrow: "1. Browse",
    title: "Start with food, not friction",
    description:
      "Search by craving, compare nearby spots, and open the menu before you commit.",
    href: "/search",
    cta: "Browse restaurants",
  },
  {
    icon: ScanLine,
    eyebrow: "2. Scan",
    title: "Use table QR when you are already seated",
    description:
      "The same product switches into dine-in mode once you scan the branch QR at the venue.",
    href: "/guides/dine-in-guide",
    cta: "See dine-in flow",
  },
  {
    icon: Store,
    eyebrow: "3. Run",
    title: "Restaurants keep the service side clean",
    description:
      "Menus, orders, tables, and branch settings stay connected on the owner side instead of living in separate tools.",
    href: "/guides/owner-setup-guide",
    cta: "See owner setup",
  },
];

export function HowItWorksSection() {
  return (
    <section
      data-slot="how-it-works"
      className="mx-auto max-w-6xl px-4 py-8 md:py-10"
    >
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
          Journey fit
        </p>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-2">
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance md:text-3xl">
              One experience from discovery to table, with the restaurant side
              keeping up behind it.
            </h2>
            <p className="text-sm leading-7 text-muted-foreground md:text-base">
              The customer journey should feel smooth in front. The platform
              value is that the operational side behind it stays equally clear.
            </p>
          </div>
          <Button asChild variant="outline" shape="pill">
            <Link href="/guides">
              Explore guides
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {steps.map((step) => (
          <article
            key={step.title}
            className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <step.icon className="size-5" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                  {step.eyebrow}
                </p>
                <h3 className="font-heading text-xl font-semibold tracking-tight text-balance">
                  {step.title}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </div>
              <Button asChild variant="ghost" shape="pill" className="-ml-3">
                <Link href={step.href}>
                  {step.cta}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
