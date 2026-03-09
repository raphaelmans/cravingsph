import { MapPin } from "lucide-react";
import Image from "next/image";
import { CoverImage } from "@/components/brand/cover-image";
import { CopyContactButton } from "./copy-contact-button";

interface RestaurantHeaderProps {
  restaurant: {
    name: string;
    logoUrl: string | null;
    coverUrl: string | null;
    cuisineType: string | null;
    phone: string | null;
  };
  branchAddress?: string | null;
}

export function RestaurantHeader({
  restaurant,
  branchAddress,
}: RestaurantHeaderProps) {
  return (
    <header data-slot="restaurant-header">
      {/* Cover image */}
      {restaurant.coverUrl ? (
        <CoverImage
          src={restaurant.coverUrl}
          alt={`${restaurant.name} cover`}
          priority
        />
      ) : (
        <div className="aspect-video w-full bg-muted" />
      )}

      {/* Profile section — overlaps cover */}
      <div className="relative px-4 pb-4">
        {/* Logo avatar */}
        {restaurant.logoUrl && (
          <div className="-mt-8 mb-2 size-16 overflow-hidden rounded-full border-4 border-background bg-background shadow-sm">
            <Image
              src={restaurant.logoUrl}
              alt={`${restaurant.name} logo`}
              width={64}
              height={64}
              className="size-full object-cover"
            />
          </div>
        )}

        <h1 className="font-heading text-xl font-bold">{restaurant.name}</h1>

        {restaurant.cuisineType && (
          <p className="text-sm text-muted-foreground">
            {restaurant.cuisineType}
          </p>
        )}

        {branchAddress && (
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            {branchAddress}
          </p>
        )}

        {restaurant.phone && (
          <div className="mt-2">
            <CopyContactButton
              value={restaurant.phone}
              label={restaurant.phone}
            />
          </div>
        )}
      </div>
    </header>
  );
}
