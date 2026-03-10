"use client";

import { Building2, Inbox, ShieldCheck } from "lucide-react";
import { appRoutes } from "@/common/app-routes";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatAdminTimestamp,
  getPendingVerificationOrganizations,
  useAdminVerificationQueue,
} from "../hooks/use-admin-verification";
import { AdminVerificationRequestCard } from "./admin-verification-request-card";

export function AdminVerificationQueuePage() {
  const { data = [], isLoading } = useAdminVerificationQueue();

  const latestSubmission = data[0]?.submittedAt ?? null;
  const organizationCount = getPendingVerificationOrganizations(data);

  return (
    <>
      <DashboardNavbar
        breadcrumbs={[
          { label: "Admin", href: appRoutes.admin.base },
          { label: "Verification" },
        ]}
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Verification queue
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Review pending restaurant submissions, verify the uploaded legal
            documents, and approve or reject the brand for platform activation.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Inbox className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending requests
                </p>
                <p className="text-2xl font-semibold">
                  {isLoading ? "--" : data.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Building2 className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Organizations in queue
                </p>
                <p className="text-2xl font-semibold">
                  {isLoading ? "--" : organizationCount}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Latest submission
                </p>
                <p className="text-base font-semibold">
                  {isLoading || !latestSubmission
                    ? "--"
                    : formatAdminTimestamp(latestSubmission)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        ) : null}

        {!isLoading && data.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center text-sm text-muted-foreground">
              No restaurants are waiting for verification right now.
            </CardContent>
          </Card>
        ) : null}

        {!isLoading ? (
          <div className="space-y-4">
            {data.map((item) => (
              <AdminVerificationRequestCard item={item} key={item.requestId} />
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
