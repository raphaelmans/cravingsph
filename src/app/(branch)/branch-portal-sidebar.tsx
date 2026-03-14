"use client";

import {
  Building2,
  Check,
  ChevronsUpDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  Store,
  User,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
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
import { useAccessibleBranches } from "@/features/branch-portal/hooks/use-branch-portal-data";

// ---------------------------------------------------------------------------
// Nav item definitions
// ---------------------------------------------------------------------------

function getNavItems(portalSlug: string) {
  return [
    {
      label: "Overview",
      icon: LayoutDashboard,
      href: appRoutes.branchPortal.byPortalSlug(portalSlug),
    },
    {
      label: "Orders",
      icon: ClipboardList,
      href: appRoutes.branchPortal.orders(portalSlug),
    },
    {
      label: "Menu",
      icon: UtensilsCrossed,
      href: appRoutes.branchPortal.menu(portalSlug),
    },
    {
      label: "Tables",
      icon: Store,
      href: appRoutes.branchPortal.tables(portalSlug),
    },
    {
      label: "Settings",
      icon: Settings,
      href: appRoutes.branchPortal.settings(portalSlug),
    },
  ];
}

// ---------------------------------------------------------------------------
// Main sidebar
// ---------------------------------------------------------------------------

export function BranchPortalSidebar() {
  const pathname = usePathname();
  const params = useParams<{ portalSlug: string }>();
  const portalSlug = params.portalSlug;
  const { data: session } = useSession();
  const { data: branches = [] } = useAccessibleBranches();

  const currentBranch = branches.find((b) => b.portalSlug === portalSlug);
  const navItems = getNavItems(portalSlug);

  const isActive = (href: string) => {
    const base = appRoutes.branchPortal.byPortalSlug(portalSlug);
    if (href === base) return pathname === base;
    return pathname.startsWith(href);
  };

  return (
    <Sidebar collapsible="icon">
      {/* ── Header: branch name + switcher ── */}
      <SidebarHeader className="border-b">
        {branches.length > 1 ? (
          <BranchSwitcher
            branches={branches}
            currentSlug={portalSlug}
            currentBranch={currentBranch}
          />
        ) : (
          <div className="flex items-center gap-2 p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Store className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {currentBranch?.name ?? "Branch"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {currentBranch?.restaurantName ?? ""}
              </p>
            </div>
          </div>
        )}
      </SidebarHeader>

      {/* ── Content: nav items ── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Branch Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
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

        {/* Owner Console link */}
        <SidebarGroup>
          <SidebarGroupLabel>Organization</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Owner Console">
                  <Link href={appRoutes.organization.base}>
                    <Building2 className="size-4" />
                    <span>Owner Console</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
// BranchSwitcher — dropdown to switch between accessible branches
// ---------------------------------------------------------------------------

function BranchSwitcher({
  branches,
  currentSlug,
  currentBranch,
}: {
  branches: {
    id: string;
    name: string;
    portalSlug: string | null;
    restaurantName: string;
  }[];
  currentSlug: string;
  currentBranch: { name: string; restaurantName: string } | undefined;
}) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-sidebar-accent"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Store className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {currentBranch?.name ?? "Branch"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {currentBranch?.restaurantName ?? ""}
            </p>
          </div>
          <ChevronsUpDown className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {branches.map((b) => (
          <DropdownMenuItem
            key={b.id}
            onSelect={() => {
              if (b.portalSlug && b.portalSlug !== currentSlug) {
                router.push(appRoutes.branchPortal.byPortalSlug(b.portalSlug));
              }
            }}
            disabled={!b.portalSlug}
          >
            <Store className="mr-2 h-4 w-4" />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{b.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {b.restaurantName}
              </p>
            </div>
            {b.portalSlug === currentSlug && (
              <Check className="ml-auto h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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
