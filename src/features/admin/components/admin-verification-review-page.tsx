"use client";

import {
  ArrowUpRight,
  Building2,
  Mail,
  MapPinned,
  Phone,
  ShieldCheck,
  Store,
  UserRound,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { appRoutes } from "@/common/app-routes";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ADMIN_VERIFICATION_STATUS_META,
  buildAdminVerificationDocuments,
  formatAdminTimestamp,
  useAdminVerificationDecision,
  useAdminVerificationRequest,
} from "../hooks/use-admin-verification";
import { AdminVerificationDocumentCard } from "./admin-verification-document-card";

interface AdminVerificationReviewPageProps {
  requestId: string;
}

export function AdminVerificationReviewPage({
  requestId,
}: AdminVerificationReviewPageProps) {
  const { data, isLoading } = useAdminVerificationRequest(requestId);
  const decisionMutation = useAdminVerificationDecision();

  async function handleDecision(status: "approved" | "rejected") {
    if (!data) {
      return;
    }

    try {
      await decisionMutation.mutateAsync({
        requestId,
        status,
      });

      toast.success(
        status === "approved"
          ? `${data.restaurantName} approved`
          : `${data.restaurantName} rejected`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update verification status",
      );
    }
  }

  if (isLoading) {
    return (
      <>
        <DashboardNavbar
          breadcrumbs={[
            { label: "Admin", href: appRoutes.admin.base },
            { label: "Verification", href: appRoutes.admin.verification },
            { label: "Review" },
          ]}
        />

        <div className="flex-1 space-y-6 p-4 md:p-6">
          <Skeleton className="h-10 w-72" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          <Skeleton className="h-[34rem] rounded-xl" />
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <DashboardNavbar
          breadcrumbs={[
            { label: "Admin", href: appRoutes.admin.base },
            { label: "Verification", href: appRoutes.admin.verification },
            { label: "Review" },
          ]}
        />

        <div className="flex-1 p-4 md:p-6">
          <Card className="border-dashed">
            <CardContent className="py-16 text-center text-sm text-muted-foreground">
              This verification request is no longer available.
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const status =
    data.verificationStatus === "approved" ||
    data.verificationStatus === "rejected"
      ? data.verificationStatus
      : "pending";
  const statusMeta = ADMIN_VERIFICATION_STATUS_META[status];
  const documents = buildAdminVerificationDocuments(data);

  return (
    <>
      <DashboardNavbar
        breadcrumbs={[
          { label: "Admin", href: appRoutes.admin.base },
          { label: "Verification", href: appRoutes.admin.verification },
          { label: data.restaurantName },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={decisionMutation.isPending || status === "rejected"}
              onClick={() => handleDecision("rejected")}
              type="button"
              variant="outline"
            >
              <XCircle className="size-4" />
              Reject
            </Button>
            <Button
              disabled={decisionMutation.isPending || status === "approved"}
              onClick={() => handleDecision("approved")}
              type="button"
            >
              <ShieldCheck className="size-4" />
              Approve
            </Button>
          </div>
        }
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            {data.restaurantName}
          </h1>
          <Badge variant={statusMeta.badgeVariant}>{statusMeta.label}</Badge>
        </div>

        <p className="max-w-3xl text-sm text-muted-foreground">
          {statusMeta.description} Verify the restaurant record, confirm the
          owner contact details, and review each uploaded document before
          updating the restaurant status.
        </p>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="space-y-2 p-6">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Store className="size-4 text-primary" />
                    Restaurant
                  </div>
                  <p className="text-lg font-semibold">{data.restaurantName}</p>
                  <p className="text-sm text-muted-foreground">
                    {data.cuisineType ?? "Cuisine not specified"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-2 p-6">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Building2 className="size-4 text-primary" />
                    Organization
                  </div>
                  <p className="text-lg font-semibold">
                    {data.organizationName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Submitted {formatAdminTimestamp(data.submittedAt)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-2 p-6">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <UserRound className="size-4 text-primary" />
                    Owner
                  </div>
                  <p className="text-lg font-semibold">
                    {data.ownerName ?? "Owner profile not completed"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last updated {formatAdminTimestamp(data.updatedAt)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Submission overview</CardTitle>
                <CardDescription>
                  Platform data currently available for this verification
                  request.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-2 text-sm">
                    <Mail className="size-4 text-primary" />
                    <span>
                      {data.ownerEmail ??
                        data.restaurantEmail ??
                        "No email on file"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-2 text-sm">
                    <Phone className="size-4 text-primary" />
                    <span>
                      {data.ownerPhone ??
                        data.restaurantPhone ??
                        "No phone on file"}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                  {data.description?.trim().length
                    ? data.description
                    : "The owner has not added a restaurant description yet."}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={appRoutes.admin.verification}>
                      Back to queue
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={appRoutes.restaurant.bySlug(data.restaurantSlug)}
                      target="_blank"
                    >
                      Preview public page
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              {documents.map((document) => (
                <AdminVerificationDocumentCard
                  document={document}
                  key={document.type}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Review status</CardTitle>
                <CardDescription>
                  Current decision state for this restaurant record.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border bg-muted/20 p-4">
                  <p className="text-sm font-medium">{statusMeta.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {statusMeta.description}
                  </p>
                </div>

                <Separator />

                <div className="space-y-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <MapPinned className="mt-0.5 size-4 text-primary" />
                    <span>
                      Use the public preview to compare the live listing against
                      the submitted business details.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 size-4 text-primary" />
                    <span>
                      Approval updates the underlying restaurant verification
                      status immediately.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="mt-0.5 size-4 text-primary" />
                    <span>
                      Rejection keeps the request visible to admins until the
                      owner resubmits a corrected record.
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
