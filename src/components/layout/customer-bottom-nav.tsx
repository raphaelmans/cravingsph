"use client";

import { Home, Receipt, ScanLine, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { appRoutes } from "@/common/app-routes";
import { QrScannerModal } from "@/features/discovery/components/qr-scanner-modal";
import { cn } from "@/lib/utils";

const tabs = [
  { href: appRoutes.index.base, label: "Home", icon: Home },
  { href: appRoutes.orders.base, label: "Orders", icon: Receipt },
  { href: "__qr__", label: "Scan", icon: ScanLine },
  { href: appRoutes.customerAccount.base, label: "Account", icon: User },
] as const;

export function CustomerBottomNav() {
  const pathname = usePathname();
  const [qrOpen, setQrOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <>
      <nav
        data-slot="customer-bottom-nav"
        aria-label="Main navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background pb-[max(0.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-end justify-around px-2 pt-1">
          {tabs.map((tab) => {
            if (tab.href === "__qr__") {
              return (
                <button
                  key="qr"
                  type="button"
                  onClick={() => setQrOpen(true)}
                  className="-mt-4 flex flex-col items-center gap-0.5"
                  aria-label="Scan QR code"
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                    <ScanLine className="size-5" />
                  </span>
                  <span className="text-xs font-medium text-primary">
                    {tab.label}
                  </span>
                </button>
              );
            }

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

      <QrScannerModal open={qrOpen} onOpenChange={setQrOpen} />
    </>
  );
}
