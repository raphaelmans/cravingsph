"use client";

import { FileCheck2, FileUp, Trash2 } from "lucide-react";
import type { ChangeEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { VerificationDocumentDraft } from "@/features/verification/hooks/use-owner-verification";

interface VerificationDocumentCardProps {
  document: VerificationDocumentDraft;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "Not uploaded yet";
  }

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function VerificationDocumentCard({
  document,
  onUpload,
  onRemove,
}: VerificationDocumentCardProps) {
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    onUpload(file);
    event.target.value = "";
  }

  return (
    <Card
      className={document.isUploaded ? "border-primary/30" : "border-dashed"}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">{document.label}</CardTitle>
            <CardDescription>{document.description}</CardDescription>
          </div>
          <Badge variant={document.isUploaded ? "secondary" : "outline"}>
            {document.isUploaded ? "Uploaded" : "Required"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-xl border bg-muted/40 p-3 text-sm">
          <div className="flex items-center gap-2 font-medium">
            {document.isUploaded ? (
              <FileCheck2 className="size-4 text-primary" />
            ) : (
              <FileUp className="size-4 text-muted-foreground" />
            )}
            <span>{document.fileName ?? "No file selected"}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatTimestamp(document.uploadedAt)}
          </p>
        </div>

        <Input
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          type="file"
        />

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Accepted formats: PDF, PNG, JPG.
          </p>

          {document.isUploaded ? (
            <Button onClick={onRemove} size="sm" type="button" variant="ghost">
              <Trash2 className="size-4" />
              Remove
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
