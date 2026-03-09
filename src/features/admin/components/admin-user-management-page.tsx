"use client";

import {
  Activity,
  Search,
  ShieldCheck,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type AdminUserAccessFilter,
  type AdminUserRoleFilter,
  filterAdminUsers,
  setAdminUserActive,
  useAdminUsers,
} from "../hooks/use-admin-users";
import { AdminUserTable } from "./admin-user-table";

const ROLE_FILTER_LABELS: Record<AdminUserRoleFilter, string> = {
  all: "All roles",
  admin: "Admins",
  member: "Members",
  viewer: "Viewers",
};

const ACCESS_FILTER_LABELS: Record<AdminUserAccessFilter, string> = {
  all: "All access states",
  active: "Active",
  inactive: "Inactive",
  recent: "Recent sign-ins",
};

export function AdminUserManagementPage() {
  const { data = [], isLoading } = useAdminUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<AdminUserRoleFilter>("all");
  const [accessFilter, setAccessFilter] =
    useState<AdminUserAccessFilter>("all");

  const filteredUsers = useMemo(
    () => filterAdminUsers(data, searchTerm, roleFilter, accessFilter),
    [accessFilter, data, roleFilter, searchTerm],
  );

  const adminCount = data.filter((user) => user.role === "admin").length;
  const activeCount = data.filter((user) => user.isActive).length;
  const inactiveCount = data.length - activeCount;
  const recentCount = data.filter(
    (user) =>
      user.lastSignInAt &&
      new Date(user.lastSignInAt).getTime() >
        Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).length;

  function handleToggleAccess(userId: string, nextIsActive: boolean) {
    setAdminUserActive(userId, nextIsActive);

    toast.success(
      nextIsActive
        ? "User access restored in the admin scaffold"
        : "User access removed in the admin scaffold",
    );
  }

  return (
    <>
      <DashboardNavbar
        breadcrumbs={[
          { label: "Admin", href: appRoutes.admin.base },
          { label: "Users" },
        ]}
        actions={
          <Badge variant="outline" className="hidden sm:inline-flex">
            Auth suspension backend pending
          </Badge>
        }
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">User management</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Review all platform accounts with assigned roles, search by name or
            contact details, and scaffold deactivate or reactivate actions from
            the admin portal.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Platform users
                </p>
                <p className="text-2xl font-semibold">
                  {isLoading ? "--" : data.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Admins
                </p>
                <p className="text-2xl font-semibold">
                  {isLoading ? "--" : adminCount}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UserRoundCheck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active access
                </p>
                <p className="text-2xl font-semibold">
                  {isLoading ? "--" : activeCount}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Activity className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Recent sign-ins
                </p>
                <p className="text-2xl font-semibold">
                  {isLoading ? "--" : recentCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Current backend coverage</CardTitle>
            <CardDescription>
              Search, role review, and activity data come from real auth and
              profile records. The deactivate action remains a local admin
              scaffold until a persisted suspension field or Supabase admin
              integration is added.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Real query data</Badge>
            <Badge variant="outline">Local access toggle</Badge>
            <span>
              {inactiveCount} users currently marked inactive in this session.
            </span>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, email, phone, or role"
                value={searchTerm}
              />
            </div>

            <Select
              onValueChange={(value) =>
                setRoleFilter(value as AdminUserRoleFilter)
              }
              value={roleFilter}
            >
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_FILTER_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) =>
                setAccessFilter(value as AdminUserAccessFilter)
              }
              value={accessFilter}
            >
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="Filter by access" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACCESS_FILTER_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => {
              setSearchTerm("");
              setRoleFilter("all");
              setAccessFilter("all");
            }}
            type="button"
            variant="ghost"
          >
            Reset filters
          </Button>
        </div>

        <AdminUserTable
          isLoading={isLoading}
          onToggleAccess={(user) =>
            handleToggleAccess(user.userId, !user.isActive)
          }
          users={filteredUsers}
        />
      </div>
    </>
  );
}
