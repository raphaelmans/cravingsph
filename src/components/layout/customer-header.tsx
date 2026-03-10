"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/features/auth/hooks/use-auth";
import { cn } from "@/lib/utils";

interface CustomerHeaderProps {
  className?: string;
}

export function CustomerHeader({ className }: CustomerHeaderProps) {
  const { data: session, isLoading } = useSession();

  return (
    <header
      data-slot="customer-header"
      className={cn(
        "sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4",
        className,
      )}
    >
      <Link href="/" aria-label="Home">
        <Logo size="sm" />
      </Link>

      <div className="flex items-center gap-2">
        {isLoading ? (
          <Skeleton className="size-9 rounded-full" />
        ) : session ? (
          <Button variant="ghost" size="icon" shape="pill" asChild>
            <Link href="/account" aria-label="Account">
              <User className="size-5" />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" shape="pill" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
