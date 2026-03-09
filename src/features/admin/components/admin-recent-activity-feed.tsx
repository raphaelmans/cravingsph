"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface AdminRecentActivityItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
  organizationName: string;
  verificationStatus: string;
  isActive: boolean;
  createdAt: Date | string;
}

function getVerificationBadgeVariant(status: string) {
  switch (status) {
    case "approved":
      return "secondary" as const;
    case "rejected":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

function getActivityCopy(item: AdminRecentActivityItem) {
  if (item.verificationStatus === "pending") {
    return "Submitted and waiting for verification review.";
  }

  if (item.verificationStatus === "approved") {
    return "Approved and visible to customers.";
  }

  if (item.verificationStatus === "rejected") {
    return "Rejected and waiting for owner resubmission.";
  }

  return item.isActive
    ? "Active restaurant record on the platform."
    : "Inactive restaurant record.";
}

function formatDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

const activitySkeletonKeys = [
  "activity-skeleton-1",
  "activity-skeleton-2",
  "activity-skeleton-3",
  "activity-skeleton-4",
] as const;

interface AdminRecentActivityFeedProps {
  items: AdminRecentActivityItem[];
  isLoading?: boolean;
}

export function AdminRecentActivityFeed({
  items,
  isLoading = false,
}: AdminRecentActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest restaurant records and verification movement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          activitySkeletonKeys.map((key) => (
            <div key={key} className="space-y-2 rounded-lg border p-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))
        ) : items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{item.restaurantName}</p>
                <Badge
                  variant={getVerificationBadgeVariant(item.verificationStatus)}
                >
                  {item.verificationStatus}
                </Badge>
                <Badge variant={item.isActive ? "secondary" : "outline"}>
                  {item.isActive ? "active" : "inactive"}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.organizationName}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {getActivityCopy(item)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Added {formatDate(item.createdAt)}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            No restaurant activity yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
