"use client";

import {
  ArrowRight,
  Check,
  ClipboardList,
  Clock,
  MapPin,
  Plus,
  Rocket,
  ShoppingBag,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { appRoutes } from "@/common/app-routes";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useOnboardingStatus } from "@/features/onboarding/hooks/use-onboarding-status";
import {
  useOrganization,
  useRestaurants,
} from "@/features/owner/hooks/use-owner-sidebar-data";

// ---------------------------------------------------------------------------
// Stat card component
// ---------------------------------------------------------------------------

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-1">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Quick link component
// ---------------------------------------------------------------------------

function QuickLink({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link href={href}>
      <Card className="group transition-colors hover:bg-accent active:bg-accent">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {description}
            </p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </CardContent>
      </Card>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Quick links config
// ---------------------------------------------------------------------------

const quickLinks = [
  {
    title: "Add Restaurant",
    description: "Register a new restaurant to your organization",
    href: "/organization/restaurants",
    icon: Plus,
  },
  {
    title: "Manage Menu",
    description: "Update items, categories, and pricing",
    href: "/organization/restaurants",
    icon: UtensilsCrossed,
  },
  {
    title: "Set Operating Hours",
    description: "Configure when your branches accept orders",
    href: "/organization/restaurants",
    icon: Clock,
  },
];

// ---------------------------------------------------------------------------
// Dashboard page
// ---------------------------------------------------------------------------

function SetupChecklist() {
  const { steps, completedCount, totalSteps, isLoading, allComplete } =
    useOnboardingStatus();

  if (isLoading || allComplete) return null;

  const requiredSteps = steps.filter((s) => s.id !== 5);
  const progressPercent = Math.round((completedCount / (totalSteps - 1)) * 100);

  return (
    <Card className="border-primary/20 bg-primary/[0.03]">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Rocket className="size-5 text-primary" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-semibold">Complete your setup</h3>
              <p className="text-sm text-muted-foreground">
                Finish these steps to start accepting orders.
              </p>
            </div>

            <Progress value={progressPercent} className="h-2" />

            <div className="grid gap-2 sm:grid-cols-2">
              {requiredSteps.map((step) => (
                <Link key={step.id} href={step.href}>
                  <div className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-accent/50">
                    {step.status === "complete" ? (
                      <Check className="size-4 text-success" />
                    ) : (
                      <span className="size-4 rounded-full border-2 border-muted-foreground/30" />
                    )}
                    <span
                      className={
                        step.status === "complete"
                          ? "text-muted-foreground line-through"
                          : "font-medium"
                      }
                    >
                      {step.title}
                    </span>
                    {step.status === "in-progress" && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Next
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <Button asChild size="sm">
              <Link href={appRoutes.organization.getStarted}>
                Continue Setup
                <ArrowRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OwnerDashboardPage() {
  const { data: organization, isLoading: orgLoading } = useOrganization();
  const { data: restaurants = [], isLoading: restaurantsLoading } =
    useRestaurants(organization?.id);

  const isLoading = orgLoading || restaurantsLoading;

  // Derive branch count from loaded restaurants
  // TODO: wire to actual branch count once we have a dedicated query
  const branchCount = restaurants.length;

  return (
    <>
      <DashboardNavbar breadcrumbs={[{ label: "Dashboard" }]} />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        {/* Welcome header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {orgLoading ? (
              <Skeleton className="h-8 w-48 inline-block" />
            ) : (
              `Welcome back${organization?.name ? `, ${organization.name}` : ""}`
            )}
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your organization.
          </p>
        </div>

        {/* Setup checklist for incomplete onboarding */}
        <SetupChecklist />

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Orders Today"
            value="--"
            description="Awaiting backend integration"
            icon={ShoppingBag}
            isLoading={isLoading}
          />
          <StatCard
            title="Pending Orders"
            value="--"
            description="Awaiting backend integration"
            icon={ClipboardList}
            isLoading={isLoading}
          />
          <StatCard
            title="Active Locations"
            value={String(branchCount)}
            description={`${restaurants.length} restaurant${restaurants.length !== 1 ? "s" : ""} registered`}
            icon={MapPin}
            isLoading={isLoading}
          />
          <StatCard
            title="Revenue Today"
            value="--"
            description="Awaiting backend integration"
            icon={TrendingUp}
            isLoading={isLoading}
          />
        </div>

        {/* Quick links */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((link) => (
              <QuickLink key={link.title} {...link} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
