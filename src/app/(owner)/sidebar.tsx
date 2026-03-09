"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Rocket,
  Settings,
  ShieldCheck,
  Store,
  User,
  Users,
} from "lucide-react"

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
} from "@/components/ui/sidebar"
import { Logo } from "@/components/brand/logo"

const overviewItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/organization" },
]

const setupItems = [
  { label: "Get Started", icon: Rocket, href: "/organization/get-started" },
]

const orderItems = [
  { label: "Orders", icon: ClipboardList, href: "/organization/orders" },
]

const financeItems = [
  { label: "Payments", icon: CreditCard, href: "/organization/payments" },
]

const orgItems = [
  { label: "Team", icon: Users, href: "/organization/team" },
  {
    label: "Verification",
    icon: ShieldCheck,
    href: "/organization/verification",
  },
  { label: "Settings", icon: Settings, href: "/organization/settings" },
]

const accountItems = [
  { label: "Profile", icon: User, href: "/organization/profile" },
]

export function OwnerSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/organization">
          <Logo size="sm" />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup items={setupItems} label="Setup" pathname={pathname} />
        <NavGroup items={overviewItems} label="Overview" pathname={pathname} />
        <NavGroup
          items={[{ label: "Restaurants", icon: Store, href: "/organization/restaurants" }]}
          label="Restaurants"
          pathname={pathname}
        />
        <NavGroup items={orderItems} label="Orders" pathname={pathname} />
        <NavGroup items={financeItems} label="Finance" pathname={pathname} />
        <NavGroup items={orgItems} label="Organization" pathname={pathname} />
        <NavGroup items={accountItems} label="Account" pathname={pathname} />
      </SidebarContent>

      <SidebarFooter>
        {/* TODO: NavUser component with user info + logout */}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

function NavGroup({
  items,
  label,
  pathname,
}: {
  items: { label: string; icon: React.ComponentType<{ className?: string }>; href: string }[]
  label: string
  pathname: string
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
                isActive={
                  item.href === "/organization"
                    ? pathname === "/organization"
                    : pathname.startsWith(item.href)
                }
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
  )
}
