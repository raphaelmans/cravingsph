"use client";

import { Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminUserListItem } from "../hooks/use-admin-users";
import { isRecentlyActive } from "../hooks/use-admin-users";

interface AdminUserTableProps {
  users: AdminUserListItem[];
  isLoading: boolean;
  onToggleAccess: (user: AdminUserListItem) => void;
}

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case "admin":
      return "default";
    case "viewer":
      return "outline";
    default:
      return "secondary";
  }
}

function formatDate(value: Date | string | null) {
  if (!value) {
    return "No activity yet";
  }

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getInitials(user: AdminUserListItem) {
  const source = user.displayName ?? user.email ?? "User";

  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? "")
    .join("");
}

export function AdminUserTable({
  users,
  isLoading,
  onToggleAccess,
}: AdminUserTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform users</CardTitle>
        <CardDescription>
          Search accounts, review their last sign-in activity, and manage access
          status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
          </div>
        ) : null}

        {!isLoading && users.length === 0 ? (
          <div className="rounded-xl border border-dashed px-4 py-16 text-center text-sm text-muted-foreground">
            No users match the current search and filter criteria.
          </div>
        ) : null}

        {!isLoading && users.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Last sign-in</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const recentlyActive = isRecentlyActive(user.lastSignInAt);

                return (
                  <TableRow key={user.userId}>
                    <TableCell className="whitespace-normal">
                      <div className="flex min-w-[220px] items-center gap-3">
                        <Avatar className="size-10">
                          <AvatarImage
                            alt={user.displayName ?? user.email ?? "User"}
                            src={user.avatarUrl ?? undefined}
                          />
                          <AvatarFallback>{getInitials(user)}</AvatarFallback>
                        </Avatar>

                        <div className="space-y-1">
                          <div className="font-medium text-foreground">
                            {user.displayName ?? "Profile not completed"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Joined {formatDate(user.createdAt)}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>

                    <TableCell className="whitespace-normal">
                      <div className="min-w-[220px] space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="size-4" />
                          <span>{user.email ?? "No email on file"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="size-4" />
                          <span>{user.phone ?? "No phone on file"}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-normal">
                      <div className="min-w-[180px] space-y-1 text-sm">
                        <p>{formatDate(user.lastSignInAt)}</p>
                        <p className="text-xs text-muted-foreground">
                          {recentlyActive
                            ? "Seen in the last 30 days"
                            : "No recent sign-in"}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex min-w-[140px] flex-wrap gap-2">
                        <Badge
                          variant={user.isActive ? "secondary" : "outline"}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {recentlyActive ? (
                          <Badge variant="outline">
                            <ShieldCheck className="size-3.5" />
                            Recent
                          </Badge>
                        ) : null}
                        {!recentlyActive && user.isActive ? (
                          <Badge variant="outline">
                            <UserRound className="size-3.5" />
                            Stale
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        onClick={() => onToggleAccess(user)}
                        size="sm"
                        variant={user.isActive ? "outline" : "default"}
                      >
                        {user.isActive ? "Deactivate" : "Reactivate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : null}
      </CardContent>
    </Card>
  );
}
