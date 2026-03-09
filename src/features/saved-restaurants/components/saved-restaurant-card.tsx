"use client";

import { ArrowUpRight, BookmarkX, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { appRoutes } from "@/common/app-routes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { SavedRestaurantDTO } from "@/modules/saved-restaurant/dtos/saved-restaurant.dto";

interface SavedRestaurantCardProps {
  restaurant: SavedRestaurantDTO;
  onUnsave: () => void;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Unknown";
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
              {restaurant.locationLabel && (
                <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4 text-primary" />
                  {restaurant.locationLabel}
                </p>
              )}
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
        {restaurant.note && (
          <div className="rounded-[28px] border border-dashed border-primary/20 bg-muted/20 p-4">
            <p className="text-sm font-medium text-foreground">
              Why you saved it
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {restaurant.note}
            </p>
          </div>
        )}

        {restaurant.popularItems.length > 0 && (
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
        )}
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
