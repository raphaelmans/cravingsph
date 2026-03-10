"use client";

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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AcceptRejectActionsProps {
  orderId: string;
  isAccepting?: boolean;
  isRejecting?: boolean;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string, reason?: string) => void;
}

export function AcceptRejectActions({
  orderId,
  isAccepting,
  isRejecting,
  onAccept,
  onReject,
}: AcceptRejectActionsProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  return (
    <>
      <div className="flex items-center gap-4">
        <Button
          size="sm"
          disabled={isAccepting || isRejecting}
          onClick={() => onAccept(orderId)}
        >
          {isAccepting ? "Accepting..." : "Accept Order"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isAccepting || isRejecting}
          onClick={() => setShowRejectDialog(true)}
        >
          Reject
        </Button>
      </div>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this order?</AlertDialogTitle>
            <AlertDialogDescription>
              The customer will be notified that their order was rejected. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Textarea
            placeholder="Reason for rejection (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectReason("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                onReject(orderId, rejectReason || undefined);
                setRejectReason("");
                setShowRejectDialog(false);
              }}
            >
              Reject Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
