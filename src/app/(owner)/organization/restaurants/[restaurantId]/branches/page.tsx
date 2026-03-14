"use client";

import { CheckCircle2, PlusCircle, Store, Waypoints, Zap } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { toast } from "sonner";
import { appRoutes } from "@/common/app-routes";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { AppEmptyState } from "@/components/ui/app-empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BranchForm } from "@/features/onboarding/components/branch-form";
import { OwnerWalkthroughPanel } from "@/features/onboarding/components/owner-walkthrough-panel";
import { BranchOverviewCard } from "@/features/restaurant-management/components/branch-overview-card";
import { useOwnerRestaurantManagement } from "@/features/restaurant-management/hooks/use-owner-restaurant-management";

interface BranchesPageProps {
  params: Promise<{ restaurantId: string }>;
}

export default function OwnerRestaurantBranchesPage({
  params,
}: BranchesPageProps) {
  const { restaurantId } = use(params);
  const { restaurant, branches, isLoading } = useOwnerRestaurantManagement({
    restaurantId,
  });

  const liveOrderingCount = branches.filter(
    (branch) => branch.isOrderingEnabled,
  ).length;
  const autoAcceptCount = branches.filter(
    (branch) => branch.autoAcceptOrders,
  ).length;

  if (isLoading) {
    return (
      <>
        <DashboardNavbar
          breadcrumbs={[
            { label: "Restaurants", href: appRoutes.organization.restaurants },
            { label: "Branches" },
          ]}
        />
        <div className="flex-1 space-y-6 p-4 md:p-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
            <Skeleton className="h-[520px] rounded-xl" />
            <Skeleton className="h-[520px] rounded-xl" />
          </div>
        </div>
      </>
    );
  }

  if (!restaurant) {
    return (
      <>
        <DashboardNavbar
          breadcrumbs={[
            { label: "Restaurants", href: appRoutes.organization.restaurants },
            { label: "Branches" },
          ]}
        />
        <div className="flex-1 p-4 md:p-6">
          <AppEmptyState
            tone="subtle"
            icon={<Waypoints />}
            title="Restaurant not found"
            description="Choose a valid restaurant before managing its branches."
            primaryAction={
              <Button variant="outline" shape="pill" asChild>
                <Link href={appRoutes.organization.restaurants}>
                  Back to restaurants
                </Link>
              </Button>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNavbar
        breadcrumbs={[
          { label: "Restaurants", href: appRoutes.organization.restaurants },
          {
            label: restaurant.name,
            href: `/organization/restaurants/${restaurant.id}`,
          },
          { label: "Branches" },
        ]}
        actions={
          <Button variant="outline" asChild>
            <Link href={`/organization/restaurants/${restaurant.id}`}>
              <Store className="size-4" />
              Restaurant Profile
            </Link>
          </Button>
        }
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        <AppPageHeader
          eyebrow="Branch directory"
          title={`${restaurant.name} branches`}
          description="Manage menus, orders, tables, and settings per branch."
          icon={<Waypoints className="size-5" />}
        />

        <OwnerWalkthroughPanel
          flowId="owner-branch-directory"
          title="Organize locations before operations"
          description="Turn brand-level setup into branch operations."
          steps={[
            {
              title: "Start with the branch list",
              description:
                "Confirm each location's readiness before diving into setup.",
            },
            {
              title: "Read the branch health summary",
              description:
                "Stat cards show live and auto-accept counts at a glance.",
            },
            {
              title: "Add new locations from the side panel",
              description:
                "Create a branch, then finish its settings and QR setup.",
            },
          ]}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-3xl border-border/70 bg-background/95">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Waypoints className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Branches
                </p>
                <p className="font-heading text-3xl font-semibold tracking-tight">
                  {branches.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/70 bg-background/95">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Zap className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ordering live
                </p>
                <p className="font-heading text-3xl font-semibold tracking-tight">
                  {liveOrderingCount}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/70 bg-background/95">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Auto-accept enabled
                </p>
                <p className="font-heading text-3xl font-semibold tracking-tight">
                  {autoAcceptCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Branch directory</h2>
              <p className="text-sm text-muted-foreground">
                Each branch has its own menu, order inbox, QR materials, and
                operating rules.
              </p>
            </div>

            {branches.length > 0 ? (
              <div className="grid gap-4">
                {branches.map((branch) => (
                  <BranchOverviewCard
                    key={branch.id}
                    restaurantSlug={restaurant.slug}
                    branch={branch}
                    editHref={`/organization/restaurants/${restaurant.id}/branches/${branch.id}`}
                    settingsHref={`/organization/restaurants/${restaurant.id}/branches/${branch.id}/settings`}
                    menuHref={`/organization/restaurants/${restaurant.id}/branches/${branch.id}/menu`}
                    ordersHref={`/organization/restaurants/${restaurant.id}/branches/${branch.id}/orders`}
                  />
                ))}
              </div>
            ) : (
              <AppEmptyState
                tone="subtle"
                icon={<PlusCircle />}
                title="No branches added yet"
                description="Start with the first physical location for this restaurant. You can add more branches later."
              />
            )}
          </section>

          <div className="xl:sticky xl:top-6 xl:self-start">
            <BranchForm
              restaurantId={restaurant.id}
              restaurantName={restaurant.name}
              title="Add Branch"
              description="Create a branch location so you can configure menus, order acceptance, and QR setup."
              onComplete={() => {
                toast.success("Branch added");
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
