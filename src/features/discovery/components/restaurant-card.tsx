import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export interface RestaurantPreview {
  slug: string;
  name: string;
  coverImageUrl: string | null;
  logoUrl: string | null;
  cuisineTypes: string[];
  popularItems: string[];
}

interface RestaurantCardProps {
  restaurant: RestaurantPreview;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Card
      data-slot="restaurant-card"
      className="overflow-hidden border-0 shadow-sm"
    >
      <Link
        href={`/restaurant/${restaurant.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {/* Cover image */}
        <div className="relative h-32 w-full bg-muted">
          {restaurant.coverImageUrl ? (
            <Image
              src={restaurant.coverImageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 75vw, 300px"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-3xl text-muted-foreground/40">
                {restaurant.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Logo overlay */}
          {restaurant.logoUrl && (
            <div className="absolute -bottom-4 left-3 size-10 overflow-hidden rounded-full border-2 border-background bg-background">
              <Image
                src={restaurant.logoUrl}
                alt={restaurant.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1.5 p-3 pt-2">
          <h3
            className={`text-sm font-semibold leading-tight ${restaurant.logoUrl ? "mt-2" : ""}`}
          >
            {restaurant.name}
          </h3>

          {/* Cuisine tags */}
          {restaurant.cuisineTypes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {restaurant.cuisineTypes.map((cuisine) => (
                <Badge
                  key={cuisine}
                  variant="secondary"
                  className="text-[10px] font-normal px-1.5 py-0"
                >
                  {cuisine}
                </Badge>
              ))}
            </div>
          )}

          {/* Popular items preview */}
          {restaurant.popularItems.length > 0 && (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {restaurant.popularItems.join(" \u00b7 ")}
            </p>
          )}
        </div>
      </Link>
    </Card>
  );
}
