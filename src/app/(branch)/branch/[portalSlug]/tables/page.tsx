"use client";

import type { inferRouterOutputs } from "@trpc/server";
import { Grid3X3, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { appRoutes } from "@/common/app-routes";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { AppEmptyState } from "@/components/ui/app-empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranchPortal } from "@/features/branch-portal/components/branch-portal-provider";
import { OwnerWalkthroughPanel } from "@/features/onboarding/components/owner-walkthrough-panel";
import { AddTableDialog } from "@/features/table-management/components/add-table-dialog";
import { EditTableDialog } from "@/features/table-management/components/edit-table-dialog";
import { TableList } from "@/features/table-management/components/table-list";
import {
  useCloseAllSessions,
  useTables,
} from "@/features/table-management/hooks/use-table-management";
import type { AppRouter } from "@/shared/infra/trpc/root";

type BranchTableOutput =
  inferRouterOutputs<AppRouter>["table"]["list"][number]["table"];

export default function BranchPortalTablesPage() {
  const ctx = useBranchPortal();
  const { data: tables, isLoading } = useTables(ctx.branchId);
  const closeAllMutation = useCloseAllSessions(ctx.branchId);

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BranchTableOutput | null>(null);

  const hasActiveSessions =
    tables?.some((t) => t.activeSession !== null) ?? false;

  function handleCloseAll() {
    closeAllMutation.mutate(
      { branchId: ctx.branchId },
      {
        onSuccess: (result) =>
          toast.success(`${result.closed} session(s) closed`),
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <>
      <DashboardNavbar
        breadcrumbs={[
          {
            label: "Overview",
            href: appRoutes.branchPortal.byPortalSlug(ctx.portalSlug),
          },
          { label: "Tables" },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!hasActiveSessions || closeAllMutation.isPending}
              onClick={handleCloseAll}
            >
              {closeAllMutation.isPending ? "Closing..." : "Close All Sessions"}
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="mr-1.5 size-4" />
              Add Table
            </Button>
          </div>
        }
      />

      <div className="flex-1 space-y-4 p-4 md:p-6">
        <AppPageHeader
          eyebrow="Branch operations"
          title="Tables"
          description="Set up tables for dine-in QR ordering."
          variant="compact"
        />

        <OwnerWalkthroughPanel
          flowId="owner-branch-tables"
          title="Set up QR table ordering"
          description="Link physical tables to the digital ordering flow."
          steps={[
            {
              title: "Add every scannable table",
              description:
                "Create a record for each seat grouping customers scan.",
            },
            {
              title: "Watch active sessions",
              description: "See which tables have open dine-in sessions.",
            },
            {
              title: "Pair this page with branch QR materials",
              description:
                "Review the QR entry point in branch settings after setup.",
            },
          ]}
        />

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : !tables || tables.length === 0 ? (
          <AppEmptyState
            icon={<Grid3X3 />}
            title="No tables yet"
            description="Add your physical dining tables so customers can scan QR codes for dine-in ordering."
            primaryAction={
              <Button shape="pill" onClick={() => setAddOpen(true)}>
                <Plus className="mr-1.5 size-4" />
                Add first table
              </Button>
            }
          />
        ) : (
          <TableList
            branchId={ctx.branchId}
            tables={tables}
            onEdit={setEditTarget}
          />
        )}
      </div>

      <AddTableDialog
        branchId={ctx.branchId}
        open={addOpen}
        onOpenChange={setAddOpen}
      />

      <EditTableDialog
        branchId={ctx.branchId}
        table={editTarget}
        open={editTarget !== null}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      />
    </>
  );
}
