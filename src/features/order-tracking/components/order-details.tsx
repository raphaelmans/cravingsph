import { Price } from "@/components/brand/price";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// --- Types (mirrored from checkout payload until backend provides them) ---

export interface OrderItem {
  name: string;
  variantName: string | null;
  modifiers: string[];
  quantity: number;
  unitPrice: number;
}

export type PaymentStatus = "pending" | "submitted" | "confirmed" | "rejected";

interface OrderDetailsProps {
  orderId: string;
  orderType: "dine-in" | "pickup";
  tableNumber?: string | null;
  customerName?: string | null;
  items: OrderItem[];
  subtotal: number;
  specialInstructions?: string | null;
  paymentStatus: PaymentStatus;
  onUploadPayment?: () => void;
}

const PAYMENT_BADGE_MAP: Record<
  PaymentStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  pending: { label: "Payment Pending", variant: "outline" },
  submitted: { label: "Proof Submitted", variant: "secondary" },
  confirmed: { label: "Paid", variant: "default" },
  rejected: { label: "Payment Rejected", variant: "destructive" },
};

export function OrderDetails({
  orderId,
  orderType,
  tableNumber,
  customerName,
  items,
  subtotal,
  specialInstructions,
  paymentStatus,
}: OrderDetailsProps) {
  const paymentBadge = PAYMENT_BADGE_MAP[paymentStatus];

  return (
    <Card data-slot="order-details">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Order #{orderId}</CardTitle>
          <Badge variant={paymentBadge.variant}>{paymentBadge.label}</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="capitalize">{orderType}</span>
          {orderType === "dine-in" && tableNumber && (
            <>
              <span>·</span>
              <span>Table {tableNumber}</span>
            </>
          )}
          {orderType === "pickup" && customerName && (
            <>
              <span>·</span>
              <span>{customerName}</span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Item list */}
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={`${item.name}-${index}`}
              className="flex justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {item.quantity}× {item.name}
                </p>
                {(item.variantName || item.modifiers.length > 0) && (
                  <p className="text-xs text-muted-foreground truncate">
                    {[item.variantName, ...item.modifiers]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>
              <Price
                amount={item.unitPrice * item.quantity}
                className="text-sm shrink-0"
              />
            </li>
          ))}
        </ul>

        {specialInstructions && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Special Instructions
              </p>
              <p className="text-sm">{specialInstructions}</p>
            </div>
          </>
        )}

        <Separator />

        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Subtotal</p>
          <Price amount={subtotal} className="text-base" />
        </div>
      </CardContent>
    </Card>
  );
}
