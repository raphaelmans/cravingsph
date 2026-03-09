"use client";

import { Check, Copy, Landmark, Smartphone, Wallet } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface PaymentMethod {
  id: string;
  type: "gcash" | "maya" | "bank";
  accountName: string;
  accountNumber: string;
  bankName?: string;
  isDefault: boolean;
}

interface PaymentMethodCardProps {
  method: PaymentMethod;
}

const methodLabels: Record<PaymentMethod["type"], string> = {
  gcash: "GCash",
  maya: "Maya",
  bank: "Bank Transfer",
};

const methodIcons: Record<
  PaymentMethod["type"],
  React.ComponentType<{ className?: string }>
> = {
  gcash: Smartphone,
  maya: Wallet,
  bank: Landmark,
};

export function PaymentMethodCard({ method }: PaymentMethodCardProps) {
  const [copied, setCopied] = useState(false);

  const Icon = methodIcons[method.type];
  const label = methodLabels[method.type];

  async function handleCopy() {
    await navigator.clipboard.writeText(method.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      data-slot="payment-method-card"
      className="flex items-center gap-3 rounded-xl border bg-card p-3"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">
            {method.type === "bank" && method.bankName
              ? method.bankName
              : label}
          </p>
          {method.isDefault && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              Default
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {method.accountName}
        </p>
        <p className="text-sm font-mono tabular-nums">{method.accountNumber}</p>
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        shape="pill"
        onClick={handleCopy}
        aria-label={`Copy ${label} account number`}
      >
        {copied ? (
          <Check className="size-4 text-green-600" />
        ) : (
          <Copy className="size-4" />
        )}
      </Button>
    </div>
  );
}
