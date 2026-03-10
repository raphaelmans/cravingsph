"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SubpageHeaderProps {
  title: string;
  label?: string;
  className?: string;
}

export function SubpageHeader({ title, label, className }: SubpageHeaderProps) {
  const router = useRouter();

  return (
    <header
      data-slot="subpage-header"
      className={cn(
        "sticky top-0 z-40 border-b border-primary/10 bg-background/90 backdrop-blur",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-4xl items-center gap-4 px-4 py-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex size-10 items-center justify-center rounded-full border border-primary/10 bg-background text-primary transition-colors hover:bg-primary/5"
          aria-label="Go back"
        >
          <ArrowLeft className="size-5" />
        </button>

        <div>
          {label && (
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary">
              {label}
            </p>
          )}
          <h1 className="font-heading text-xl font-bold">{title}</h1>
        </div>
      </div>
    </header>
  );
}
