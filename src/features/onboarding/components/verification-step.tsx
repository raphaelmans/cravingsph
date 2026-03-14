"use client";

import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VerificationStepProps {
  onComplete: () => void;
}

export function VerificationStep({ onComplete }: VerificationStepProps) {
  return (
    <Card className="rounded-3xl border-border/70 bg-background/95">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10">
            <ShieldCheck className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle className="font-heading text-lg font-semibold tracking-tight">
              Verification
            </CardTitle>
            <CardDescription>
              Upload documents to verify your business
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Business verification (DTI/SEC registration, valid ID, business
          permit) will be available from the Verification page. You can submit
          documents after completing the wizard.
        </p>
        <div className="flex gap-2">
          <Button shape="pill" onClick={onComplete}>
            Skip for now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
