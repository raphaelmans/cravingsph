"use client";

import {
  Building2,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Rocket,
  ShieldCheck,
  Store,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { appRoutes } from "@/common/app-routes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useLogout, useSession } from "@/features/auth/hooks/use-auth";
import {
  useBranches,
  useOrganization,
  useRestaurants,
} from "@/features/owner/hooks/use-owner-sidebar-data";

// ---------------------------------------------------------------------------
// Nav item definitions
// ---------------------------------------------------------------------------

const setupItems = [
  { label: "Get Started", icon: Rocket, href: "/organization/get-started" },
];

const overviewItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/organization" },
];

const financeItems = [
  { label: "Payments", icon: CreditCard, href: "/organization/payments" },
];

const orgItems = [
  {
    label: "Verification",
    icon: ShieldCheck,
    href: appRoutes.organization.verify,
  },
];

const accountItems = [
  { label: "Profile", icon: User, href: appRoutes.ownerAccount.base },
];

// ---------------------------------------------------------------------------
// Main sidebar
// ---------------------------------------------------------------------------

export function OwnerSidebar() {
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

      {/* ── Content: nav groups ── */}
      <SidebarContent>
        <NavGroup items={setupItems} label="Setup" isActive={isActive} />
        <NavGroup items={overviewItems} label="Overview" isActive={isActive} />

        {/* Restaurants group with collapsible hierarchy */}
        <RestaurantsGroup
          organizationId={organization?.id}
          pathname={pathname}
        />

        <NavGroup items={financeItems} label="Finance" isActive={isActive} />
        <NavGroup items={orgItems} label="Organization" isActive={isActive} />
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
// RestaurantsGroup — collapsible Restaurant → Branch hierarchy
// ---------------------------------------------------------------------------

function RestaurantsGroup({
  organizationId,
  pathname,
}: {
  organizationId: string | undefined;
  pathname: string;
}) {
  const { data: restaurants = [], isLoading } = useRestaurants(organizationId);

  const isRestaurantsSectionActive = pathname.startsWith(
    "/organization/restaurants",
  );

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Restaurants</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <Collapsible
            defaultOpen={isRestaurantsSectionActive}
            className="group/restaurants"
          >
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/organization/restaurants"}
                tooltip="Restaurants"
              >
                <Link href="/organization/restaurants">
                  <Store className="size-4" />
                  <span>Restaurants</span>
                </Link>
              </SidebarMenuButton>
              {(restaurants.length > 0 || isLoading) && (
                <CollapsibleTrigger asChild>
                  <SidebarMenuAction className="data-[state=open]:rotate-90">
                    <ChevronRight className="size-4" />
                  </SidebarMenuAction>
                </CollapsibleTrigger>
              )}
              <CollapsibleContent>
                <SidebarMenuSub>
                  {isLoading ? (
                    <>
                      <SidebarMenuSubItem>
                        <SidebarMenuSkeleton />
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSkeleton />
                      </SidebarMenuSubItem>
                    </>
                  ) : (
                    restaurants.map((restaurant) => (
                      <RestaurantSubItem
                        key={restaurant.id}
                        restaurant={restaurant}
                        pathname={pathname}
                      />
                    ))
                  )}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

// ---------------------------------------------------------------------------
// RestaurantSubItem — single restaurant with nested branches
// ---------------------------------------------------------------------------

function RestaurantSubItem({
  restaurant,
  pathname,
}: {
  restaurant: { id: string; name: string };
  pathname: string;
}) {
  const { data: branches = [], isLoading } = useBranches(restaurant.id);

  const restaurantBasePath = `/organization/restaurants/${restaurant.id}`;
  const isRestaurantActive = pathname.startsWith(restaurantBasePath);

  const getBranchPath = (branchId: string) =>
    `${restaurantBasePath}/branches/${branchId}/menu`;

  const isBranchActive = (branchId: string) =>
    pathname.startsWith(`${restaurantBasePath}/branches/${branchId}`);

  return (
    <Collapsible defaultOpen={isRestaurantActive} className="group/restaurant">
      <SidebarMenuSubItem>
        <SidebarMenuSubButton
          asChild
          isActive={pathname === restaurantBasePath}
        >
          <Link href={restaurantBasePath}>
            <span className="truncate">{restaurant.name}</span>
          </Link>
        </SidebarMenuSubButton>
        {(branches.length > 0 || isLoading) && (
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="ml-auto inline-flex h-5 w-5 items-center justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground"
            >
              <ChevronRight className="size-3 transition-transform group-data-[state=open]/restaurant:rotate-90" />
            </button>
          </CollapsibleTrigger>
        )}
        <CollapsibleContent>
          <SidebarMenuSub>
            {isLoading ? (
              <SidebarMenuSubItem>
                <SidebarMenuSkeleton />
              </SidebarMenuSubItem>
            ) : (
              branches.map((branch) => (
                <SidebarMenuSubItem key={branch.id}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isBranchActive(branch.id)}
                  >
                    <Link href={getBranchPath(branch.id)}>
                      <span className="truncate">{branch.name}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuSubItem>
    </Collapsible>
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
