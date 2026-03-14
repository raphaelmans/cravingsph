"use client";

import {
  CheckCircle2,
  Clock,
  GitBranch,
  Mail,
  MoreHorizontal,
  Shield,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { appRoutes } from "@/common/app-routes";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganization } from "@/features/owner/hooks/use-owner-sidebar-data";
import {
  useRevokeInvite,
  useTeamInvites,
} from "@/features/team-access/hooks/use-team-access";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROLE_LABELS: Record<string, string> = {
  business_owner: "Business Owner",
  business_manager: "Business Manager",
  business_viewer: "Business Viewer",
  branch_manager: "Branch Manager",
  branch_staff: "Branch Staff",
  branch_viewer: "Branch Viewer",
};

function roleLabel(template: string) {
  return ROLE_LABELS[template] ?? template;
}

const STATUS_ICON: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  pending: Clock,
  accepted: CheckCircle2,
  expired: XCircle,
  revoked: XCircle,
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  accepted: "default",
  expired: "outline",
  revoked: "destructive",
};

function formatExpiry(date: Date | string | null) {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  if (d < now) return "Expired";
  const days = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return `${days}d left`;
}

// ---------------------------------------------------------------------------
// Invite row
// ---------------------------------------------------------------------------

function InviteRow({
  invite,
}: {
  invite: {
    id: string;
    email: string;
    roleTemplate: string;
    scopeType: string;
    scopeName: string;
    status: string;
    expiresAt: Date | string | null;
    createdAt: Date | string;
  };
}) {
  const revokeInvite = useRevokeInvite();
  const StatusIcon = STATUS_ICON[invite.status] ?? Clock;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border/70 bg-background/95 p-4 transition-colors">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
        <Mail className="size-4 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{invite.email}</p>
          <Badge
            variant={STATUS_VARIANT[invite.status] ?? "outline"}
            className="text-xs gap-1"
          >
            <StatusIcon className="size-3" />
            {invite.status}
          </Badge>
          {invite.status === "pending" && invite.expiresAt && (
            <span className="text-xs text-muted-foreground">
              {formatExpiry(invite.expiresAt)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {invite.scopeType === "branch" ? (
            <GitBranch className="size-3" />
          ) : (
            <Shield className="size-3" />
          )}
          {roleLabel(invite.roleTemplate)}
          <span className="text-muted-foreground/60">-</span>
          {invite.scopeName}
        </div>
      </div>

      {invite.status === "pending" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => revokeInvite.mutate({ inviteId: invite.id })}
              disabled={revokeInvite.isPending}
            >
              <XCircle className="mr-2 size-4" />
              Revoke Invite
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TeamInvitesPage() {
  const { data: organization, isLoading: orgLoading } = useOrganization();
  const { data: invites, isLoading: invitesLoading } = useTeamInvites(
    organization?.id,
  );

  const isLoading = orgLoading || invitesLoading;

  // Sort: pending first, then by created date desc
  const sortedInvites = [...(invites ?? [])].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <>
      <DashboardNavbar
        breadcrumbs={[
          { label: "Dashboard", href: appRoutes.organization.base },
          { label: "Team Access", href: appRoutes.organization.team },
          { label: "Invites" },
        ]}
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        <AppPageHeader
          eyebrow="Team Access"
          title="Invitations"
          description="Track pending, accepted, and expired invitations."
          icon={<Mail className="size-5" />}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href={appRoutes.organization.team}>Back to Members</Link>
            </Button>
          }
        />

        <Card className="rounded-3xl border-border/70 bg-background/95">
          <CardHeader>
            <CardTitle className="text-base">
              All Invites
              {!isLoading && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({sortedInvites.length})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              ["a", "b", "c"].map((key) => (
                <div
                  key={key}
                  className="flex items-center gap-4 rounded-2xl border p-4"
                >
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
              ))
            ) : sortedInvites.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No invitations sent yet.
              </div>
            ) : (
              sortedInvites.map((invite) => (
                <InviteRow key={invite.id} invite={invite} />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
