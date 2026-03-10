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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Verification</CardTitle>
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
          <Button onClick={onComplete}>Skip for Now</Button>
        </div>
      </CardContent>
    </Card>
  );
}
