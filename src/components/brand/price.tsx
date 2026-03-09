import { cn } from "@/lib/utils"

interface PriceProps {
  amount: number
  currency?: string
  className?: string
}

export function Price({
  amount,
  currency = "₱",
  className,
}: PriceProps) {
  return (
    <span
      data-slot="price"
      className={cn("text-primary font-semibold tabular-nums", className)}
    >
      {currency}
      {amount.toLocaleString("en-PH")}
    </span>
  )
}
