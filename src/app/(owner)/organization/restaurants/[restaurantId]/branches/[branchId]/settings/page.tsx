"use client";

import { ExternalLink, QrCode, Settings2, Store } from "lucide-react";
import { use, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { appRoutes } from "@/common/app-routes";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { AppEmptyState } from "@/components/ui/app-empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { QRCodePreview } from "@/features/branch-settings/components/qr-code-preview";
import { WeeklyHoursEditor } from "@/features/branch-settings/components/weekly-hours-editor";
import { useBranchSettings } from "@/features/branch-settings/hooks/use-branch-settings";
import { OwnerWalkthroughPanel } from "@/features/onboarding/components/owner-walkthrough-panel";

interface BranchSettingsPageProps {
  params: Promise<{ restaurantId: string; branchId: string }>;
}

interface OrderSettingsDraft {
  isOrderingEnabled: boolean;
}

export default function BranchSettingsPage({
  params,
}: BranchSettingsPageProps) {
  const { restaurantId, branchId } = use(params);
  const {
    restaurant,
    branch,
    weeklyHours,
    updateWeeklyHour,
    addTimeSlot,
    removeTimeSlot,
    applyWeekdayTemplate,
    resetWeeklyHours,
    saveWeeklyHours,
    saveOrderSettings,
    isLoading,
    isSavingOrderSettings,
    isSavingWeeklyHours,
  } = useBranchSettings(restaurantId, branchId);

  const [draft, setDraft] = useState<OrderSettingsDraft>({
    isOrderingEnabled: true,
  });

  useEffect(() => {
    if (!branch) {
      return;
    }

    setDraft({
      isOrderingEnabled: branch.isOrderingEnabled,
    });
  }, [branch]);

  const hasOrderChanges = Boolean(
    branch && branch.isOrderingEnabled !== draft.isOrderingEnabled,
  );

  const publicPath = restaurant
    ? appRoutes.restaurant.bySlug(restaurant.slug)
    : appRoutes.index.base;

  const publicUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return publicPath;
    }

    return new URL(publicPath, window.location.origin).toString();
  }, [publicPath]);

  async function handleSaveOrderSettings() {
    if (!branch) {
      return;
    }

    try {
      await saveOrderSettings({
        isOrderingEnabled: draft.isOrderingEnabled,
      });
      toast.success("Branch order settings saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save settings",
      );
    }
  }

  function handlePreviewCustomerPage() {
    window.open(publicUrl, "_blank", "noopener,noreferrer");
  }

  if (isLoading) {
    return (
      <>
        <DashboardNavbar
          breadcrumbs={[
            { label: "Restaurants", href: appRoutes.organization.restaurants },
            { label: "Branch Settings" },
          ]}
        />

        <div className="flex-1 space-y-6 p-4 md:p-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>

          <Skeleton className="h-32 rounded-xl" />

          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </>
    );
  }

  if (!branch) {
    return (
      <>
        <DashboardNavbar
          breadcrumbs={[
            { label: "Restaurants", href: appRoutes.organization.restaurants },
            { label: "Branch Settings" },
          ]}
        />

        <div className="flex-1 p-4 md:p-6">
          <AppEmptyState
            tone="subtle"
            icon={<Settings2 />}
            title="Branch not found"
            description="This branch could not be loaded for the selected restaurant. Return to the restaurant list and choose another branch."
            primaryAction={
              <Button variant="outline" shape="pill" asChild>
                <a href={appRoutes.organization.restaurants}>
                  Back to restaurants
                </a>
              </Button>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNavbar
        breadcrumbs={[
          { label: "Restaurants", href: appRoutes.organization.restaurants },
          { label: restaurant?.name ?? "Restaurant" },
          { label: "Branch Settings" },
        ]}
        actions={
          <Button variant="outline" onClick={handlePreviewCustomerPage}>
            <ExternalLink className="size-4" />
            Preview as customer
          </Button>
        }
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        <AppPageHeader
          eyebrow="Branch operations"
          title={branch.name}
          description="Control ordering, hours, and QR materials for this branch."
          icon={<Settings2 className="size-5" />}
          actions={
            <Badge variant={branch.isActive ? "secondary" : "outline"}>
              {branch.isActive ? "Active branch" : "Inactive branch"}
            </Badge>
          }
        />

        <OwnerWalkthroughPanel
          flowId="owner-branch-settings"
          title="Tune branch-level operations"
          description="Ordering state, hours, and customer entry point."
          steps={[
            {
              title: "Check ordering status first",
              description:
                "Confirm whether this branch should be live right now.",
            },
            {
              title: "Set hours before printing QR materials",
              description: "Set accurate hours before printing QR materials.",
            },
            {
              title: "Validate the public preview",
              description:
                "Preview what guests will see before sharing the QR code.",
            },
          ]}
        />

        <div className="grid gap-4 md:grid-cols-1">
          <Card className="rounded-3xl border-border/70 bg-background/95">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Store className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ordering status
                </p>
                <p className="font-heading text-3xl font-semibold tracking-tight">
                  {draft.isOrderingEnabled ? "Live" : "Paused"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <WeeklyHoursEditor
            hours={weeklyHours}
            onHourChange={updateWeeklyHour}
            onAddTimeSlot={addTimeSlot}
            onRemoveTimeSlot={removeTimeSlot}
            onApplyWeekdayTemplate={applyWeekdayTemplate}
            onReset={resetWeeklyHours}
            onSave={async () => {
              try {
                await saveWeeklyHours();
                toast.success("Operating hours saved");
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Failed to save operating hours",
                );
              }
            }}
            isSaving={isSavingWeeklyHours}
          />

          <div className="space-y-6">
            <Card className="rounded-3xl border-border/70 bg-background/95">
              <CardHeader>
                <CardTitle className="font-heading text-xl font-semibold tracking-tight">
                  Order settings
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Branch-level controls for storefront availability and order
                  intake behavior. These changes are persisted to the current
                  branch record.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-4 rounded-3xl border p-4">
                  <div className="space-y-1">
                    <p className="font-medium">Enable online ordering</p>
                    <p className="text-sm text-muted-foreground">
                      Turn off order intake without hiding the restaurant from
                      discovery and preview flows.
                    </p>
                  </div>
                  <Switch
                    checked={draft.isOrderingEnabled}
                    onCheckedChange={(checked) =>
                      setDraft((current) => ({
                        ...current,
                        isOrderingEnabled: checked,
                      }))
                    }
                    aria-label="Toggle online ordering"
                  />
                </div>

                <Button
                  onClick={handleSaveOrderSettings}
                  disabled={!hasOrderChanges || isSavingOrderSettings}
                  className="w-full"
                >
                  {isSavingOrderSettings ? "Saving..." : "Save order settings"}
                </Button>
              </CardContent>
            </Card>

            <QRCodePreview branchName={branch.name} publicUrl={publicUrl} />

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 text-foreground">
                    <QrCode className="size-4 text-primary" />
                    <span className="font-medium">Public menu entry point</span>
                  </div>
                  <p className="mt-2 break-all">{publicUrl}</p>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Use this to validate the live customer flow, checkout copy,
                    and menu visibility before printing QR cards for the branch.
                  </p>
                  <p>Address: {branch.address || "Address not set yet"}</p>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handlePreviewCustomerPage}
                >
                  <ExternalLink className="size-4" />
                  Open customer preview
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
