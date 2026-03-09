"use client";

import { FileCheck2, FileSearch, FileWarning } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AdminVerificationDocumentRecord } from "../hooks/use-admin-verification";
import { formatAdminTimestamp } from "../hooks/use-admin-verification";

interface AdminVerificationDocumentCardProps {
  document: AdminVerificationDocumentRecord;
}

const statusMeta = {
  uploaded: {
    label: "Uploaded",
    icon: FileSearch,
    variant: "outline" as const,
  },
  approved: {
    label: "Approved",
    icon: FileCheck2,
    variant: "secondary" as const,
  },
  flagged: {
    label: "Flagged",
    icon: FileWarning,
    variant: "destructive" as const,
  },
};

export function AdminVerificationDocumentCard({
  document,
}: AdminVerificationDocumentCardProps) {
  const meta = statusMeta[document.status];
  const StatusIcon = meta.icon;

  return (
    <Card
      className={
        document.status === "flagged" ? "border-destructive/40" : undefined
      }
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">{document.label}</CardTitle>
            <CardDescription>{document.description}</CardDescription>
          </div>
          <Badge variant={meta.variant}>{meta.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        <div className="rounded-xl border bg-muted/30 p-3">
          <div className="flex items-center gap-2 font-medium">
            <StatusIcon className="size-4 text-primary" />
            <span>{document.fileName}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Uploaded {formatAdminTimestamp(document.uploadedAt)}
          </p>
        </div>

        <p className="text-sm text-muted-foreground">{document.note}</p>
      </CardContent>
    </Card>
  );
}
