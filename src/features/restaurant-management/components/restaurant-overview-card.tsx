import {
  ExternalLink,
  Store,
  UtensilsCrossed,
  Verified,
  Waypoints,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RestaurantOverviewCardProps {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    cuisineType: string | null;
    phone: string | null;
    email: string | null;
    verificationStatus: string;
    isActive: boolean;
  };
  editHref: string;
  branchesHref: string;
  publicHref: string;
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

export function RestaurantOverviewCard({
  restaurant,
  editHref,
  branchesHref,
  publicHref,
}: RestaurantOverviewCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg">{restaurant.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {restaurant.cuisineType || "Cuisine pending"}
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
          </div>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {restaurant.description ||
            "Add a short description so customers understand the concept at a glance."}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Store className="size-4 text-primary" />
              Profile
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Slug: /restaurant/{restaurant.slug}</p>
              <p>{restaurant.phone || "Phone not added"}</p>
            </div>
          </div>

          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <UtensilsCrossed className="size-4 text-primary" />
              Contact
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>{restaurant.email || "Email not added"}</p>
              <p>{restaurant.cuisineType || "Cuisine not set"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
            <Verified className="size-4 text-primary" />
            Owner workflow
          </div>
          Keep the restaurant profile current, then manage each physical
          location under the branches workspace.
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href={editHref}>Edit Details</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={branchesHref}>
            <Waypoints className="size-4" />
            Manage Branches
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <a href={publicHref} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" />
            Open Public Page
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
