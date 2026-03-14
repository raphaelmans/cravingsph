"use client";

import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, Circle, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrderStatusEvent } from "../types";

const STATUS_LABELS: Record<string, string> = {
  placed: "Order Submitted",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  completed: "Completed",
  cancelled: "Cancelled",
};

function getStatusIcon(toStatus: string) {
  switch (toStatus) {
    case "completed":
      return <CheckCircle2 className="size-4 text-success" />;
    case "cancelled":
      return <XCircle className="size-4 text-destructive" />;
    default:
      return <Circle className="size-4 text-muted-foreground" />;
  }
}

interface OrderTimelineProps {
  events: OrderStatusEvent[];
}

export function OrderTimeline({ events }: OrderTimelineProps) {
  if (events.length === 0) {
    return (
      <Card className="border-primary/10 bg-background/95 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg font-semibold tracking-tight">
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            <span>No status events recorded yet.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/10 bg-background/95 shadow-sm">
      <CardHeader>
        <CardTitle className="font-heading text-lg font-semibold tracking-tight">
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative ml-2 border-l border-border">
          {events.map((event, idx) => {
            const isLast = idx === events.length - 1;
            const timeAgo = formatDistanceToNow(new Date(event.createdAt), {
              addSuffix: true,
            });

            return (
              <li
                key={event.id}
                className={isLast ? "relative ml-4" : "relative mb-6 ml-4"}
              >
                <span className="absolute -left-6 flex size-4 items-center justify-center rounded-full bg-background">
                  {getStatusIcon(event.toStatus)}
                </span>

                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium">
                    {STATUS_LABELS[event.toStatus] ?? event.toStatus}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{timeAgo}</span>
                    {event.changedBy && (
                      <>
                        <span>·</span>
                        <span>{event.changedBy}</span>
                      </>
                    )}
                  </div>

                  {event.note && (
                    <p className="mt-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {event.note}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
