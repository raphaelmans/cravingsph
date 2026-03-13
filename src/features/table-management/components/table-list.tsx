"use client";

import { formatDistanceToNow } from "date-fns";
import { Pencil, Play, Square, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/shared/infra/trpc/root";
import {
  useCloseSession,
  useDeleteTable,
  useOpenSession,
} from "../hooks/use-table-management";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type TableWithSessionOutput = RouterOutputs["table"]["list"][number];
type BranchTableOutput = TableWithSessionOutput["table"];

interface TableListProps {
  branchId: string;
  tables: TableWithSessionOutput[];
  onEdit: (table: BranchTableOutput) => void;
}

export function TableList({ branchId, tables, onEdit }: TableListProps) {
  const deleteMutation = useDeleteTable(branchId);
  const openSessionMutation = useOpenSession(branchId);
  const closeSessionMutation = useCloseSession(branchId);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(
      { id: deleteTarget.id },
      {
        onSuccess: () => {
          toast.success(`"${deleteTarget.label}" deleted`);
          setDeleteTarget(null);
        },
        onError: (err) => {
          toast.error(err.message);
          setDeleteTarget(null);
        },
      },
    );
  }

  function handleOpenSession(branchTableId: string) {
    openSessionMutation.mutate(
      { branchTableId },
      {
        onSuccess: () => toast.success("Session opened"),
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleCloseSession(sessionId: string) {
    closeSessionMutation.mutate(
      { sessionId },
      {
        onSuccess: () => toast.success("Session closed"),
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="hidden sm:table-cell">Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Session</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.map(({ table, activeSession }) => (
              <TableRow key={table.id}>
                <TableCell className="font-medium">{table.label}</TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    {table.code}
                  </code>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {table.sortOrder}
                </TableCell>
                <TableCell>
                  <Badge variant={table.isActive ? "secondary" : "outline"}>
                    {table.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {activeSession ? (
                    <Badge
                      variant="default"
                      className="bg-success text-success-foreground"
                    >
                      Active{" "}
                      <span className="ml-1 opacity-70">
                        {formatDistanceToNow(new Date(activeSession.openedAt), {
                          addSuffix: false,
                        })}
                      </span>
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No session
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => onEdit(table)}
                    >
                      <Pencil className="size-3.5" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    {activeSession ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={closeSessionMutation.isPending}
                        onClick={() => handleCloseSession(activeSession.id)}
                      >
                        <Square className="size-3.5" />
                        <span className="sr-only">Close session</span>
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={openSessionMutation.isPending}
                        onClick={() => handleOpenSession(table.id)}
                      >
                        <Play className="size-3.5" />
                        <span className="sr-only">Open session</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() =>
                        setDeleteTarget({ id: table.id, label: table.label })
                      }
                    >
                      <Trash2 className="size-3.5" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete table?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.label}&quot;?
              This will also remove any associated sessions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
