"use client";

import type { inferRouterOutputs } from "@trpc/server";
import { Grid3X3, Plus } from "lucide-react";
import { use, useState } from "react";
import { toast } from "sonner";
import { appRoutes } from "@/common/app-routes";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

interface TableManagementPageProps {
  params: Promise<{ restaurantId: string; branchId: string }>;
}

export default function TableManagementPage({
  params,
}: TableManagementPageProps) {
  const { restaurantId, branchId } = use(params);
  const { data: tables, isLoading } = useTables(branchId);
  const closeAllMutation = useCloseAllSessions(branchId);

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BranchTableOutput | null>(null);

  const hasActiveSessions =
    tables?.some((t) => t.activeSession !== null) ?? false;

  function handleCloseAll() {
    closeAllMutation.mutate(
      { branchId },
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
          { label: "Restaurants", href: appRoutes.organization.restaurants },
          {
            label: "Branch",
            href: `/organization/restaurants/${restaurantId}/branches/${branchId}`,
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
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : !tables || tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Grid3X3 className="size-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">No tables yet</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Add your physical dining tables so customers can scan QR codes for
              dine-in ordering.
            </p>
            <Button className="mt-4" onClick={() => setAddOpen(true)}>
              <Plus className="mr-1.5 size-4" />
              Add First Table
            </Button>
          </div>
        ) : (
          <TableList
            branchId={branchId}
            tables={tables}
            onEdit={setEditTarget}
          />
        )}
      </div>

      <AddTableDialog
        branchId={branchId}
        open={addOpen}
        onOpenChange={setAddOpen}
      />

      <EditTableDialog
        branchId={branchId}
        table={editTarget}
        open={editTarget !== null}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      />
    </>
  );
}
