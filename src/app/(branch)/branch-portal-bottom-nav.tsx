"use client";

import {
  ClipboardList,
  LayoutDashboard,
  Settings,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { appRoutes } from "@/common/app-routes";
import { cn } from "@/lib/utils";

function getTabs(portalSlug: string) {
  return [
    {
      href: appRoutes.branchPortal.byPortalSlug(portalSlug),
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      href: appRoutes.branchPortal.orders(portalSlug),
      label: "Orders",
      icon: ClipboardList,
    },
    {
      href: appRoutes.branchPortal.menu(portalSlug),
      label: "Menu",
      icon: UtensilsCrossed,
    },
    {
      href: appRoutes.branchPortal.tables(portalSlug),
      label: "Tables",
      icon: Store,
    },
    {
      href: appRoutes.branchPortal.settings(portalSlug),
      label: "Settings",
      icon: Settings,
    },
  ];
}

export function BranchPortalBottomNav() {
  const pathname = usePathname();
  const params = useParams<{ portalSlug: string }>();
  const portalSlug = params.portalSlug;
  const tabs = getTabs(portalSlug);

  function isActive(href: string) {
    const base = appRoutes.branchPortal.byPortalSlug(portalSlug);
    if (href === base) return pathname === base;
    return pathname.startsWith(href);
  }

  return (
    <nav
      data-slot="branch-portal-bottom-nav"
      aria-label="Branch navigation"
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
              <span className="text-[0.625rem] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
