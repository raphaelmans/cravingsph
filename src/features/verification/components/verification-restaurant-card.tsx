"use client";

import {
  Building2,
  CheckCircle2,
  Clock3,
  FileWarning,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  type OwnerVerificationRestaurantState,
  VERIFICATION_STATUS_META,
} from "@/features/verification/hooks/use-owner-verification";
import { cn } from "@/lib/utils";

interface VerificationRestaurantCardProps {
  item: OwnerVerificationRestaurantState;
  isSelected: boolean;
  onSelect: () => void;
}

const statusIcons = {
  draft: Upload,
  ready: CheckCircle2,
  under_review: Clock3,
  approved: CheckCircle2,
  rejected: FileWarning,
} as const;

export function VerificationRestaurantCard({
  item,
  isSelected,
  onSelect,
}: VerificationRestaurantCardProps) {
  const statusMeta = VERIFICATION_STATUS_META[item.status];
  const StatusIcon = statusIcons[item.status];

  return (
    <Card
      className={cn(
        "transition-colors",
        isSelected && "border-primary bg-primary/5 shadow-sm",
      )}
    >
      <button className="w-full text-left" onClick={onSelect} type="button">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Building2 className="size-4" />
                </div>
                <div>
                  <p className="font-medium">{item.restaurant.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.uploadedDocuments} of {item.totalDocuments} documents
                    ready
                  </p>
                </div>
              </div>
            </div>

            <Badge variant={statusMeta.badgeVariant}>{statusMeta.label}</Badge>
          </div>

          <Progress value={item.completionPercent} />

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <StatusIcon className="size-3.5" />
            <span>{statusMeta.description}</span>
          </div>
        </CardContent>
      </button>
    </Card>
  );
}
