"use client";

import { ScanLine } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ScanQRCTA() {
  function handleScanQR() {
    toast.info("QR scanner coming soon!", {
      description: "Point your camera at a cravings QR code to get started.",
    });
  }

  return (
    <div
      data-slot="scan-qr-cta"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <Button
        shape="pill"
        size="lg"
        className="gap-2 shadow-lg"
        onClick={handleScanQR}
      >
        <ScanLine className="size-5" />
        Scan cravings QR
      </Button>
    </div>
  );
}
