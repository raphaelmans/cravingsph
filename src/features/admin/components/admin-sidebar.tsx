"use client";

import { LayoutDashboard, Store, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { appRoutes } from "@/common/app-routes";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAdminDashboardOverview } from "@/features/admin/hooks/use-admin-portal";

const navItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: appRoutes.admin.base,
  },
  {
    label: "Invitations",
    icon: UserPlus,
    href: appRoutes.admin.invitations,
  },
  {
    label: "Restaurants",
    icon: Store,
    href: appRoutes.admin.restaurants,
  },
  {
    label: "Users",
    icon: Users,
    href: appRoutes.admin.users,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data } = useAdminDashboardOverview();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <span className="text-sm font-semibold text-muted-foreground group-data-[collapsible=icon]:hidden">
          Admin
        </span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isDashboard = item.href === appRoutes.admin.base;
                const showBadge = false;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        isDashboard
                          ? pathname === item.href
                          : pathname.startsWith(item.href)
                      }
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>

                    {showBadge && (data?.pendingVerifications ?? 0) > 0 ? (
                      <SidebarMenuBadge>
                        {data?.pendingVerifications}
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />

      <SidebarRail />
    </Sidebar>
  );
}
