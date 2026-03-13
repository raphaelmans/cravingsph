"use client";

import {
  ExternalLink,
  ReceiptText,
  Settings2,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { toast } from "sonner";
import { appRoutes } from "@/common/app-routes";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BranchForm } from "@/features/onboarding/components/branch-form";
import { useOwnerRestaurantManagement } from "@/features/restaurant-management/hooks/use-owner-restaurant-management";

interface BranchPageProps {
  params: Promise<{ restaurantId: string; branchId: string }>;
}

export default function OwnerBranchDetailPage({ params }: BranchPageProps) {
  const { restaurantId, branchId } = use(params);
  const { restaurant, branch, isLoading } = useOwnerRestaurantManagement({
    restaurantId,
    branchId,
  });

  if (isLoading) {
    return (
      <>
        <DashboardNavbar
          breadcrumbs={[
            { label: "Restaurants", href: appRoutes.organization.restaurants },
            { label: "Branches" },
            { label: "Branch" },
          ]}
        />
        <div className="flex-1 space-y-6 p-4 md:p-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_340px]">
            <Skeleton className="h-[520px] rounded-xl" />
            <Skeleton className="h-[360px] rounded-xl" />
          </div>
        </div>
      </>
    );
  }

  if (!restaurant || !branch) {
    return (
      <>
        <DashboardNavbar
          breadcrumbs={[
            { label: "Restaurants", href: appRoutes.organization.restaurants },
            { label: "Branches" },
            { label: "Branch" },
          ]}
        />
        <div className="flex-1 p-4 md:p-6">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Store className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold">Branch not found</p>
                <p className="max-w-md text-sm text-muted-foreground">
                  The selected branch could not be loaded for this restaurant.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href={appRoutes.organization.restaurants}>
                  Back to restaurants
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
        breadcrumbs={[
          { label: "Restaurants", href: appRoutes.organization.restaurants },
          {
            label: restaurant.name,
            href: `/organization/restaurants/${restaurant.id}`,
          },
          {
            label: "Branches",
            href: `/organization/restaurants/${restaurant.id}/branches`,
          },
          { label: branch.name },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link
                href={`/organization/restaurants/${restaurant.id}/branches/${branch.id}/settings`}
              >
                <Settings2 className="size-4" />
                Settings
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
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {branch.name}
            </h1>
            <Badge variant={branch.isActive ? "secondary" : "outline"}>
              {branch.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant={branch.isOrderingEnabled ? "secondary" : "outline"}>
              {branch.isOrderingEnabled ? "Ordering live" : "Ordering paused"}
            </Badge>
          </div>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Update branch identity and contact information here. Menu, order
            operations, and QR settings stay on the linked branch tools.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_340px]">
          <BranchForm
            mode="edit"
            restaurantId={restaurant.id}
            restaurantName={restaurant.name}
            branchId={branch.id}
            initialValues={{
              name: branch.name,
              address: branch.address ?? "",
              street:
                ((branch as Record<string, unknown>).street as string) ?? "",
              barangay:
                ((branch as Record<string, unknown>).barangay as string) ?? "",
              province: branch.province ?? "",
              city: branch.city ?? "",
              phone: branch.phone ?? "",
              amenities:
                ((branch as Record<string, unknown>).amenities as Array<
                  | "air_conditioning"
                  | "parking"
                  | "free_wifi"
                  | "outdoor_seating"
                >) ?? [],
            }}
            title="Branch Details"
            description="Update the branch name, service address, and contact information used by staff and customers."
            submitLabel="Save Branch"
            onComplete={() => {
              toast.success("Branch updated");
            }}
          />

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Branch Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="rounded-xl border bg-muted/30 p-4">
                  <p className="font-medium text-foreground">Location</p>
                  <p>{branch.address || "Address not added"}</p>
                  <p>
                    {branch.city && branch.province
                      ? `${branch.city}, ${branch.province}`
                      : branch.city ||
                        branch.province ||
                        "City and province not added"}
                  </p>
                </div>
                <div className="rounded-xl border bg-muted/30 p-4">
                  <p className="font-medium text-foreground">Ordering policy</p>
                  <p>
                    {branch.autoAcceptOrders
                      ? "Auto-accept enabled"
                      : "Manual review"}
                  </p>
                  <p>
                    {branch.paymentCountdownMinutes} minute payment countdown
                  </p>
                </div>
                <div className="rounded-xl border bg-muted/30 p-4">
                  <p className="font-medium text-foreground">Contact</p>
                  <p>{branch.phone || "Phone not added"}</p>
                  <p>Slug: {branch.slug}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Branch Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  asChild
                >
                  <Link
                    href={`/organization/restaurants/${restaurant.id}/branches/${branch.id}/menu`}
                  >
                    <UtensilsCrossed className="size-4" />
                    Manage menu
                  </Link>
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  asChild
                >
                  <Link
                    href={`/organization/restaurants/${restaurant.id}/branches/${branch.id}/orders`}
                  >
                    <ReceiptText className="size-4" />
                    View orders
                  </Link>
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  asChild
                >
                  <Link
                    href={`/organization/restaurants/${restaurant.id}/branches/${branch.id}/settings`}
                  >
                    <Settings2 className="size-4" />
                    Open branch settings
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
