"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  GitBranch,
  Mail,
  MoreHorizontal,
  Plus,
  Shield,
  UserMinus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { appRoutes } from "@/common/app-routes";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganization } from "@/features/owner/hooks/use-owner-sidebar-data";
import {
  useCreateInvite,
  useRevokeMember,
  useTeamMembers,
} from "@/features/team-access/hooks/use-team-access";
import { useTRPC } from "@/trpc/client";

// ---------------------------------------------------------------------------
// Role template display helpers
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

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  revoked: "destructive",
  pending: "secondary",
};

// ---------------------------------------------------------------------------
// Invite form schema
// ---------------------------------------------------------------------------

const InviteFormSchema = z
  .object({
    email: z.string().email("Enter a valid email").max(255),
    roleTemplate: z.enum([
      "business_manager",
      "business_viewer",
      "branch_manager",
      "branch_staff",
      "branch_viewer",
    ]),
    scopeType: z.enum(["business", "branch"]),
    scopeId: z.string().uuid("Select a scope target"),
  })
  .refine(
    (data) => {
      const businessRoles = ["business_manager", "business_viewer"];
      const branchRoles = ["branch_manager", "branch_staff", "branch_viewer"];
      if (businessRoles.includes(data.roleTemplate))
        return data.scopeType === "business";
      if (branchRoles.includes(data.roleTemplate))
        return data.scopeType === "branch";
      return true;
    },
    { message: "Role and scope type must match", path: ["scopeType"] },
  );

type InviteFormValues = z.infer<typeof InviteFormSchema>;

// ---------------------------------------------------------------------------
// Invite dialog
// ---------------------------------------------------------------------------

function InviteDialog({ organizationId }: { organizationId: string }) {
  const [open, setOpen] = useState(false);
  const createInvite = useCreateInvite();
  const trpc = useTRPC();

  // Fetch restaurants to populate branch picker
  const { data: restaurants } = useQuery({
    ...trpc.restaurant.listByOrganization.queryOptions({
      organizationId,
    }),
    enabled: open,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch branches for each restaurant
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const { data: branches } = useQuery({
    ...trpc.branch.listByRestaurant.queryOptions({
      restaurantId: selectedRestaurantId,
    }),
    enabled: !!selectedRestaurantId,
    staleTime: 2 * 60 * 1000,
  });

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(InviteFormSchema),
    defaultValues: {
      email: "",
      roleTemplate: "branch_staff",
      scopeType: "branch",
      scopeId: "",
    },
  });

  const watchedRole = form.watch("roleTemplate");
  const isBranchScope = [
    "branch_manager",
    "branch_staff",
    "branch_viewer",
  ].includes(watchedRole);

  // Auto-set scope type when role changes
  const handleRoleChange = (value: string) => {
    form.setValue("roleTemplate", value as InviteFormValues["roleTemplate"]);
    const newScopeType = ["business_manager", "business_viewer"].includes(value)
      ? "business"
      : "branch";
    form.setValue("scopeType", newScopeType as InviteFormValues["scopeType"]);
    if (newScopeType === "business") {
      form.setValue("scopeId", organizationId);
    } else {
      form.setValue("scopeId", "");
    }
    setSelectedRestaurantId("");
  };

  function handleSubmit(values: InviteFormValues) {
    createInvite.mutate(
      { ...values, organizationId },
      {
        onSuccess: () => {
          form.reset();
          setSelectedRestaurantId("");
          setOpen(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 size-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation link to add a new team member.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="staff@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roleTemplate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={handleRoleChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="business_manager">
                        Business Manager
                      </SelectItem>
                      <SelectItem value="business_viewer">
                        Business Viewer
                      </SelectItem>
                      <SelectItem value="branch_manager">
                        Branch Manager
                      </SelectItem>
                      <SelectItem value="branch_staff">Branch Staff</SelectItem>
                      <SelectItem value="branch_viewer">
                        Branch Viewer
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isBranchScope && (
              <>
                {/* Restaurant picker */}
                <FormItem>
                  <FormLabel>Restaurant</FormLabel>
                  <Select
                    value={selectedRestaurantId}
                    onValueChange={(v) => {
                      setSelectedRestaurantId(v);
                      form.setValue("scopeId", "");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select restaurant" />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurants?.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>

                {/* Branch picker */}
                <FormField
                  control={form.control}
                  name="scopeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedRestaurantId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches?.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <Button
                type="submit"
                disabled={createInvite.isPending}
                className="w-full sm:w-auto"
              >
                {createInvite.isPending ? "Sending..." : "Send Invite"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Member row
// ---------------------------------------------------------------------------

function MemberRow({
  member,
  isOwner,
}: {
  member: {
    id: string;
    userId: string;
    email: string;
    displayName: string | null;
    status: string;
    joinedAt: Date | string | null;
    assignments: {
      id: string;
      roleTemplate: string;
      scopeType: string;
      scopeName: string;
      status: string;
    }[];
  };
  isOwner: boolean;
}) {
  const revokeMember = useRevokeMember();

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border/70 bg-background/95 p-4 transition-colors">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <span className="text-sm font-semibold">
          {(member.displayName ?? member.email).charAt(0).toUpperCase()}
        </span>
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">
            {member.displayName ?? member.email}
          </p>
          <Badge
            variant={STATUS_VARIANT[member.status] ?? "outline"}
            className="text-xs"
          >
            {member.status}
          </Badge>
        </div>

        {member.displayName && (
          <p className="text-xs text-muted-foreground truncate">
            {member.email}
          </p>
        )}

        {member.assignments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {member.assignments.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {a.scopeType === "branch" ? (
                  <GitBranch className="size-3" />
                ) : (
                  <Shield className="size-3" />
                )}
                {roleLabel(a.roleTemplate)}
                <span className="text-muted-foreground/60">-</span>
                {a.scopeName}
              </span>
            ))}
          </div>
        )}
      </div>

      {!isOwner && member.status === "active" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => revokeMember.mutate({ membershipId: member.id })}
              disabled={revokeMember.isPending}
            >
              <UserMinus className="mr-2 size-4" />
              Revoke Access
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

export default function TeamMembersPage() {
  const { data: organization, isLoading: orgLoading } = useOrganization();
  const { data: members, isLoading: membersLoading } = useTeamMembers(
    organization?.id,
  );

  const isLoading = orgLoading || membersLoading;

  // Active members (exclude revoked from main list)
  const activeMembers = members?.filter((m) => m.status === "active") ?? [];

  return (
    <>
      <DashboardNavbar
        breadcrumbs={[
          { label: "Dashboard", href: appRoutes.organization.base },
          { label: "Team Access" },
        ]}
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        <AppPageHeader
          eyebrow="Team Access"
          title="Team Members"
          description="Manage your team members and their access levels."
          icon={<Users className="size-5" />}
          actions={
            organization ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={appRoutes.organization.teamInvites}>
                    <Mail className="mr-1.5 size-4" />
                    View Invites
                  </Link>
                </Button>
                <InviteDialog organizationId={organization.id} />
              </div>
            ) : null
          }
        />

        <Card className="rounded-3xl border-border/70 bg-background/95">
          <CardHeader>
            <CardTitle className="text-base">
              Members
              {!isLoading && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({activeMembers.length})
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
            ) : activeMembers.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No team members yet. Invite someone to get started.
              </div>
            ) : (
              activeMembers.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  isOwner={member.userId === organization?.ownerId}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
