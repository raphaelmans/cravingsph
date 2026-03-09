"use client";

import { Check, ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { OrderRecord } from "../types";

const PAYMENT_STATUS_BADGE: Record<
  OrderRecord["paymentStatus"],
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  pending: { label: "Pending", variant: "outline" },
  submitted: { label: "Awaiting Review", variant: "default" },
  confirmed: { label: "Confirmed", variant: "secondary" },
  rejected: { label: "Rejected", variant: "destructive" },
};

interface PaymentProofReviewProps {
  order: OrderRecord;
  onConfirm: (orderId: string) => void;
  onReject: (orderId: string, reason?: string) => void;
  isConfirming: boolean;
  isRejecting: boolean;
}

export function PaymentProofReview({
  order,
  onConfirm,
  onReject,
  isConfirming,
  isRejecting,
}: PaymentProofReviewProps) {
  const [rejectReason, setRejectReason] = useState("");
  const badge = PAYMENT_STATUS_BADGE[order.paymentStatus];
  const canReview = order.paymentStatus === "submitted";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Payment Proof</CardTitle>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Payment details */}
        <div className="space-y-2 text-sm">
          {order.paymentMethod && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Method</span>
              <span className="capitalize">{order.paymentMethod}</span>
            </div>
          )}
          {order.paymentReference && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-mono text-xs">
                {order.paymentReference}
              </span>
            </div>
          )}
        </div>

        {/* Screenshot preview */}
        {order.paymentScreenshotUrl ? (
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="group relative w-full overflow-hidden rounded-md border"
              >
                <Image
                  src={order.paymentScreenshotUrl}
                  alt="Payment proof"
                  width={400}
                  height={300}
                  className="h-48 w-full object-cover transition-opacity group-hover:opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="rounded-md bg-background/80 px-3 py-1.5 text-sm font-medium">
                    View full image
                  </span>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Payment Screenshot</DialogTitle>
              </DialogHeader>
              <Image
                src={order.paymentScreenshotUrl}
                alt="Payment proof"
                width={800}
                height={600}
                className="w-full rounded-md object-contain"
              />
            </DialogContent>
          </Dialog>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-muted-foreground">
            <div className="flex flex-col items-center gap-1">
              <ImageIcon className="size-6" />
              <span className="text-xs">No screenshot uploaded</span>
            </div>
          </div>
        )}

        {/* Confirm / Reject actions */}
        {canReview && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="flex-1"
              disabled={isConfirming || isRejecting}
              onClick={() => onConfirm(order.id)}
            >
              <Check className="mr-1 size-4" />
              {isConfirming ? "Confirming..." : "Confirm Payment"}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={isConfirming || isRejecting}
                >
                  <X className="mr-1 size-4" />
                  Reject
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reject payment proof?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The customer will be notified that their payment proof was
                    rejected and they may need to submit a new one.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Textarea
                  placeholder="Reason for rejection (optional)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="min-h-[80px]"
                />
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setRejectReason("")}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => {
                      onReject(order.id, rejectReason.trim() || undefined);
                      setRejectReason("");
                    }}
                  >
                    Reject Payment
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
