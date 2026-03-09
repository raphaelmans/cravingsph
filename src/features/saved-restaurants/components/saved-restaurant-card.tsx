"use client";

import {
  ArrowUpRight,
  BookmarkX,
  Clock3,
  MapPin,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { appRoutes } from "@/common/app-routes";
import { Price } from "@/components/brand/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { SavedRestaurantRecord } from "../hooks/use-saved-restaurants";

interface SavedRestaurantCardProps {
  restaurant: SavedRestaurantRecord;
  onUnsave: () => void;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not ordered yet";
  }

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function SavedRestaurantCard({
  restaurant,
  onUnsave,
}: SavedRestaurantCardProps) {
  return (
    <Card className="overflow-hidden border-primary/10 bg-background/95 shadow-sm">
      <CardHeader className="gap-4 border-b border-primary/10 bg-linear-to-br from-primary/12 via-background to-background">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-full border-primary/20 bg-background/90 text-primary"
              >
                <Sparkles className="size-3.5" />
                Saved
              </Badge>
              <span className="text-sm text-muted-foreground">
                Added {formatDate(restaurant.savedAt)}
              </span>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold">
                {restaurant.name}
              </h2>
              <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 text-primary" />
                {restaurant.locationLabel}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            shape="pill"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={onUnsave}
            aria-label={`Remove ${restaurant.name} from saved restaurants`}
          >
            <BookmarkX className="size-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {restaurant.cuisineTypes.map((cuisine) => (
            <Badge
              key={`${restaurant.slug}-${cuisine}`}
              variant="secondary"
              className="rounded-full px-2.5 py-1"
            >
              {cuisine}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] border border-primary/10 bg-primary/[0.06] p-4">
            <p className="text-sm text-muted-foreground">Typical spend</p>
            <Price
              amount={restaurant.averageTicketAmount}
              className="mt-2 text-lg"
            />
          </div>
          <div className="rounded-[24px] border border-primary/10 bg-background p-4">
            <p className="text-sm text-muted-foreground">Delivery window</p>
            <p className="mt-2 inline-flex items-center gap-2 font-medium">
              <Clock3 className="size-4 text-primary" />
              {restaurant.deliveryWindow}
            </p>
          </div>
          <div className="rounded-[24px] border border-primary/10 bg-background p-4">
            <p className="text-sm text-muted-foreground">Last ordered</p>
            <p className="mt-2 font-medium">
              {formatDate(restaurant.lastOrderedAt)}
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-dashed border-primary/20 bg-muted/20 p-4">
          <p className="text-sm font-medium text-foreground">
            Why you saved it
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {restaurant.note}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Go-to dishes</p>
          <div className="flex flex-wrap gap-2">
            {restaurant.popularItems.map((item) => (
              <span
                key={`${restaurant.slug}-${item}`}
                className="rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 border-t border-primary/10 bg-muted/20 sm:flex-row">
        <Button asChild shape="pill" className="w-full sm:flex-1">
          <Link href={appRoutes.restaurant.bySlug(restaurant.slug)}>
            View menu
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
        <Button
          type="button"
          shape="pill"
          variant="outline"
          className="w-full sm:flex-1"
          onClick={onUnsave}
        >
          <BookmarkX className="size-4" />
          Unsave
        </Button>
      </CardFooter>
    </Card>
  );
}
