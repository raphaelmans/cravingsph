"use client";

import {
  CreditCard,
  Landmark,
  MoreHorizontal,
  Pencil,
  Smartphone,
  Star,
  Trash2,
  Wallet,
} from "lucide-react";
import type { ComponentType } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  PaymentMethodConfig,
  PaymentMethodType,
} from "../hooks/use-payment-config";

interface PaymentMethodCardProps {
  method: PaymentMethodConfig;
  onEdit: (method: PaymentMethodConfig) => void;
  onSetDefault: (methodId: string) => void;
  onRemove: (methodId: string) => void;
}

const methodLabels: Record<PaymentMethodType, string> = {
  gcash: "GCash",
  maya: "Maya",
  bank: "Bank Transfer",
};

const methodIcons: Record<
  PaymentMethodType,
  ComponentType<{ className?: string }>
> = {
  gcash: Smartphone,
  maya: Wallet,
  bank: Landmark,
};

export function PaymentMethodCard({
  method,
  onEdit,
  onSetDefault,
  onRemove,
}: PaymentMethodCardProps) {
  const Icon = methodIcons[method.type];
  const methodLabel =
    method.type === "bank" && method.bankName
      ? method.bankName
      : methodLabels[method.type];

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">{methodLabel}</p>
            <Badge variant="outline">{methodLabels[method.type]}</Badge>
            {method.isDefault ? <Badge>Default</Badge> : null}
          </div>

          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">Account name</p>
            <p className="font-medium">{method.accountName}</p>
          </div>

          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">Account number</p>
            <p className="font-mono tabular-nums">{method.accountNumber}</p>
          </div>

          {method.type === "bank" && method.bankName ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="size-4" />
              <span>Deposits routed to {method.bankName}</span>
            </div>
          ) : null}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={`Manage ${methodLabel} payment method`}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(method)}>
              <Pencil className="size-4" />
              Edit details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSetDefault(method.id)}
              disabled={method.isDefault}
            >
              <Star className="size-4" />
              Set as default
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onRemove(method.id)}
            >
              <Trash2 className="size-4" />
              Remove method
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
