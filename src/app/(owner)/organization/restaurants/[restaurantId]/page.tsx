"use client";

import { ExternalLink, Store, Waypoints } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { toast } from "sonner";
import { appRoutes } from "@/common/app-routes";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { AppEmptyState } from "@/components/ui/app-empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RestaurantForm } from "@/features/onboarding/components/restaurant-form";
import { useOwnerRestaurantManagement } from "@/features/restaurant-management/hooks/use-owner-restaurant-management";

interface RestaurantPageProps {
  params: Promise<{ restaurantId: string }>;
}

export default function OwnerRestaurantDetailPage({
  params,
}: RestaurantPageProps) {
  const { restaurantId } = use(params);
  const { organization, restaurant, branches, isLoading } =
    useOwnerRestaurantManagement({
      restaurantId,
    });

  if (isLoading) {
    return (
      <>
        <DashboardNavbar
          breadcrumbs={[
            { label: "Restaurants", href: appRoutes.organization.restaurants },
            { label: "Restaurant" },
          ]}
        />
        <div className="flex-1 space-y-6 p-4 md:p-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_340px]">
            <Skeleton className="h-[520px] rounded-xl" />
            <Skeleton className="h-[320px] rounded-xl" />
          </div>
        </div>
      </>
    );
  }

  if (!organization || !restaurant) {
    return (
      <>
        <DashboardNavbar
          breadcrumbs={[
            { label: "Restaurants", href: appRoutes.organization.restaurants },
            { label: "Restaurant" },
          ]}
        />
        <div className="flex-1 p-4 md:p-6">
          <AppEmptyState
            tone="subtle"
            icon={<Store />}
            title="Restaurant not found"
            description="The selected restaurant could not be loaded for this organization."
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
          { label: restaurant.name },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link
                href={`/organization/restaurants/${restaurant.id}/branches`}
              >
                <Waypoints className="size-4" />
                View Branches
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a
                href={appRoutes.restaurant.bySlug(restaurant.slug)}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="size-4" />
                Public Page
              </a>
            </Button>
          </div>
        }
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        <AppPageHeader
          eyebrow="Restaurant record"
          title={restaurant.name}
          description="Edit the brand profile and manage branches."
          icon={<Store className="size-5" />}
          actions={
            <div className="flex flex-wrap gap-2">
              <Badge variant={restaurant.isActive ? "secondary" : "outline"}>
                {restaurant.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge
                variant={
                  restaurant.verificationStatus === "approved"
                    ? "secondary"
                    : "outline"
                }
              >
                {restaurant.verificationStatus}
              </Badge>
            </div>
          }
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_340px]">
          <RestaurantForm
            mode="edit"
            organizationId={organization.id}
            restaurantId={restaurant.id}
            initialValues={{
              name: restaurant.name,
              description: restaurant.description ?? "",
              cuisineType: restaurant.cuisineType ?? "",
              phone: restaurant.phone ?? "",
              email: restaurant.email ?? "",
            }}
            title="Restaurant Details"
            description="Update your restaurant's public profile."
            submitLabel="Save Restaurant"
            onComplete={() => {
              toast.success("Restaurant updated");
            }}
          />

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Restaurant Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="rounded-3xl border bg-muted/30 p-4">
                  <p className="font-medium text-foreground">Customer URL</p>
                  <p>/restaurant/{restaurant.slug}</p>
                </div>
                <div className="rounded-3xl border bg-muted/30 p-4">
                  <p className="font-medium text-foreground">Branches</p>
                  <p>
                    {branches.length} configured branch
                    {branches.length === 1 ? "" : "es"}
                  </p>
                </div>
                <div className="rounded-3xl border bg-muted/30 p-4">
                  <p className="font-medium text-foreground">Contact</p>
                  <p>{restaurant.phone || "Phone not added"}</p>
                  <p>{restaurant.email || "Email not added"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Next Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  asChild
                >
                  <Link
                    href={`/organization/restaurants/${restaurant.id}/branches`}
                  >
                    <Waypoints className="size-4" />
                    Manage branches
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
