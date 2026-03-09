"use client";

import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRestaurantReviews } from "../hooks/use-customer-orders";

interface RestaurantReviewsProps {
  restaurantSlug: string;
  restaurantName: string;
}

function renderInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function RestaurantReviews({
  restaurantSlug,
  restaurantName,
}: RestaurantReviewsProps) {
  const { averageRating, reviews, totalReviews } =
    useRestaurantReviews(restaurantSlug);

  return (
    <section className="space-y-4 border-t border-primary/10 px-4 py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">
            Customer reviews
          </p>
          <h2 className="font-heading text-2xl font-bold">{restaurantName}</h2>
        </div>

        <div className="rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-right">
          <p className="text-sm text-muted-foreground">Average rating</p>
          <p className="flex items-center justify-end gap-1 font-semibold text-foreground">
            <Star className="size-4 fill-primary text-primary" />
            {totalReviews > 0 ? averageRating.toFixed(1) : "New"}
          </p>
        </div>
      </div>

      {reviews.length > 0 ? (
        <div className="grid gap-3">
          {reviews.map((review) => (
            <Card key={review.id} className="border-primary/10 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div className="flex items-center gap-3">
                  <Avatar className="size-11 border border-primary/10">
                    <AvatarFallback className="bg-primary/10 font-medium text-primary">
                      {renderInitials(review.authorName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      {review.authorName}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          key={`${review.id}-${index + 1}`}
                          className={`size-4 ${index < review.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <Badge variant="secondary">
                  {new Intl.DateTimeFormat("en-PH", {
                    month: "short",
                    day: "numeric",
                  }).format(new Date(review.createdAt))}
                </Badge>
              </CardHeader>

              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  {review.comment}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-primary/20 bg-primary/5 px-5 py-6">
          <p className="font-medium">No reviews yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Completed customers can leave a review from their order history.
          </p>
        </div>
      )}
    </section>
  );
}
