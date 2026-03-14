"use client";

import {
  BookOpen,
  Compass,
  Heart,
  LogOut,
  Receipt,
  ScanLine,
  Search,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { appRoutes } from "@/common/app-routes";
import { Logo } from "@/components/brand/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { QrScannerModal } from "@/features/discovery/components/qr-scanner-modal";

// ---------------------------------------------------------------------------
// Nav item definitions
// ---------------------------------------------------------------------------

const browseItems = [
  { label: "Browse", icon: Compass, href: appRoutes.index.base },
  { label: "Search", icon: Search, href: appRoutes.search.base },
  { label: "Guides", icon: BookOpen, href: appRoutes.guides.base },
];

const accountItems = [
  { label: "Orders", icon: Receipt, href: appRoutes.orders.base },
  { label: "Saved", icon: Heart, href: appRoutes.saved.base },
  { label: "Account", icon: User, href: appRoutes.customerAccount.base },
];

// ---------------------------------------------------------------------------
// Main sidebar
// ---------------------------------------------------------------------------

export function CustomerSidebar() {
  const pathname = usePathname();
  const { data: session, isLoading } = useSession();
  const [qrOpen, setQrOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b p-4">
          <Link href="/" aria-label="Home">
            <Logo size="sm" />
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Discover</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {browseItems.map((item) => (
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

          {!isLoading && session && (
            <SidebarGroup>
              <SidebarGroupLabel>Your account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {accountItems.map((item) => (
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
          )}

          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Scan QR"
                    onClick={() => setQrOpen(true)}
                  >
                    <ScanLine className="size-4" />
                    <span>Scan QR</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter>
          {isLoading ? null : session ? (
            <NavUser email={session.email} />
          ) : (
            <div className="p-2">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          )}
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <QrScannerModal open={qrOpen} onOpenChange={setQrOpen} />
    </>
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
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{email}</p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuItem asChild>
          <Link href={appRoutes.customerAccount.base}>
            <User className="mr-2 h-4 w-4" />
            Account
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
