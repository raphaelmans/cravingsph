"use client";

import {
  ArrowRight,
  BadgeCheck,
  Building2,
  FileText,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { VerificationDocumentCard } from "@/features/verification/components/verification-document-card";
import { VerificationRestaurantCard } from "@/features/verification/components/verification-restaurant-card";
import {
  useOwnerVerification,
  VERIFICATION_STATUS_META,
} from "@/features/verification/hooks/use-owner-verification";
import { getSupabaseBrowserClient } from "@/shared/infra/supabase/browser-client";

export default function OwnerVerificationPage() {
  const {
    organization,
    verificationItems,
    isLoading,
    uploadDocument,
    removeDocument,
    submitVerification,
    fetchStatus,
  } = useOwnerVerification();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");

  useEffect(() => {
    if (
      verificationItems.length > 0 &&
      !verificationItems.some(
        (item) => item.restaurant.id === selectedRestaurantId,
      )
    ) {
      setSelectedRestaurantId(verificationItems[0]?.restaurant.id ?? "");
    }
  }, [selectedRestaurantId, verificationItems]);

  const selectedRestaurant = useMemo(
    () =>
      verificationItems.find(
        (item) => item.restaurant.id === selectedRestaurantId,
      ) ?? verificationItems[0],
    [selectedRestaurantId, verificationItems],
  );

  function handleSelectRestaurant(id: string) {
    setSelectedRestaurantId(id);
    fetchStatus(id);
  }

  const approvedCount = verificationItems.filter(
    (item) => item.status === "approved",
  ).length;
  const underReviewCount = verificationItems.filter(
    (item) => item.status === "under_review",
  ).length;
  const readyCount = verificationItems.filter((item) => item.canSubmit).length;

  const selectedStatusMeta = selectedRestaurant
    ? VERIFICATION_STATUS_META[selectedRestaurant.status]
    : null;

  function handleSubmit() {
    if (!selectedRestaurant || !selectedRestaurant.canSubmit) {
      return;
    }

    submitVerification(selectedRestaurant.restaurant.id);
    toast.success("Verification documents submitted for review");
  }

  async function handleFileUpload(
    restaurantId: string,
    documentType: string,
    file: File,
  ) {
    const supabase = getSupabaseBrowserClient();
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${restaurantId}/${documentType}.${ext}`;

    const { error } = await supabase.storage
      .from("verification-docs")
      .upload(path, file, { upsert: true });

    if (error) {
      toast.error(`Upload failed: ${error.message}`);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("verification-docs").getPublicUrl(path);

    uploadDocument(
      restaurantId,
      documentType as Parameters<typeof uploadDocument>[1],
      file.name,
      publicUrl,
    );
    toast.success("Document uploaded");
  }

  if (isLoading) {
    return (
      <>
        <DashboardNavbar
          breadcrumbs={[
            { label: "Dashboard", href: appRoutes.organization.base },
            { label: "Verification" },
          ]}
        />

        <div className="flex-1 space-y-6 p-4 md:p-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-[32rem] max-w-full" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <Skeleton className="h-[28rem] rounded-xl" />
            <Skeleton className="h-[42rem] rounded-xl" />
          </div>
        </div>
      </>
    );
  }

  if (verificationItems.length === 0) {
    return (
      <>
        <DashboardNavbar
          breadcrumbs={[
            { label: "Dashboard", href: appRoutes.organization.base },
            { label: "Verification" },
          ]}
        />

        <div className="flex-1 p-4 md:p-6">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold">Add a restaurant first</p>
                <p className="max-w-md text-sm text-muted-foreground">
                  Verification is submitted per restaurant brand. Create a
                  restaurant profile, then return here to upload legal
                  documents.
                </p>
              </div>
              <Button asChild>
                <Link href={appRoutes.organization.restaurants}>
                  Go to restaurants
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNavbar
        breadcrumbs={[
          { label: "Dashboard", href: appRoutes.organization.base },
          { label: "Verification" },
        ]}
        actions={
          selectedRestaurant ? (
            <Button
              disabled={!selectedRestaurant.canSubmit}
              onClick={handleSubmit}
              type="button"
            >
              <BadgeCheck className="size-4" />
              {selectedRestaurant.status === "rejected"
                ? "Resubmit documents"
                : "Submit for review"}
            </Button>
          ) : null
        }
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Business Verification
            </h1>
            {selectedStatusMeta ? (
              <Badge variant={selectedStatusMeta.badgeVariant}>
                {selectedStatusMeta.label}
              </Badge>
            ) : null}
          </div>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Upload legal documents for each restaurant brand under{" "}
            {organization?.name ?? "your organization"} so the admin team can
            approve manual transfer payouts and marketplace activation.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Building2 className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Brands in scope
                </p>
                <p className="text-2xl font-semibold">
                  {verificationItems.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Under review
                </p>
                <p className="text-2xl font-semibold">{underReviewCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FileText className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ready to submit
                </p>
                <p className="text-2xl font-semibold">
                  {readyCount + approvedCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedRestaurant ? (
          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">What we need</CardTitle>
                  <CardDescription>
                    Each restaurant needs three documents to get verified.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <p>1. Registration certificate</p>
                  <p>2. Representative government ID</p>
                  <p>3. Current business permit</p>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {verificationItems.map((item) => (
                  <VerificationRestaurantCard
                    isSelected={
                      item.restaurant.id === selectedRestaurant.restaurant.id
                    }
                    item={item}
                    key={item.restaurant.id}
                    onSelect={() => handleSelectRestaurant(item.restaurant.id)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <CardTitle>
                        {selectedRestaurant.restaurant.name}
                      </CardTitle>
                      <CardDescription>
                        {selectedStatusMeta?.description}
                      </CardDescription>
                    </div>
                    <Badge variant={selectedStatusMeta?.badgeVariant}>
                      {selectedStatusMeta?.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border bg-muted/30 p-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Documents uploaded
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      {selectedRestaurant.uploadedDocuments} of{" "}
                      {selectedRestaurant.totalDocuments}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-muted/30 p-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Next action
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      {selectedRestaurant.canSubmit
                        ? "Submit for review"
                        : selectedRestaurant.status === "under_review"
                          ? "Wait for admin feedback"
                          : "Upload missing documents"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 lg:grid-cols-2">
                {selectedRestaurant.documents.map((document) => (
                  <VerificationDocumentCard
                    document={document}
                    key={document.type}
                    onRemove={() =>
                      removeDocument(
                        selectedRestaurant.restaurant.id,
                        document.type,
                      )
                    }
                    onUpload={(file) => {
                      handleFileUpload(
                        selectedRestaurant.restaurant.id,
                        document.type,
                        file,
                      );
                    }}
                  />
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-muted/30 p-4">
                <div className="space-y-1">
                  <p className="font-medium">Submission checklist</p>
                  <p className="text-sm text-muted-foreground">
                    Complete all required uploads, then send this package to the
                    admin queue.
                  </p>
                </div>

                <Button
                  disabled={!selectedRestaurant.canSubmit}
                  onClick={handleSubmit}
                  type="button"
                >
                  {selectedRestaurant.status === "rejected"
                    ? "Resubmit for review"
                    : "Submit package"}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
