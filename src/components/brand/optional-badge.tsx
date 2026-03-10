import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OptionalBadgeProps {
  label?: string;
  className?: string;
}

export function OptionalBadge({
  label = "Optional",
  className,
}: OptionalBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("border-primary text-primary text-xs", className)}
    >
      {label}
    </Badge>
  );
}
