"use client";

import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, ScanLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { appRoutes } from "@/common/app-routes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SCANNER_ELEMENT_ID = "qr-scanner-reader";

type ScannerState =
  | { status: "idle" }
  | { status: "scanning" }
  | { status: "success"; slug: string }
  | { status: "error"; message: string }
  | { status: "denied" };

function parseQrValue(value: string): string | null {
  const trimmed = value.trim();

  // cravings://slug format
  const protocolMatch = trimmed.match(/^cravings:\/\/(.+)$/i);
  if (protocolMatch) return protocolMatch[1];

  // Full URL: .../restaurant/slug
  const urlMatch = trimmed.match(/\/restaurant\/([a-z0-9-]+)\/?$/i);
  if (urlMatch) return urlMatch[1];

  // Plain slug (alphanumeric + hyphens, at least 2 chars)
  if (/^[a-z0-9][a-z0-9-]{1,}$/i.test(trimmed)) return trimmed.toLowerCase();

  return null;
}

interface QrScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QrScannerModal({ open, onOpenChange }: QrScannerModalProps) {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [state, setState] = useState<ScannerState>({ status: "idle" });

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
      scanner.clear();
    } catch {
      // Scanner may already be stopped
    }
    scannerRef.current = null;
  }, []);

  const startScanner = useCallback(async () => {
    // Clean up any previous instance
    await stopScanner();

    setState({ status: "scanning" });

    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const slug = parseQrValue(decodedText);
          if (slug) {
            setState({ status: "success", slug });
          } else {
            setState({
              status: "error",
              message: "Not a valid cravings QR code. Try another one.",
            });
          }
        },
        () => {
          // QR code not detected in this frame — expected, do nothing
        },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      if (
        message.includes("NotAllowedError") ||
        message.includes("Permission")
      ) {
        setState({ status: "denied" });
      } else {
        setState({
          status: "error",
          message: "Could not start the camera. Please check your settings.",
        });
      }
    }
  }, [stopScanner]);

  // Navigate on success
  useEffect(() => {
    if (state.status !== "success") return;

    const timeout = setTimeout(() => {
      onOpenChange(false);
      router.push(appRoutes.restaurant.bySlug(state.slug));
    }, 600);

    return () => clearTimeout(timeout);
  }, [state, onOpenChange, router]);

  // Start scanner when modal opens, stop on close
  useEffect(() => {
    if (open) {
      // Small delay to let the dialog DOM render
      const timeout = setTimeout(() => {
        void startScanner();
      }, 300);
      return () => clearTimeout(timeout);
    }

    void stopScanner();
    setState({ status: "idle" });
  }, [open, startScanner, stopScanner]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="size-5" />
            Scan QR Code
          </DialogTitle>
          <DialogDescription>
            Point your camera at a cravings QR code to visit the restaurant
            menu.
          </DialogDescription>
        </DialogHeader>

        <div className="relative bg-black">
          <div
            id={SCANNER_ELEMENT_ID}
            className="w-full aspect-square [&_video]:!object-cover"
          />

          {state.status === "success" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 text-white">
              <div className="rounded-full bg-success p-4">
                <ScanLine className="size-6" />
              </div>
              <p className="text-sm font-medium">Found it! Redirecting...</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4">
          {state.status === "denied" && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="rounded-full bg-muted p-4">
                <CameraOff className="size-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Camera access denied</p>
                <p className="text-xs text-muted-foreground">
                  Allow camera access in your browser settings, then try again.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void startScanner()}
              >
                <Camera className="size-4" />
                Try again
              </Button>
            </div>
          )}

          {state.status === "error" && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <p className="text-sm text-muted-foreground">{state.message}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState({ status: "scanning" })}
              >
                Scan again
              </Button>
            </div>
          )}

          {(state.status === "idle" || state.status === "scanning") && (
            <p className="text-center text-xs text-muted-foreground">
              Align the QR code within the frame to scan automatically.
            </p>
          )}

          {state.status === "success" && (
            <p className="text-center text-sm text-success font-medium">
              Restaurant found! Opening menu...
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
