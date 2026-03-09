"use client";

import { ScanLine } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QrScannerModal } from "./qr-scanner-modal";

export function ScanQRCTA() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        data-slot="scan-qr-cta"
        className="fixed inset-x-0 bottom-0 z-40 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <Button
          shape="pill"
          size="lg"
          className="gap-2 shadow-lg"
          onClick={() => setOpen(true)}
        >
          <ScanLine className="size-5" />
          Scan cravings QR
        </Button>
      </div>

      <QrScannerModal open={open} onOpenChange={setOpen} />
    </>
  );
}
