"use client";

import { Banknote } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { OrderType } from "@/features/checkout/components/order-type-selector";
import { PaymentCountdown } from "./payment-countdown";
import { type PaymentMethod, PaymentMethodCard } from "./payment-method-card";
import {
  PaymentProofForm,
  type PaymentProofSubmitPayload,
} from "./payment-proof-form";

// --- Stubbed payment methods (replaced by real data when backend exists) ---

const STUB_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "pm-gcash",
    type: "gcash",
    accountName: "Cravings PH",
    accountNumber: "0917 123 4567",
    isDefault: true,
  },
  {
    id: "pm-maya",
    type: "maya",
    accountName: "Cravings PH",
    accountNumber: "0918 765 4321",
    isDefault: false,
  },
  {
    id: "pm-bank",
    type: "bank",
    accountName: "Cravings PH Inc.",
    accountNumber: "1234 5678 9012",
    bankName: "BDO",
    isDefault: false,
  },
];

interface PaymentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderType: OrderType;
  orderId: string | null;
  countdownMinutes?: number;
}

export function PaymentSheet({
  open,
  onOpenChange,
  orderType,
  orderId,
  countdownMinutes = 15,
}: PaymentSheetProps) {
  const [isExpired, setIsExpired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExpired = useCallback(() => {
    setIsExpired(true);
  }, []);

  const handleProofSubmit = useCallback(
    async (_payload: PaymentProofSubmitPayload) => {
      setIsSubmitting(true);
      try {
        // TODO: Replace with order.submitPaymentProof tRPC mutation
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success("Payment proof submitted!");
        onOpenChange(false);
      } catch {
        toast.error("Failed to submit payment proof. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [onOpenChange],
  );

  const handleCashPayment = useCallback(() => {
    toast.success("Cash payment selected. Pay at the counter.");
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Complete Payment</DrawerTitle>
          {orderId && (
            <p className="text-sm text-muted-foreground">Order #{orderId}</p>
          )}
        </DrawerHeader>

        <ScrollArea className="max-h-[60vh] px-4">
          <div className="space-y-4 pb-4">
            <PaymentCountdown
              durationMinutes={countdownMinutes}
              onExpired={handleExpired}
            />

            <div className="space-y-2">
              <p className="text-sm font-medium">Send payment to:</p>
              {STUB_PAYMENT_METHODS.map((method) => (
                <PaymentMethodCard key={method.id} method={method} />
              ))}
            </div>

            <Separator />

            <PaymentProofForm
              onSubmit={handleProofSubmit}
              isSubmitting={isSubmitting}
              disabled={isExpired}
            />

            {orderType === "dine-in" && (
              <>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Separator className="flex-1" />
                  <span>or</span>
                  <Separator className="flex-1" />
                </div>

                <Button
                  variant="outline"
                  shape="pill"
                  size="lg"
                  className="w-full"
                  onClick={handleCashPayment}
                  disabled={isExpired}
                >
                  <Banknote className="mr-2 size-5" />
                  Pay with Cash at Counter
                </Button>
              </>
            )}
          </div>
        </ScrollArea>

        <DrawerFooter />
      </DrawerContent>
    </Drawer>
  );
}
