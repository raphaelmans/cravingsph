"use client";

import { StatusStep, type StepState } from "./status-step";

// --- Order status types (no backend schema yet) ---

export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed";

const STATUS_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "placed", label: "Submitted" },
  { status: "accepted", label: "Accepted" },
  { status: "preparing", label: "Preparing" },
  { status: "ready", label: "Ready for Pickup" },
  { status: "completed", label: "Completed" },
];

function getStepState(
  stepStatus: OrderStatus,
  currentStatus: OrderStatus,
): StepState {
  const stepIndex = STATUS_STEPS.findIndex((s) => s.status === stepStatus);
  const currentIndex = STATUS_STEPS.findIndex(
    (s) => s.status === currentStatus,
  );

  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "current";
  return "upcoming";
}

interface OrderStatusTrackerProps {
  currentStatus: OrderStatus;
  /** Timestamp strings keyed by status — shown as descriptions on completed steps */
  timestamps?: Partial<Record<OrderStatus, string>>;
}

export function OrderStatusTracker({
  currentStatus,
  timestamps,
}: OrderStatusTrackerProps) {
  return (
    <div
      data-slot="order-status-tracker"
      className="rounded-3xl border border-primary/10 bg-background/95 p-3 shadow-sm"
    >
      {STATUS_STEPS.map((step, index) => {
        const state = getStepState(step.status, currentStatus);
        const timestamp = timestamps?.[step.status];

        return (
          <StatusStep
            key={step.status}
            label={step.label}
            description={
              state === "completed" && timestamp ? timestamp : undefined
            }
            state={state}
            isLast={index === STATUS_STEPS.length - 1}
          />
        );
      })}
    </div>
  );
}
