"use client";

import { LayoutDashboard, Rocket, Store, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { appRoutes } from "@/common/app-routes";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/organization", label: "Dashboard", icon: LayoutDashboard },
  { href: "/organization/restaurants", label: "Restaurants", icon: Store },
  { href: "/organization/get-started", label: "Setup", icon: Rocket },
  { href: appRoutes.ownerAccount.base, label: "Profile", icon: User },
] as const;

export function OwnerBottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/organization") return pathname === "/organization";
    return pathname.startsWith(href);
  }

  return (
    <nav
      data-slot="owner-bottom-nav"
      aria-label="Owner navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background pb-[max(0.25rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <div className="flex items-end justify-around px-2 pt-1">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-[3.5rem] flex-col items-center gap-0.5 py-1.5 transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
