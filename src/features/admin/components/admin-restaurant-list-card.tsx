"use client";

import {
  ArrowUpRight,
  Building2,
  ShieldCheck,
  Star,
  Store,
} from "lucide-react";
import Link from "next/link";
import { appRoutes } from "@/common/app-routes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AdminRestaurantListItemRecord } from "@/modules/admin/repositories/admin.repository";

interface AdminRestaurantListCardProps {
  restaurant: AdminRestaurantListItemRecord;
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

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AdminRestaurantListCard({
  restaurant,
}: AdminRestaurantListCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg">{restaurant.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {restaurant.organizationName}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Badge variant={restaurant.isActive ? "secondary" : "outline"}>
              {restaurant.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge
              variant={getVerificationBadgeVariant(
                restaurant.verificationStatus,
              )}
            >
              {restaurant.verificationStatus}
            </Badge>
            {restaurant.isFeatured ? <Badge>Featured</Badge> : null}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {restaurant.cuisineType || "Cuisine not set"}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border bg-muted/30 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Building2 className="size-4 text-primary" />
              Organization
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>{restaurant.organizationName}</p>
              <p>{restaurant.ownerEmail || "Owner email not added"}</p>
            </div>
          </div>

          <div className="rounded-xl border bg-muted/30 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Store className="size-4 text-primary" />
              Listing
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>/restaurant/{restaurant.slug}</p>
              <p>{restaurant.phone || restaurant.email || "No contact yet"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
          <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
            <ShieldCheck className="size-4 text-primary" />
            Platform status
          </div>
          Updated {formatDate(restaurant.updatedAt)}. Use the detail page to
          edit profile fields, flag the listing as featured, or disable it.
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href={appRoutes.admin.restaurant(restaurant.id)}>
            Manage listing
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <a
            href={appRoutes.restaurant.bySlug(restaurant.slug)}
            rel="noreferrer"
            target="_blank"
          >
            <ArrowUpRight className="size-4" />
            Preview public page
          </a>
        </Button>
        {restaurant.isFeatured ? (
          <Button disabled size="sm" variant="ghost">
            <Star className="size-4" />
            Featured
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
