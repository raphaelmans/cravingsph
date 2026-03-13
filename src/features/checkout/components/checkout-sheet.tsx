"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { CartItem } from "@/features/cart/stores/cart.store";
import { useTRPC } from "@/trpc/client";

// --- Schema ---

const checkoutSchema = z.object({
  tableSessionId: z.string().optional(),
  specialInstructions: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export interface CheckoutSubmitPayload {
  orderType: "dine-in";
  tableSessionId: string | null;
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
  branchId?: string;
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
  branchId,
}: CheckoutSheetProps) {
  const trpc = useTRPC();

  const tablesQuery = useQuery(
    trpc.branch.listActiveTables.queryOptions(
      { branchId: branchId! },
      { enabled: !!branchId && open },
    ),
  );

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      tableSessionId: "",
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
        tableSessionId: values.tableSessionId?.trim() || null,
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

  const tables = tablesQuery.data ?? [];

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
              {/* Table selection */}
              <FormField
                control={form.control}
                name="tableSessionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Table</FormLabel>
                    <FormControl>
                      {tablesQuery.isLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading tables...
                        </div>
                      ) : tables.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">
                          No tables available
                        </p>
                      ) : (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="rounded-full">
                            <SelectValue placeholder="Select a table" />
                          </SelectTrigger>
                          <SelectContent>
                            {tables.map((table) => (
                              <SelectItem
                                key={table.activeSessionId}
                                value={table.activeSessionId}
                              >
                                {table.label} ({table.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
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
