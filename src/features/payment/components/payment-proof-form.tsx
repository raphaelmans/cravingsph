"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// --- Schema ---

const paymentProofSchema = z.object({
  referenceNumber: z
    .string()
    .min(1, "Reference number is required")
    .transform((v) => v.trim()),
});

type PaymentProofFormValues = z.infer<typeof paymentProofSchema>;

export interface PaymentProofSubmitPayload {
  referenceNumber: string;
  proofImage: File | null;
}

interface PaymentProofFormProps {
  onSubmit: (payload: PaymentProofSubmitPayload) => void;
  isSubmitting: boolean;
  disabled?: boolean;
}

// --- Component ---

export function PaymentProofForm({
  onSubmit,
  isSubmitting,
  disabled = false,
}: PaymentProofFormProps) {
  const [proofImage, setProofImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PaymentProofFormValues>({
    resolver: zodResolver(paymentProofSchema),
    defaultValues: {
      referenceNumber: "",
    },
  });

  const handleSubmit = useCallback(
    (values: PaymentProofFormValues) => {
      onSubmit({
        referenceNumber: values.referenceNumber,
        proofImage,
      });
    },
    [onSubmit, proofImage],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      setProofImage(file);
    },
    [],
  );

  const handleRemoveFile = useCallback(() => {
    setProofImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Reference number */}
        <FormField
          control={form.control}
          name="referenceNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference number</FormLabel>
              <FormControl>
                <Input
                  shape="pill"
                  placeholder="e.g. 1234567890"
                  disabled={disabled}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Screenshot upload */}
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Screenshot{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </p>

          {proofImage ? (
            <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ImagePlus className="size-5" />
              </div>
              <p className="flex-1 min-w-0 text-sm truncate">
                {proofImage.name}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                shape="pill"
                onClick={handleRemoveFile}
                disabled={disabled}
                aria-label="Remove screenshot"
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground transition-colors hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="size-4" />
              Tap to upload screenshot
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            tabIndex={-1}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          shape="pill"
          size="lg"
          className="w-full"
          disabled={isSubmitting || disabled}
        >
          {isSubmitting ? "Submitting..." : "Submit Payment Proof"}
        </Button>
      </form>
    </Form>
  );
}
