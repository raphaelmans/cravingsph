import { cn } from "@/lib/utils";

const sizes = {
  sm: "text-xl",
  default: "text-3xl",
  lg: "text-5xl",
  xl: "text-7xl",
} as const;

type LogoSize = keyof typeof sizes;

interface LogoProps {
  size?: LogoSize;
  className?: string;
}

export function Logo({ size = "default", className }: LogoProps) {
  return (
    <span
      aria-label="cravings"
      role="img"
      className={cn(
        "inline-flex items-baseline font-display font-bold tracking-tight text-primary select-none",
        sizes[size],
        className,
      )}
    >
      crav
      <span className="relative inline-block">
        <span aria-hidden="true">ı</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[0.3em] h-[0.3em]"
        >
          <circle cx="10" cy="10" r="10" fill="currentColor" />
          <circle
            cx="10"
            cy="10"
            r="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.3"
          />
        </svg>
      </span>
      ngs
    </span>
  );
}
