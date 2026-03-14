"use client";

import {
  ArrowRight,
  Building2,
  Check,
  ChevronsUpDown,
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
import {
  useAccessibleBranches,
  useOrganization,
  useRestaurants,
} from "@/features/owner/hooks/use-owner-sidebar-data";
import {
  useSelectedRestaurantId,
  useWorkspaceActions,
} from "@/features/owner/stores/workspace.store";

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
  /** Whether the workspace/restaurant switcher is enabled */
  showWorkspaceSwitcher: boolean;
}

// ---------------------------------------------------------------------------
// Main sidebar v2
// ---------------------------------------------------------------------------

export function OwnerSidebarV2({
  showBranchOps,
  showTeamAccess,
  showWorkspaceSwitcher,
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
      {/* ── Header: workspace switcher or org name ── */}
      <SidebarHeader className="border-b">
        {showWorkspaceSwitcher && organization ? (
          <WorkspaceSwitcher
            organizationId={organization.id}
            organizationName={organization.name}
            role={session?.role ?? "Member"}
          />
        ) : orgLoading ? (
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

        {/* Branch Operations — shortcuts to branch portal */}
        <BranchShortcuts showBranchOps={showBranchOps} />

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
// WorkspaceSwitcher — restaurant context selector in sidebar header
// ---------------------------------------------------------------------------

function WorkspaceSwitcher({
  organizationId,
  organizationName,
  role,
}: {
  organizationId: string;
  organizationName: string;
  role: string;
}) {
  const { data: restaurants } = useRestaurants(organizationId);
  const selectedRestaurantId = useSelectedRestaurantId();
  const { selectRestaurant, clearSelection } = useWorkspaceActions();

  const selectedRestaurant = restaurants?.find(
    (r) => r.id === selectedRestaurantId,
  );

  const displayName = selectedRestaurant?.name ?? organizationName;
  const isFiltered = selectedRestaurantId !== null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                {isFiltered ? (
                  <Store className="h-4 w-4" />
                ) : (
                  <Building2 className="h-4 w-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground capitalize">
                  {role}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="bottom"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
          >
            <DropdownMenuItem onSelect={clearSelection}>
              <Building2 className="mr-2 h-4 w-4" />
              <span className="flex-1">All Restaurants</span>
              {!isFiltered && <Check className="ml-2 h-4 w-4" />}
            </DropdownMenuItem>
            {restaurants && restaurants.length > 0 && (
              <>
                <DropdownMenuSeparator />
                {restaurants.map((restaurant) => (
                  <DropdownMenuItem
                    key={restaurant.id}
                    onSelect={() => selectRestaurant(restaurant.id)}
                  >
                    <Store className="mr-2 h-4 w-4" />
                    <span className="flex-1 truncate">{restaurant.name}</span>
                    {selectedRestaurantId === restaurant.id && (
                      <Check className="ml-2 h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// ---------------------------------------------------------------------------
// BranchShortcuts — branch portal shortcuts in sidebar
// ---------------------------------------------------------------------------

const MAX_VISIBLE_BRANCHES = 10;

function BranchShortcuts({ showBranchOps }: { showBranchOps: boolean }) {
  const { data: branches } = useAccessibleBranches();
  const selectedRestaurantId = useSelectedRestaurantId();

  if (!showBranchOps) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Branch Operations</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="px-2 py-1.5">
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  const filteredBranches = selectedRestaurantId
    ? (branches ?? []).filter((b) => b.restaurantId === selectedRestaurantId)
    : (branches ?? []);

  const visibleBranches = filteredBranches.slice(0, MAX_VISIBLE_BRANCHES);
  const hasMore = filteredBranches.length > MAX_VISIBLE_BRANCHES;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Branch Operations</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {visibleBranches.length === 0 ? (
            <SidebarMenuItem>
              <div className="px-2 py-1.5">
                <p className="text-xs text-muted-foreground">No branches yet</p>
              </div>
            </SidebarMenuItem>
          ) : (
            visibleBranches.map((branch) => {
              const href = branch.portalSlug
                ? appRoutes.branchPortal.byPortalSlug(branch.portalSlug)
                : `/organization/restaurants/${branch.restaurantId}`;

              return (
                <SidebarMenuItem key={branch.id}>
                  <SidebarMenuButton asChild tooltip={branch.name}>
                    <Link href={href}>
                      <GitBranch className="size-4" />
                      <span className="flex-1 truncate">{branch.name}</span>
                      <ArrowRight className="size-3 shrink-0 opacity-40" />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })
          )}
          {hasMore && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="View all branches">
                <Link href={appRoutes.organization.restaurants}>
                  <span className="text-xs text-muted-foreground">
                    View all branches
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
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
