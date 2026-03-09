"use client";

import { Download, ExternalLink, Printer, QrCode } from "lucide-react";
import Image from "next/image";
import { toDataURL } from "qrcode";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface QRCodePreviewProps {
  branchName: string;
  publicUrl: string;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function QRCodePreview({ branchName, publicUrl }: QRCodePreviewProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const downloadFileName = useMemo(
    () => `${slugify(branchName || "branch")}-menu-qr.png`,
    [branchName],
  );

  useEffect(() => {
    let isCancelled = false;

    async function generateCode() {
      try {
        setErrorMessage(null);
        const nextUrl = await toDataURL(publicUrl, {
          width: 320,
          margin: 1,
          color: {
            dark: "#111827",
            light: "#ffffff",
          },
        });

        if (!isCancelled) {
          setQrDataUrl(nextUrl);
        }
      } catch (error) {
        if (!isCancelled) {
          setQrDataUrl(null);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Failed to generate QR code",
          );
        }
      }
    }

    void generateCode();

    return () => {
      isCancelled = true;
    };
  }, [publicUrl]);

  function handleDownload() {
    if (!qrDataUrl) {
      return;
    }

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = downloadFileName;
    link.click();
  }

  function handlePrint() {
    if (!qrDataUrl) {
      return;
    }

    const popup = window.open(
      "",
      "_blank",
      "noopener,noreferrer,width=720,height=820",
    );
    if (!popup) {
      return;
    }

    popup.document.write(`
      <html>
        <head>
          <title>${branchName} QR Code</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              min-height: 100vh;
              display: grid;
              place-items: center;
              background: #f8fafc;
              color: #0f172a;
            }
            .sheet {
              background: white;
              border: 1px solid #e2e8f0;
              border-radius: 24px;
              padding: 32px;
              width: min(92vw, 440px);
              text-align: center;
              box-shadow: 0 24px 80px rgba(15, 23, 42, 0.12);
            }
            img {
              width: 280px;
              height: 280px;
              display: block;
              margin: 0 auto 20px;
            }
            h1 {
              font-size: 28px;
              margin: 0 0 12px;
            }
            p {
              margin: 0;
              line-height: 1.5;
              color: #475569;
              word-break: break-word;
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <img src="${qrDataUrl}" alt="${branchName} menu QR code" />
            <h1>${branchName}</h1>
            <p>${publicUrl}</p>
          </div>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>QR Code</CardTitle>
          <Badge variant="secondary">Customer-facing</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Generate a scannable menu card for tables, counters, and flyers. The
          preview links customers straight to this restaurant&apos;s public
          menu.
        </p>
      </CardHeader>

      <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-center">
        <div className="space-y-4">
          <div className="rounded-2xl border bg-muted/30 p-4">
            <p className="text-sm font-medium">Destination URL</p>
            <p className="mt-1 break-all text-sm text-muted-foreground">
              {publicUrl}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownload} disabled={!qrDataUrl}>
              <Download className="size-4" />
              Download QR
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={!qrDataUrl}
            >
              <Printer className="size-4" />
              Print QR
            </Button>
            <Button variant="ghost" asChild>
              <a href={publicUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                Preview menu
              </a>
            </Button>
          </div>

          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}
        </div>

        <div className="flex justify-center">
          <div className="rounded-[2rem] border bg-white p-4 shadow-sm">
            {qrDataUrl ? (
              <Image
                src={qrDataUrl}
                alt={`${branchName} menu QR code`}
                className="size-48 rounded-2xl"
                width={192}
                height={192}
                unoptimized
              />
            ) : errorMessage ? (
              <div className="flex size-48 flex-col items-center justify-center gap-3 rounded-2xl bg-muted/40 text-center text-muted-foreground">
                <QrCode className="size-9" />
                <p className="max-w-32 text-sm">QR preview unavailable</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Skeleton className="size-48 rounded-2xl" />
                <Skeleton className="h-4 w-32 rounded-full" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
