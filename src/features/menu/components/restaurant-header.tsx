import { MapPin } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
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
      <div className="relative overflow-hidden border-b border-primary/10 bg-linear-to-br from-peach via-background to-background">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 size-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 size-64 rounded-full bg-peach blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 py-6 md:py-8">
          <div className="rounded-4xl border border-primary/15 bg-background/92 p-5 shadow-lg shadow-primary/5 backdrop-blur md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 flex-1 gap-4">
                {restaurant.logoUrl ? (
                  <div className="size-16 shrink-0 overflow-hidden rounded-full border-4 border-background bg-background shadow-sm">
                    <Image
                      src={restaurant.logoUrl}
                      alt={`${restaurant.name} logo`}
                      width={64}
                      height={64}
                      className="size-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                    <span className="font-heading text-xl font-semibold">
                      {restaurant.name.charAt(0)}
                    </span>
                  </div>
                )}

                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {restaurant.cuisineType ? (
                      <Badge variant="secondary">
                        {restaurant.cuisineType}
                      </Badge>
                    ) : null}
                    {branchAddress ? (
                      <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary/70">
                        Dine-in ready
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance md:text-3xl">
                      {restaurant.name}
                    </h1>

                    {branchAddress ? (
                      <p className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{branchAddress}</span>
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-3 md:items-end">
                {restaurant.coverUrl ? (
                  <div className="relative h-24 w-full overflow-hidden rounded-3xl border border-primary/10 bg-muted md:w-36">
                    <Image
                      src={restaurant.coverUrl}
                      alt={`${restaurant.name} preview`}
                      fill
                      className="object-cover"
                      sizes="144px"
                    />
                  </div>
                ) : null}

                {restaurant.phone ? (
                  <CopyContactButton
                    value={restaurant.phone}
                    label={restaurant.phone}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
