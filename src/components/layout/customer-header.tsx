"use client";

import { Compass, Receipt, ScanLine, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { appRoutes } from "@/common/app-routes";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/features/auth/hooks/use-auth";
import { QrScannerModal } from "@/features/discovery/components/qr-scanner-modal";
import { cn } from "@/lib/utils";

interface CustomerHeaderProps {
  className?: string;
}

export function CustomerHeader({ className }: CustomerHeaderProps) {
  const pathname = usePathname();
  const { data: session, isLoading } = useSession();
  const [qrOpen, setQrOpen] = useState(false);

  const navItems = [
    { href: appRoutes.index.base, label: "Browse" },
    { href: appRoutes.search.base, label: "Search" },
    { href: appRoutes.guides.base, label: "Guides" },
  ] as const;

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  }

  return (
    <>
      <header
        data-slot="customer-header"
        className={cn(
          "sticky top-0 z-40 border-b bg-background/95 px-4 backdrop-blur md:px-6",
          className,
        )}
      >
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 md:h-16">
          <Link href="/" aria-label="Home">
            <Logo size="sm" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={isActive(item.href) ? "secondary" : "ghost"}
                size="sm"
                shape="pill"
                asChild
              >
                <Link href={item.href}>
                  {item.href === appRoutes.index.base ? (
                    <Compass className="size-4" />
                  ) : null}
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              shape="pill"
              className="hidden md:inline-flex"
              onClick={() => setQrOpen(true)}
            >
              <ScanLine className="size-4" />
              Scan
            </Button>

            {isLoading ? (
              <Skeleton className="size-9 rounded-full" />
            ) : session ? (
              <>
                <Button
                  variant={
                    isActive(appRoutes.orders.base) ? "secondary" : "ghost"
                  }
                  size="sm"
                  shape="pill"
                  className="hidden md:inline-flex"
                  asChild
                >
                  <Link href={appRoutes.orders.base}>
                    <Receipt className="size-4" />
                    Orders
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" shape="pill" asChild>
                  <Link href="/account" aria-label="Account">
                    <User className="size-5" />
                  </Link>
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" shape="pill" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <QrScannerModal open={qrOpen} onOpenChange={setQrOpen} />
    </>
  );
}
