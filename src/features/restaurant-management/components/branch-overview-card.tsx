import {
  Clock3,
  ExternalLink,
  MapPin,
  ReceiptText,
  Settings2,
  Store,
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

interface BranchOverviewCardProps {
  restaurantSlug: string;
  branch: {
    id: string;
    name: string;
    slug: string;
    address: string | null;
    province: string | null;
    city: string | null;
    phone: string | null;
    isOrderingEnabled: boolean;
    autoAcceptOrders: boolean;
    paymentCountdownMinutes: number;
    isActive: boolean;
  };
  editHref: string;
  settingsHref: string;
  menuHref: string;
  ordersHref: string;
}

export function BranchOverviewCard({
  restaurantSlug,
  branch,
  editHref,
  settingsHref,
  menuHref,
  ordersHref,
}: BranchOverviewCardProps) {
  const publicHref = `/restaurant/${restaurantSlug}`;

  return (
    <Card className="h-full border-border/70 bg-background/95">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="font-heading text-xl font-semibold tracking-tight">
              {branch.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {branch.city && branch.province
                ? `${branch.city}, ${branch.province}`
                : branch.city || branch.province || "Location pending"}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Badge variant={branch.isActive ? "secondary" : "outline"}>
              {branch.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant={branch.isOrderingEnabled ? "secondary" : "outline"}>
              {branch.isOrderingEnabled ? "Ordering live" : "Ordering paused"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <MapPin className="size-4 text-primary" />
              Address
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>{branch.address || "Address not added"}</p>
              <p>{branch.phone || "Phone not added"}</p>
            </div>
          </div>

          <div className="rounded-3xl border bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Clock3 className="size-4 text-primary" />
              Order rules
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                {branch.autoAcceptOrders
                  ? "Auto-accept enabled"
                  : "Manual acceptance"}
              </p>
              <p>{branch.paymentCountdownMinutes} minute payment timer</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-dashed p-4 text-sm text-muted-foreground">
          Branch slug:{" "}
          <span className="font-medium text-foreground">{branch.slug}</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href={editHref}>
            <Store className="size-4" />
            Edit Branch
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={settingsHref}>
            <Settings2 className="size-4" />
            Settings
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={menuHref}>Menu</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={ordersHref}>
            <ReceiptText className="size-4" />
            Orders
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <a href={publicHref} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" />
            Public Page
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
