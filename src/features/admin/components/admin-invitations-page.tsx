"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Copy, Loader2, UserPlus, XCircle } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { appRoutes } from "@/common/app-routes";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTRPC } from "@/trpc/client";
import { getQueryClient } from "@/trpc/query-client";

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(dateString: string): string {
  return dateFormatter.format(new Date(dateString));
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return <Badge variant="default">Pending</Badge>;
    case "accepted":
      return <Badge variant="secondary">Accepted</Badge>;
    case "expired":
      return <Badge variant="outline">Expired</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function AdminInvitationsPage() {
  const trpc = useTRPC();
  const queryClient = getQueryClient();
  const [emailInput, setEmailInput] = useState("");
  const [restaurantNameInput, setRestaurantNameInput] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const { data: invitations = [], isLoading } = useQuery(
    trpc.invitation.list.queryOptions({}),
  );

  const createMutation = useMutation({
    ...trpc.invitation.create.mutationOptions(),
    onSuccess: (data) => {
      setGeneratedUrl(data.inviteUrl);
      setEmailInput("");
      setRestaurantNameInput("");
      queryClient.invalidateQueries({
        queryKey: trpc.invitation.list.queryKey(),
      });
      toast.success("Invitation created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create invitation");
    },
  });

  const revokeMutation = useMutation({
    ...trpc.invitation.revoke.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.invitation.list.queryKey(),
      });
      toast.success("Invitation revoked");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to revoke invitation");
    },
  });

  function handleCreate() {
    const input: { email?: string; restaurantName?: string } = {};
    if (emailInput.trim()) {
      input.email = emailInput.trim();
    }
    if (restaurantNameInput.trim()) {
      input.restaurantName = restaurantNameInput.trim();
    }
    createMutation.mutate(input);
  }

  function handleCopyUrl() {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl).then(
      () => toast.success("Invite link copied to clipboard"),
      () => toast.error("Failed to copy link"),
    );
  }

  function handleRevoke(id: string) {
    revokeMutation.mutate({ id });
  }

  return (
    <>
      <DashboardNavbar
        breadcrumbs={[
          { label: "Admin", href: appRoutes.admin.base },
          { label: "Invitations" },
        ]}
        actions={null}
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Invitations</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Generate invite-only registration links for restaurant owners. Each
            link is single-use and expires after 7 days.
          </p>
        </div>

        {/* Create invitation form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="size-4" />
              Generate Invite Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Input
                placeholder="Email (optional)"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Restaurant name hint (optional)"
                value={restaurantNameInput}
                onChange={(e) => setRestaurantNameInput(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Invite Link"
                )}
              </Button>
            </div>

            {generatedUrl ? (
              <div className="flex items-center gap-2">
                <Input
                  ref={urlInputRef}
                  readOnly
                  value={generatedUrl}
                  className="flex-1 font-mono text-sm"
                  onClick={() => urlInputRef.current?.select()}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyUrl}
                  title="Copy invite link"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Invitations table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : invitations.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No invitations yet. Generate your first invite link above.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email hint</TableHead>
                      <TableHead>Restaurant name hint</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Accepted by</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="text-sm">
                          {inv.email || (
                            <span className="text-muted-foreground">--</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {inv.restaurantName || (
                            <span className="text-muted-foreground">--</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={inv.status} />
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(inv.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {inv.acceptedByEmail || (
                            <span className="text-muted-foreground">--</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(inv.expiresAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          {inv.status === "pending" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRevoke(inv.id)}
                              disabled={revokeMutation.isPending}
                            >
                              <XCircle className="mr-1 size-4" />
                              Revoke
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
