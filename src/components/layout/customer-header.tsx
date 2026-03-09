"use client";

import { ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CustomerHeaderProps {
  showCart?: boolean;
  showAuth?: boolean;
  cartCount?: number;
  onCartClick?: () => void;
  className?: string;
}

export function CustomerHeader({
  showCart = true,
  showAuth = false,
  cartCount = 0,
  onCartClick,
  className,
}: CustomerHeaderProps) {
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
        {showCart && (
          <Button
            variant="default"
            size="sm"
            shape="pill"
            onClick={onCartClick}
            className="relative gap-1.5"
          >
            <ShoppingCart className="size-4" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-background text-xs font-semibold text-primary">
                {cartCount}
              </span>
            )}
          </Button>
        )}

        {showAuth && (
          <Button variant="ghost" size="icon" shape="pill" asChild>
            <Link href="/login" aria-label="Sign in">
              <User className="size-5" />
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
