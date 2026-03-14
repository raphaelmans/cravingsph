"use client";

import {
  ClipboardList,
  ExternalLink,
  Grid3X3,
  Settings2,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { appRoutes } from "@/common/app-routes";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranchPortal } from "@/features/branch-portal/components/branch-portal-provider";
import { BranchForm } from "@/features/onboarding/components/branch-form";
import { OwnerWalkthroughPanel } from "@/features/onboarding/components/owner-walkthrough-panel";
import { useOwnerRestaurantManagement } from "@/features/restaurant-management/hooks/use-owner-restaurant-management";

export default function BranchPortalOverviewPage() {
  const ctx = useBranchPortal();
  const { restaurant, branch, isLoading } = useOwnerRestaurantManagement({
    restaurantId: ctx.restaurantId,
    branchId: ctx.branchId,
  });

  if (isLoading) {
    return (
      <>
        <DashboardNavbar breadcrumbs={[{ label: "Overview" }]} />
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
        <DashboardNavbar breadcrumbs={[{ label: "Overview" }]} />
        <div className="flex-1 p-4 md:p-6">
          <p className="text-sm text-muted-foreground">
            Branch data could not be loaded.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNavbar
        breadcrumbs={[{ label: "Overview" }]}
        actions={
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
        }
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        <AppPageHeader
          eyebrow="Branch overview"
          title={branch.name}
          description="Edit branch identity and contact details."
          icon={<Store className="size-5" />}
          actions={
            <div className="flex flex-wrap gap-2">
              <Badge variant={branch.isActive ? "secondary" : "outline"}>
                {branch.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge
                variant={branch.isOrderingEnabled ? "secondary" : "outline"}
              >
                {branch.isOrderingEnabled ? "Ordering live" : "Ordering paused"}
              </Badge>
            </div>
          }
        />

        <OwnerWalkthroughPanel
          flowId="owner-branch-overview"
          title="Use the branch overview as your local control hub"
          description="Branch identity, snapshot, and tools in one place."
          steps={[
            {
              title: "Keep branch identity accurate",
              description:
                "Address and contact info affect staff and customers alike.",
            },
            {
              title: "Use the snapshot for quick health checks",
              description:
                "The side panel summarizes location and ordering policy.",
            },
            {
              title: "Branch tools are the real daily workflow",
              description:
                "Jump into menu, orders, tables, or settings from here.",
            },
          ]}
        />

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
                <div className="rounded-3xl border bg-muted/30 p-4">
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
                <div className="rounded-3xl border bg-muted/30 p-4">
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
                <div className="rounded-3xl border bg-muted/30 p-4">
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
                  <Link href={appRoutes.branchPortal.menu(ctx.portalSlug)}>
                    <UtensilsCrossed className="size-4" />
                    Manage menu
                  </Link>
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  asChild
                >
                  <Link href={appRoutes.branchPortal.orders(ctx.portalSlug)}>
                    <ClipboardList className="size-4" />
                    View orders
                  </Link>
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  asChild
                >
                  <Link href={appRoutes.branchPortal.tables(ctx.portalSlug)}>
                    <Grid3X3 className="size-4" />
                    Manage tables
                  </Link>
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  asChild
                >
                  <Link href={appRoutes.branchPortal.settings(ctx.portalSlug)}>
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
