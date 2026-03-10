"use client";

import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PaymentMethodsStepProps {
  onComplete: () => void;
}

export function PaymentMethodsStep({ onComplete }: PaymentMethodsStepProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <CreditCard className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Payment Methods</CardTitle>
            <CardDescription>
              Configure how customers can pay for orders
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Payment method configuration (GCash, Maya, bank transfer) will be
          available from your organization settings. You can set this up after
          completing the wizard.
        </p>
        <div className="flex gap-2">
          <Button onClick={onComplete}>Skip for Now</Button>
        </div>
      </CardContent>
    </Card>
  );
}
