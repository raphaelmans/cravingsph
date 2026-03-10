"use client";

import { CircleCheckBig } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface OrderConfirmationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
  branchSlug: string;
  onPayment?: () => void;
}

export function OrderConfirmationSheet({
  open,
  onOpenChange,
  orderId,
  branchSlug,
  onPayment,
}: OrderConfirmationSheetProps) {
  const router = useRouter();

  const handleViewStatus = useCallback(() => {
    if (!orderId) return;
    onOpenChange(false);
    router.push(`/restaurant/${branchSlug}/order/${orderId}`);
  }, [orderId, branchSlug, onOpenChange, router]);

  const handlePayment = useCallback(() => {
    onOpenChange(false);
    onPayment?.();
  }, [onOpenChange, onPayment]);

  const handleDone = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="sr-only">
          <DrawerTitle>Order Confirmation</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col items-center gap-4 px-6 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CircleCheckBig className="h-8 w-8 text-success" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold">Order Placed!</h2>
            <p className="text-sm text-muted-foreground">
              Your order has been sent to the restaurant.
            </p>
          </div>

          {orderId && (
            <div className="rounded-xl bg-muted px-4 py-4">
              <p className="text-xs text-muted-foreground">Order ID</p>
              <p className="font-mono text-lg font-semibold">#{orderId}</p>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Please wait for the restaurant to confirm your order. You&apos;ll be
            able to track your order status and complete payment on the next
            screen.
          </p>
        </div>

        <DrawerFooter className="gap-2">
          {onPayment && (
            <Button shape="pill" size="lg" onClick={handlePayment}>
              Upload Payment Proof
            </Button>
          )}
          <Button
            shape="pill"
            size="lg"
            variant={onPayment ? "outline" : "default"}
            onClick={handleViewStatus}
          >
            View Order Status
          </Button>
          <Button shape="pill" size="lg" variant="ghost" onClick={handleDone}>
            Back to Menu
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
