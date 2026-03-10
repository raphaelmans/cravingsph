import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RequiredBadgeProps {
  label?: string;
  className?: string;
}

export function RequiredBadge({
  label = "Required",
  className,
}: RequiredBadgeProps) {
  return (
    <Badge variant="default" className={cn("text-xs", className)}>
      {label}
    </Badge>
  );
}
