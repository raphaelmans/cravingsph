"use client";

import {
  ArrowRight,
  Building2,
  CalendarClock,
  Mail,
  Phone,
  Store,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { appRoutes } from "@/common/app-routes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AdminVerificationQueueItemRecord } from "@/modules/admin/repositories/admin.repository";
import {
  ADMIN_VERIFICATION_STATUS_META,
  formatAdminTimestamp,
} from "../hooks/use-admin-verification";

interface AdminVerificationRequestCardProps {
  item: AdminVerificationQueueItemRecord;
}

export function AdminVerificationRequestCard({
  item,
}: AdminVerificationRequestCardProps) {
  const statusMeta = ADMIN_VERIFICATION_STATUS_META.pending;

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg">{item.restaurantName}</CardTitle>
            <CardDescription>{item.organizationName}</CardDescription>
          </div>
          <Badge variant={statusMeta.badgeVariant}>{statusMeta.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
          <div className="flex items-start gap-2">
            <Store className="mt-0.5 size-4 text-primary" />
            <div>
              <p className="font-medium text-foreground">Restaurant</p>
              <p>{item.restaurantEmail ?? "No restaurant email yet"}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Building2 className="mt-0.5 size-4 text-primary" />
            <div>
              <p className="font-medium text-foreground">Organization</p>
              <p>{item.organizationName}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <UserRound className="mt-0.5 size-4 text-primary" />
            <div>
              <p className="font-medium text-foreground">Owner</p>
              <p>{item.ownerName ?? "Owner profile not completed"}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CalendarClock className="mt-0.5 size-4 text-primary" />
            <div>
              <p className="font-medium text-foreground">Submitted</p>
              <p>{formatAdminTimestamp(item.submittedAt)}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
            <Mail className="size-4 text-primary" />
            <span>
              {item.ownerEmail ?? item.restaurantEmail ?? "No email on file"}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
            <Phone className="size-4 text-primary" />
            <span>
              {item.ownerPhone ?? item.restaurantPhone ?? "No phone on file"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Review uploaded business registration, government ID, and business
            permit before changing the restaurant status.
          </p>

          <Button asChild size="sm">
            <Link href={appRoutes.admin.verificationRequest(item.requestId)}>
              Review request
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
