"use client";

import {
  ArrowUpRight,
  Building2,
  Mail,
  ShieldCheck,
  Star,
  Store,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { appRoutes } from "@/common/app-routes";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useAdminRestaurant,
  useAdminRestaurantUpdate,
} from "../hooks/use-admin-restaurants";
import { AdminRestaurantProfileForm } from "./admin-restaurant-profile-form";

interface AdminRestaurantDetailPageProps {
  restaurantId: string;
}

function getVerificationBadgeVariant(status: string) {
  switch (status) {
    case "approved":
      return "secondary";
    case "rejected":
      return "destructive";
    default:
      return "outline";
  }
}

function formatDateTime(value: Date | string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AdminRestaurantDetailPage({
  restaurantId,
}: AdminRestaurantDetailPageProps) {
  const { data, isLoading } = useAdminRestaurant(restaurantId);
  const updateRestaurant = useAdminRestaurantUpdate();

  async function handleToggle(
    field: "isFeatured" | "isActive",
    value: boolean,
  ) {
    if (!data) {
      return;
    }

    try {
      await updateRestaurant.mutateAsync({
        id: data.id,
        [field]: value,
      });

      toast.success(
        field === "isFeatured"
          ? value
            ? `${data.name} marked as featured`
            : `${data.name} removed from featured`
          : value
            ? `${data.name} reactivated`
            : `${data.name} deactivated`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update restaurant",
      );
    }
  }

  if (isLoading) {
    return (
      <>
        <DashboardNavbar
          breadcrumbs={[
            { label: "Admin", href: appRoutes.admin.base },
            { label: "Restaurants", href: appRoutes.admin.restaurants },
            { label: "Restaurant" },
          ]}
        />

        <div className="flex-1 space-y-6 p-4 md:p-6">
          <Skeleton className="h-10 w-72" />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_340px]">
            <Skeleton className="h-[34rem] rounded-xl" />
            <Skeleton className="h-[28rem] rounded-xl" />
          </div>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <DashboardNavbar
          breadcrumbs={[
            { label: "Admin", href: appRoutes.admin.base },
            { label: "Restaurants", href: appRoutes.admin.restaurants },
            { label: "Restaurant" },
          ]}
        />

        <div className="flex-1 p-4 md:p-6">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Store className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold">Restaurant not found</p>
                <p className="max-w-md text-sm text-muted-foreground">
                  This admin record is no longer available.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href={appRoutes.admin.restaurants}>
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
          { label: "Admin", href: appRoutes.admin.base },
          { label: "Restaurants", href: appRoutes.admin.restaurants },
          { label: data.name },
        ]}
        actions={
          <Button asChild variant="outline">
            <a
              href={appRoutes.restaurant.bySlug(data.slug)}
              rel="noreferrer"
              target="_blank"
            >
              Preview public page
              <ArrowUpRight className="size-4" />
            </a>
          </Button>
        }
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{data.name}</h1>
            <Badge variant={data.isActive ? "secondary" : "outline"}>
              {data.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge
              variant={getVerificationBadgeVariant(data.verificationStatus)}
            >
              {data.verificationStatus}
            </Badge>
            {data.isFeatured ? <Badge>Featured</Badge> : null}
          </div>

          <p className="max-w-3xl text-sm text-muted-foreground">
            Admin control over the restaurant record. Update profile content,
            inspect organization ownership, and adjust listing visibility.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_340px]">
          <AdminRestaurantProfileForm restaurant={data} />

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform controls</CardTitle>
                <CardDescription>
                  These toggles affect platform merchandising and listing
                  availability immediately.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-4 rounded-xl border bg-muted/20 p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-medium">
                      <Star className="size-4 text-primary" />
                      Featured listing
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Surface this restaurant more prominently in platform
                      merchandising.
                    </p>
                  </div>
                  <Switch
                    checked={data.isFeatured}
                    disabled={updateRestaurant.isPending}
                    onCheckedChange={(checked) =>
                      handleToggle("isFeatured", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl border bg-muted/20 p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-medium">
                      <ShieldCheck className="size-4 text-primary" />
                      Restaurant active
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Deactivating removes the listing from normal operations
                      without deleting the record.
                    </p>
                  </div>
                  <Switch
                    checked={data.isActive}
                    disabled={updateRestaurant.isPending}
                    onCheckedChange={(checked) =>
                      handleToggle("isActive", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Record snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                    <Building2 className="size-4 text-primary" />
                    Organization
                  </div>
                  <p>{data.organizationName}</p>
                  <p>{data.branchCount} branch records</p>
                </div>

                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                    <UserRound className="size-4 text-primary" />
                    Owner
                  </div>
                  <p>{data.ownerName || "Owner profile incomplete"}</p>
                  <p>{data.ownerEmail || "Owner email not added"}</p>
                </div>

                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                    <Mail className="size-4 text-primary" />
                    Listing
                  </div>
                  <p>/restaurant/{data.slug}</p>
                  <p>{data.email || data.phone || "No contact info"}</p>
                </div>

                <div className="rounded-xl border border-dashed p-4">
                  Last synced {formatDateTime(data.updatedAt)}.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
