import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface OptionalBadgeProps {
  label?: string
  className?: string
}

export function OptionalBadge({
  label = "Optional",
  className,
}: OptionalBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("border-primary text-primary text-[10px]", className)}
    >
      {label}
    </Badge>
  )
}
