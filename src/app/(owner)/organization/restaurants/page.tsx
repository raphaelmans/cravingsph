"use client";

import { Building2, CircleCheckBig, PlusCircle, Store } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { appRoutes } from "@/common/app-routes";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { AppEmptyState } from "@/components/ui/app-empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OwnerWalkthroughPanel } from "@/features/onboarding/components/owner-walkthrough-panel";
import { RestaurantForm } from "@/features/onboarding/components/restaurant-form";
import { RestaurantOverviewCard } from "@/features/restaurant-management/components/restaurant-overview-card";
import { useOwnerRestaurantManagement } from "@/features/restaurant-management/hooks/use-owner-restaurant-management";

export default function OwnerRestaurantsPage() {
  const { organization, restaurants, isLoading } =
    useOwnerRestaurantManagement();

  const activeRestaurants = restaurants.filter(
    (restaurant) => restaurant.isActive,
  ).length;
  const approvedRestaurants = restaurants.filter(
    (restaurant) => restaurant.verificationStatus === "approved",
  ).length;

  if (isLoading) {
    return (
      <>
        <DashboardNavbar breadcrumbs={[{ label: "Restaurants" }]} />
        <div className="flex-1 space-y-6 p-4 md:p-6">
          <Skeleton className="h-8 w-56" />
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

  if (!organization) {
    return (
      <>
        <DashboardNavbar breadcrumbs={[{ label: "Restaurants" }]} />
        <div className="flex-1 p-4 md:p-6">
          <AppEmptyState
            tone="subtle"
            icon={<Store />}
            title="Finish organization setup first"
            description="Restaurant management becomes available after the owner organization is created."
            primaryAction={
              <Button asChild shape="pill">
                <Link href={appRoutes.organization.getStarted}>
                  Go to setup hub
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
      <DashboardNavbar breadcrumbs={[{ label: "Restaurants" }]} />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        <AppPageHeader
          eyebrow="Owner operations"
          title="Restaurant workspace"
          description="Manage brands, branches, and menus."
          icon={<Store className="size-5" />}
        />

        <OwnerWalkthroughPanel
          flowId="owner-restaurants"
          title="Manage brands before locations"
          description="Create a restaurant, then add branches."
          steps={[
            {
              title: "Create the brand first",
              description:
                "Branches, menus, and listings depend on a restaurant record.",
            },
            {
              title: "Use the cards to inspect readiness",
              description:
                "Badges show whether a restaurant is active and approved.",
            },
            {
              title: "Go one level deeper for branches",
              description:
                "Open branch management for locations, menus, and tables.",
            },
          ]}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-3xl border-border/70 bg-background/95">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Store className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Restaurants
                </p>
                <p className="font-heading text-3xl font-semibold tracking-tight">
                  {restaurants.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/70 bg-background/95">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Building2 className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active listings
                </p>
                <p className="font-heading text-3xl font-semibold tracking-tight">
                  {activeRestaurants}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/70 bg-background/95">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CircleCheckBig className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Verification approved
                </p>
                <p className="font-heading text-3xl font-semibold tracking-tight">
                  {approvedRestaurants}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Your restaurants</h2>
                <p className="text-sm text-muted-foreground">
                  Each restaurant represents a brand. Branches live one level
                  deeper.
                </p>
              </div>
            </div>

            {restaurants.length > 0 ? (
              <div className="grid gap-4">
                {restaurants.map((restaurant) => (
                  <RestaurantOverviewCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    editHref={`/organization/restaurants/${restaurant.id}`}
                    branchesHref={`/organization/restaurants/${restaurant.id}/branches`}
                    publicHref={appRoutes.restaurant.bySlug(restaurant.slug)}
                  />
                ))}
              </div>
            ) : (
              <AppEmptyState
                tone="subtle"
                icon={<PlusCircle />}
                title="No restaurants yet"
                description="Create your first restaurant to get started."
              />
            )}
          </section>

          <div className="xl:sticky xl:top-6 xl:self-start">
            <RestaurantForm
              organizationId={organization.id}
              title="Add Restaurant"
              description="Add a new restaurant brand."
              onComplete={() => {
                toast.success("Restaurant added");
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
