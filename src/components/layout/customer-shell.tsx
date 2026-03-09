import { cn } from "@/lib/utils";

interface CustomerShellProps {
  children: React.ReactNode;
  className?: string;
}

export function CustomerShell({ children, className }: CustomerShellProps) {
  return (
    <div
      data-slot="customer-shell"
      className={cn("flex min-h-svh flex-col bg-background", className)}
    >
      <main className="flex-1">{children}</main>
    </div>
  );
}
