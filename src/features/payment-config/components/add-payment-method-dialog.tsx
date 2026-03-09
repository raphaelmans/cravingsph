"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  PAYMENT_METHOD_TYPES,
  type PaymentMethodConfig,
  type PaymentMethodInput,
} from "../hooks/use-payment-config";

const PaymentMethodFormSchema = z
  .object({
    type: z.enum(PAYMENT_METHOD_TYPES),
    accountName: z
      .string()
      .min(1, "Account name is required")
      .max(120, "Account name must be 120 characters or fewer"),
    accountNumber: z
      .string()
      .min(1, "Account number is required")
      .max(80, "Account number must be 80 characters or fewer"),
    bankName: z.string().max(80, "Bank name must be 80 characters or fewer"),
    isDefault: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.type === "bank" && value.bankName.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bankName"],
        message: "Bank name is required for bank transfers",
      });
    }
  });

export type PaymentMethodFormValues = z.infer<typeof PaymentMethodFormSchema>;

interface AddPaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PaymentMethodInput) => void;
  initialValues?: PaymentMethodConfig | null;
  mode?: "add" | "edit";
}

const defaultValues: PaymentMethodFormValues = {
  type: "gcash",
  accountName: "",
  accountNumber: "",
  bankName: "",
  isDefault: false,
};

function getFormValues(
  initialValues?: PaymentMethodConfig | null,
): PaymentMethodFormValues {
  if (!initialValues) {
    return defaultValues;
  }

  return {
    type: initialValues.type,
    accountName: initialValues.accountName,
    accountNumber: initialValues.accountNumber,
    bankName: initialValues.bankName ?? "",
    isDefault: initialValues.isDefault,
  };
}

export function AddPaymentMethodDialog({
  open,
  onOpenChange,
  onSubmit,
  initialValues,
  mode = "add",
}: AddPaymentMethodDialogProps) {
  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(PaymentMethodFormSchema),
    defaultValues: getFormValues(initialValues),
  });

  const selectedType = form.watch("type");

  useEffect(() => {
    if (open) {
      form.reset(getFormValues(initialValues));
    }
  }, [form, initialValues, open]);

  function handleSubmit(values: PaymentMethodFormValues) {
    onSubmit({
      ...values,
      accountName: values.accountName.trim(),
      accountNumber: values.accountNumber.trim(),
      bankName:
        values.type === "bank"
          ? values.bankName.trim() || undefined
          : undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit payment method" : "Add payment method"}
          </DialogTitle>
          <DialogDescription>
            Configure the account details customers will see when they pay
            manually.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Method type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="gcash">GCash</SelectItem>
                      <SelectItem value="maya">Maya</SelectItem>
                      <SelectItem value="bank">Bank transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose how customers will send payment proofs.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account name</FormLabel>
                  <FormControl>
                    <Input placeholder="Cravings PH" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType === "bank" ? (
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank name</FormLabel>
                    <FormControl>
                      <Input placeholder="BDO, BPI, UnionBank" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {selectedType === "bank"
                      ? "Account number"
                      : "Mobile number"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        selectedType === "bank"
                          ? "1234 5678 9012"
                          : "0917 123 4567"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This value is shown directly in checkout and payment proof
                    flows.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4">
                  <div className="space-y-1">
                    <FormLabel>Set as default</FormLabel>
                    <FormDescription>
                      Default methods appear first during checkout.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {mode === "edit" ? "Save changes" : "Add method"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
