"use client";

import { ArrowRight, ScanLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrScannerModal } from "./qr-scanner-modal";

export function HeroSection() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [qrOpen, setQrOpen] = useState(false);

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
    <>
      <section
        data-slot="hero-section"
        className="relative overflow-hidden border-b border-primary/10 bg-linear-to-br from-peach via-background to-background"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 size-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 size-72 rounded-full bg-peach blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-8 md:pb-10 md:pt-10">
          <div className="space-y-6">
            <div className="space-y-3">
              <Logo size="lg" />
              <h1 className="max-w-3xl font-heading text-3xl font-semibold tracking-tight text-balance text-foreground md:text-4xl">
                Find nearby food, scan a table QR, and order.
              </h1>
              <p className="max-w-xl text-sm leading-7 text-muted-foreground">
                Browse menus, place dine-in orders, and track everything in one
                flow.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="w-full max-w-xl"
              aria-label="Search restaurants"
            >
              <div className="flex flex-col gap-3 rounded-4xl border border-primary/15 bg-background/90 p-3 shadow-sm sm:flex-row sm:items-center">
                <Input
                  ref={inputRef}
                  type="search"
                  placeholder="Search restaurants, dishes, or cravings..."
                  aria-label="Search restaurants and dishes"
                  shape="pill"
                  className="h-12 flex-1 border-none bg-muted/60 pl-4 shadow-none"
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    shape="pill"
                    size="lg"
                    className="flex-1 sm:flex-none"
                  >
                    Browse
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    shape="pill"
                    size="lg"
                    onClick={() => setQrOpen(true)}
                    aria-label="Scan restaurant QR code"
                  >
                    <ScanLine className="size-4" />
                    Scan
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      <QrScannerModal open={qrOpen} onOpenChange={setQrOpen} />
    </>
  );
}
