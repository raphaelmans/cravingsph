"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useRef } from "react";
import { Logo } from "@/components/brand/logo";
import { Input } from "@/components/ui/input";

export function HeroSection() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const query = inputRef.current?.value.trim();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/search");
    }
  }

  return (
    <section
      data-slot="hero-section"
      className="flex flex-col items-center gap-3 bg-peach px-6 pb-8 pt-12"
    >
      <Logo size="lg" />
      <div className="space-y-1 text-center">
        <p className="font-heading text-xl font-bold text-peach-foreground">
          Discover local restaurants
        </p>
        <p className="text-sm text-peach-foreground/70">
          Browse menus, order dine-in or pickup
        </p>
      </div>
      <form onSubmit={handleSubmit} className="mt-1 w-full max-w-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search restaurants or dishes..."
            shape="pill"
            className="pl-10"
          />
        </div>
      </form>
    </section>
  );
}
