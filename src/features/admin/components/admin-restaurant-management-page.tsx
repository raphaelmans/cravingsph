"use client";

import { CircleCheckBig, ShieldAlert, Star, Store } from "lucide-react";
import { useMemo, useState } from "react";
import { appRoutes } from "@/common/app-routes";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type AdminRestaurantFilter,
  filterAdminRestaurants,
  useAdminRestaurants,
} from "../hooks/use-admin-restaurants";
import { AdminRestaurantListCard } from "./admin-restaurant-list-card";

const FILTER_LABELS: Record<AdminRestaurantFilter, string> = {
  all: "All restaurants",
  pending: "Pending verification",
  approved: "Approved",
  rejected: "Rejected",
  featured: "Featured",
  active: "Active",
  inactive: "Inactive",
};

export function AdminRestaurantManagementPage() {
  const { data = [], isLoading } = useAdminRestaurants();
  const [filter, setFilter] = useState<AdminRestaurantFilter>("all");

  const filteredRestaurants = useMemo(
    () => filterAdminRestaurants(data, filter),
    [data, filter],
  );

  const activeCount = data.filter((restaurant) => restaurant.isActive).length;
  const featuredCount = data.filter(
    (restaurant) => restaurant.isFeatured,
  ).length;
  const pendingCount = data.filter(
    (restaurant) => restaurant.verificationStatus === "pending",
  ).length;

  return (
    <>
      <DashboardNavbar
        breadcrumbs={[
          { label: "Admin", href: appRoutes.admin.base },
          { label: "Restaurants" },
        ]}
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Restaurant management
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Review all restaurant listings, filter by platform status, and open
            a record to edit profile fields or adjust featured and active
            visibility.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Store className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Restaurants
                </p>
                <p className="text-2xl font-semibold">
                  {isLoading ? "--" : data.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CircleCheckBig className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active listings
                </p>
                <p className="text-2xl font-semibold">
                  {isLoading ? "--" : activeCount}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Star className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Featured
                </p>
                <p className="text-2xl font-semibold">
                  {isLoading ? "--" : featuredCount}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldAlert className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending review
                </p>
                <p className="text-2xl font-semibold">
                  {isLoading ? "--" : pendingCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Filter listings</p>
            <p className="text-sm text-muted-foreground">
              Narrow the queue by verification state or platform visibility.
            </p>
          </div>

          <Select
            onValueChange={(value) => setFilter(value as AdminRestaurantFilter)}
            value={filter}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filter restaurants" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FILTER_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-56 rounded-xl" />
            <Skeleton className="h-56 rounded-xl" />
            <Skeleton className="h-56 rounded-xl" />
          </div>
        ) : null}

        {!isLoading && filteredRestaurants.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center text-sm text-muted-foreground">
              No restaurants match the {FILTER_LABELS[filter].toLowerCase()}{" "}
              filter right now.
            </CardContent>
          </Card>
        ) : null}

        {!isLoading ? (
          <div className="grid gap-4">
            {filteredRestaurants.map((restaurant) => (
              <AdminRestaurantListCard
                key={restaurant.id}
                restaurant={restaurant}
              />
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
