"use client";

import { Building2, CircleCheckBig, PlusCircle, Store } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { appRoutes } from "@/common/app-routes";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Store className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold">
                  Finish organization setup first
                </p>
                <p className="max-w-md text-sm text-muted-foreground">
                  Restaurant management becomes available after the owner
                  organization is created.
                </p>
              </div>
              <Button asChild>
                <Link href={appRoutes.organization.getStarted}>
                  Go to setup hub
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNavbar
        breadcrumbs={[{ label: "Restaurants" }]}
        actions={
          <Button variant="outline" asChild>
            <Link href={appRoutes.organization.verify}>
              Review verification
            </Link>
          </Button>
        }
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Restaurant Workspace
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Create restaurant brands, update their public profile, and drill
            into branches for menus, orders, and branch-level settings.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Store className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Restaurants
                </p>
                <p className="text-2xl font-semibold">{restaurants.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Building2 className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active listings
                </p>
                <p className="text-2xl font-semibold">{activeRestaurants}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CircleCheckBig className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Verification approved
                </p>
                <p className="text-2xl font-semibold">{approvedRestaurants}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
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
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
                  <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <PlusCircle className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold">No restaurants yet</p>
                    <p className="max-w-md text-sm text-muted-foreground">
                      Add the first restaurant brand for this organization, then
                      attach one or more branches under it.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </section>

          <div className="xl:sticky xl:top-6 xl:self-start">
            <RestaurantForm
              organizationId={organization.id}
              title="Add Restaurant"
              description="Create a new restaurant brand before adding branches, menus, and staff workflows."
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
