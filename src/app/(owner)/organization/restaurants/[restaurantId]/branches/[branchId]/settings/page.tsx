"use client";

import { ExternalLink, QrCode, Settings2, Store } from "lucide-react";
import { use, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { appRoutes } from "@/common/app-routes";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { QRCodePreview } from "@/features/branch-settings/components/qr-code-preview";
import { WeeklyHoursEditor } from "@/features/branch-settings/components/weekly-hours-editor";
import { useBranchSettings } from "@/features/branch-settings/hooks/use-branch-settings";

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
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Settings2 className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold">Branch not found</p>
                <p className="max-w-md text-sm text-muted-foreground">
                  This branch could not be loaded for the selected restaurant.
                  Return to the restaurant list and choose another branch.
                </p>
              </div>
              <Button variant="outline" asChild>
                <a href={appRoutes.organization.restaurants}>
                  Back to restaurants
                </a>
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
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {branch.name}
            </h1>
            <Badge variant={branch.isActive ? "secondary" : "outline"}>
              {branch.isActive ? "Active branch" : "Inactive branch"}
            </Badge>
          </div>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Adjust order intake, storefront timing, and table QR materials for
            this location. Changes here affect only this branch and do not
            modify the rest of the restaurant network.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-1">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Store className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ordering status
                </p>
                <p className="text-2xl font-semibold">
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
            <Card>
              <CardHeader>
                <CardTitle>Order Settings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Branch-level controls for storefront availability and order
                  intake behavior. These changes are persisted to the current
                  branch record.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-4 rounded-xl border p-4">
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
                <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
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
