"use client";

import { CheckCircle2, CreditCard, Plus, WalletCards } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddPaymentMethodDialog } from "@/features/payment-config/components/add-payment-method-dialog";
import { PaymentMethodCard } from "@/features/payment-config/components/payment-method-card";
import {
  type PaymentMethodConfig,
  type PaymentMethodInput,
  usePaymentConfig,
} from "@/features/payment-config/hooks/use-payment-config";

export default function OwnerPaymentsPage() {
  const {
    methods,
    totalMethods,
    defaultMethod,
    addMethod,
    updateMethod,
    removeMethod,
    setDefaultMethod,
  } = usePaymentConfig();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editingMethod, setEditingMethod] =
    useState<PaymentMethodConfig | null>(null);

  const enabledTypes = new Set(methods.map((method) => method.type));
  const defaultMethodLabel = defaultMethod
    ? (defaultMethod.bankName ??
      (defaultMethod.type === "gcash"
        ? "GCash"
        : defaultMethod.type === "maya"
          ? "Maya"
          : "Bank Transfer"))
    : "None";

  function handleAddClick() {
    setDialogMode("add");
    setEditingMethod(null);
    setIsDialogOpen(true);
  }

  function handleEditClick(method: PaymentMethodConfig) {
    setDialogMode("edit");
    setEditingMethod(method);
    setIsDialogOpen(true);
  }

  function handleDialogSubmit(values: PaymentMethodInput) {
    if (dialogMode === "edit" && editingMethod) {
      updateMethod(editingMethod.id, values);
      toast.success("Payment method updated");
      return;
    }

    addMethod(values);
    toast.success("Payment method added");
  }

  function handleRemove(methodId: string) {
    removeMethod(methodId);
    toast.success("Payment method removed");
  }

  function handleSetDefault(methodId: string) {
    setDefaultMethod(methodId);
    toast.success("Default payment method updated");
  }

  return (
    <>
      <DashboardNavbar
        breadcrumbs={[
          { label: "Dashboard", href: "/organization" },
          { label: "Payments" },
        ]}
        actions={
          <Button onClick={handleAddClick}>
            <Plus className="size-4" />
            Add payment method
          </Button>
        }
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Payment Methods
            </h1>
            <Badge variant="secondary">{totalMethods} configured</Badge>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Configure the wallets and bank accounts customers can use for manual
            transfers. The default method is shown first across checkout and
            payment proof review flows.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Accepted methods
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <WalletCards className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{totalMethods}</p>
                <p className="text-sm text-muted-foreground">
                  Wallets and bank accounts ready for checkout
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Checkout default
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{defaultMethodLabel}</p>
                <p className="text-sm text-muted-foreground">
                  {defaultMethod
                    ? "Preferred option shown first to customers"
                    : "Add a method to choose a checkout default"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CreditCard className="size-5" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={enabledTypes.has("gcash") ? "default" : "outline"}
                >
                  GCash
                </Badge>
                <Badge
                  variant={enabledTypes.has("maya") ? "default" : "outline"}
                >
                  Maya
                </Badge>
                <Badge
                  variant={enabledTypes.has("bank") ? "default" : "outline"}
                >
                  Bank Transfer
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Configured accounts</h2>
              <p className="text-sm text-muted-foreground">
                Edit details, pick a default, or remove methods you no longer
                accept.
              </p>
            </div>
          </div>

          {methods.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <WalletCards className="size-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold">
                    No payment methods yet
                  </p>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Add at least one payment option so customers know where to
                    send manual transfers.
                  </p>
                </div>
                <Button onClick={handleAddClick}>
                  <Plus className="size-4" />
                  Add your first method
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {methods.map((method) => (
                <PaymentMethodCard
                  key={method.id}
                  method={method}
                  onEdit={handleEditClick}
                  onSetDefault={handleSetDefault}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddPaymentMethodDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleDialogSubmit}
        initialValues={editingMethod}
        mode={dialogMode}
      />
    </>
  );
}
