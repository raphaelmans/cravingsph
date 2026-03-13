"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Price } from "@/components/brand/price";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { CartItem } from "@/features/cart/stores/cart.store";

// --- Schema ---

const checkoutSchema = z.object({
  tableNumber: z.string().optional(),
  specialInstructions: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export interface CheckoutSubmitPayload {
  orderType: "dine-in";
  tableNumber: string | null;
  customerName: null;
  customerPhone: null;
  specialInstructions: string | null;
  items: CartItem[];
  subtotal: number;
}

interface CheckoutSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  onSubmit: (payload: CheckoutSubmitPayload) => void;
  isSubmitting: boolean;
}

// --- Component ---

export function CheckoutSheet({
  open,
  onOpenChange,
  items,
  subtotal,
  itemCount,
  onSubmit,
  isSubmitting,
}: CheckoutSheetProps) {
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      tableNumber: "",
      specialInstructions: "",
    },
  });

  const itemSummary = useMemo(
    () =>
      items.map((item) => {
        const parts = [item.name];
        if (item.variantName) parts.push(item.variantName);
        return `${item.quantity}x ${parts.join(" - ")}`;
      }),
    [items],
  );

  const handleSubmit = useCallback(
    (values: CheckoutFormValues) => {
      onSubmit({
        orderType: "dine-in",
        tableNumber: values.tableNumber?.trim() || null,
        customerName: null,
        customerPhone: null,
        specialInstructions: values.specialInstructions?.trim() || null,
        items,
        subtotal,
      });
    },
    [items, subtotal, onSubmit],
  );

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        form.reset();
      }
      onOpenChange(isOpen);
    },
    [form, onOpenChange],
  );

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Checkout</DrawerTitle>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-4">
          <Form {...form}>
            <form
              id="checkout-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Table number */}
              <FormField
                control={form.control}
                name="tableNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Table number</FormLabel>
                    <FormControl>
                      <Input shape="pill" placeholder="e.g. 5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Special instructions */}
              <FormField
                control={form.control}
                name="specialInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special requests or notes..."
                        className="resize-none rounded-xl"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Separator />

              {/* Order summary */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Order summary</h3>
                <ul className="space-y-1">
                  {itemSummary.map((line) => (
                    <li key={line} className="text-sm text-muted-foreground">
                      {line}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">
                    Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </span>
                  <Price amount={subtotal} />
                </div>
              </div>
            </form>
          </Form>
        </div>

        <DrawerFooter className="border-t">
          <Button
            type="submit"
            form="checkout-form"
            shape="pill"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Placing order..."
            ) : (
              <>
                Place Order{" "}
                <Price
                  amount={subtotal}
                  className="text-primary-foreground text-sm"
                />
              </>
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
