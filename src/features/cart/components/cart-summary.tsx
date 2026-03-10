import { Price } from "@/components/brand/price";
import { Separator } from "@/components/ui/separator";

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
}

export function CartSummary({ subtotal, itemCount }: CartSummaryProps) {
  const itemLabel = itemCount === 1 ? "item" : "items";

  return (
    <div data-slot="cart-summary">
      <Separator />
      <div className="flex items-center justify-between px-4 py-4">
        <div className="text-sm text-muted-foreground">
          Subtotal ({itemCount} {itemLabel})
        </div>
        <Price amount={subtotal} className="text-base" />
      </div>
    </div>
  );
}
