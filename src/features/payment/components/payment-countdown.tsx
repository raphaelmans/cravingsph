"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PaymentCountdownProps {
  durationMinutes: number;
  onExpired?: () => void;
  className?: string;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function PaymentCountdown({
  durationMinutes,
  onExpired,
  className,
}: PaymentCountdownProps) {
  const totalSeconds = durationMinutes * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  const isExpired = remaining <= 0;
  const percentage = isExpired ? 0 : (remaining / totalSeconds) * 100;
  const isUrgent = remaining <= 60 && !isExpired;

  const tick = useCallback(() => {
    setRemaining((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        onExpiredRef.current?.();
        return 0;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (isExpired) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isExpired, tick]);

  return (
    <div data-slot="payment-countdown" className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Time remaining</span>
        <span
          className={cn(
            "font-mono font-semibold tabular-nums",
            isUrgent && "text-destructive",
            isExpired && "text-destructive",
          )}
        >
          {isExpired ? "Expired" : formatTime(remaining)}
        </span>
      </div>
      <Progress
        value={percentage}
        className={cn(
          "h-1.5",
          isUrgent && "[&>[data-slot=progress-indicator]]:bg-destructive",
        )}
      />
    </div>
  );
}
