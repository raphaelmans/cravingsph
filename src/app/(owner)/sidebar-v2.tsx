"use client";

import {
  Building2,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Rocket,
  Store,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { appRoutes } from "@/common/app-routes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useLogout, useSession } from "@/features/auth/hooks/use-auth";
import { useOrganization } from "@/features/owner/hooks/use-owner-sidebar-data";

// ---------------------------------------------------------------------------
// Nav item definitions
// ---------------------------------------------------------------------------

const setupItems = [
  { label: "Get Started", icon: Rocket, href: "/organization/get-started" },
];

const overviewItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/organization" },
];

const restaurantItems = [
  {
    label: "All Restaurants",
    icon: Store,
    href: appRoutes.organization.restaurants,
  },
];

const accountItems = [
  { label: "Profile", icon: User, href: appRoutes.ownerAccount.base },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface OwnerSidebarV2Props {
  /** Whether the branch ops portal flag is enabled */
  showBranchOps: boolean;
  /** Whether the team access flag is enabled */
  showTeamAccess: boolean;
}

// ---------------------------------------------------------------------------
// Main sidebar v2
// ---------------------------------------------------------------------------

export function OwnerSidebarV2({
  showBranchOps,
  showTeamAccess,
}: OwnerSidebarV2Props) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data: organization, isLoading: orgLoading } = useOrganization();

  const isActive = (href: string) => {
    if (href === "/organization") return pathname === "/organization";
    return pathname.startsWith(href);
  };

  return (
    <Sidebar collapsible="icon">
      {/* ── Header: org name + role ── */}
      <SidebarHeader className="border-b">
        {orgLoading ? (
          <div className="flex items-center gap-2 p-2">
            <div className="flex h-8 w-8 animate-skeleton items-center justify-center rounded-md bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-24 animate-skeleton rounded bg-muted" />
              <div className="h-3 w-14 animate-skeleton rounded bg-muted" />
            </div>
          </div>
        ) : organization ? (
          <div className="flex items-center gap-2 p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {organization.name}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {session?.role ?? "Member"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Dashboard</p>
            </div>
          </div>
        )}
      </SidebarHeader>

      {/* ── Content: flat task-oriented groups ── */}
      <SidebarContent>
        <NavGroup items={setupItems} label="Setup" isActive={isActive} />
        <NavGroup items={overviewItems} label="Overview" isActive={isActive} />
        <NavGroup
          items={restaurantItems}
          label="Restaurants"
          isActive={isActive}
        />

        {/* Branch Operations — placeholder until Step 8 wires shortcuts */}
        <SidebarGroup>
          <SidebarGroupLabel>Branch Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {showBranchOps ? (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Branch Operations">
                    <Link href={appRoutes.branchPortal.base}>
                      <GitBranch className="size-4" />
                      <span>All Branches</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                <SidebarMenuItem>
                  <div className="px-2 py-1.5">
                    <p className="text-xs text-muted-foreground">Coming soon</p>
                  </div>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Team Access — placeholder until Step 11 wires member/invite pages */}
        <SidebarGroup>
          <SidebarGroupLabel>Team Access</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {showTeamAccess ? (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(appRoutes.organization.team)}
                    tooltip="Members"
                  >
                    <Link href={appRoutes.organization.team}>
                      <Users className="size-4" />
                      <span>Members</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                <SidebarMenuItem>
                  <div className="px-2 py-1.5">
                    <p className="text-xs text-muted-foreground">Coming soon</p>
                  </div>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <NavGroup items={accountItems} label="Account" isActive={isActive} />
      </SidebarContent>

      <SidebarSeparator />

      {/* ── Footer: NavUser ── */}
      <SidebarFooter>
        {session ? <NavUser email={session.email} /> : null}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

// ---------------------------------------------------------------------------
// NavGroup — generic flat nav group
// ---------------------------------------------------------------------------

function NavGroup({
  items,
  label,
  isActive,
}: {
  items: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
  }[];
  label: string;
  isActive: (href: string) => boolean;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

// ---------------------------------------------------------------------------
// NavUser — footer with avatar, email, and logout
// ---------------------------------------------------------------------------

function NavUser({ email }: { email: string }) {
  const router = useRouter();
  const logout = useLogout();

  const initial = email.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => router.push("/login"),
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-sidebar-accent"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{email}</p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuItem asChild>
          <Link href={appRoutes.ownerAccount.base}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={handleLogout}
          disabled={logout.isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {logout.isPending ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
