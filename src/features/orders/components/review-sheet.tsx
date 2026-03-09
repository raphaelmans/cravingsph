"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CustomerOrderRecord } from "../hooks/use-customer-orders";

interface ReviewSheetProps {
  open: boolean;
  order: CustomerOrderRecord | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: { rating: number; comment: string }) => void;
}

export function ReviewSheet({
  open,
  order,
  onOpenChange,
  onSubmit,
}: ReviewSheetProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!open) {
      setRating(0);
      setComment("");
    }
  }, [open]);

  const isSubmitDisabled = rating === 0 || comment.trim().length < 10 || !order;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[88vh]">
        <DrawerHeader className="space-y-2 text-left">
          <DrawerTitle className="font-heading text-xl">
            Rate your order
          </DrawerTitle>
          <DrawerDescription>
            {order
              ? `Share what stood out about ${order.restaurantName} order #${order.orderNumber}.`
              : "Share what stood out about your order."}
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-5 px-4 pb-2">
          <div className="rounded-3xl border border-primary/15 bg-primary/5 p-4">
            <p className="text-sm font-medium text-foreground">
              How was everything?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Focus on food quality, speed, and how smooth the pickup or dine-in
              experience felt.
            </p>

            <div className="mt-4 flex items-center gap-2">
              {Array.from({ length: 5 }, (_, index) => {
                const starValue = index + 1;
                const isActive = rating >= starValue;

                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(starValue)}
                    className={cn(
                      "flex size-11 items-center justify-center rounded-full border transition-colors",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-primary/20 bg-background text-primary",
                    )}
                    aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={cn("size-5", isActive ? "fill-current" : "")}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="review-comment">
              Tell other diners more
            </label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="The serving time was quick, the chicken stayed hot, and pickup instructions were easy to follow."
              className="min-h-32 rounded-3xl"
            />
            <p className="text-xs text-muted-foreground">
              Minimum 10 characters. Keep it useful and specific.
            </p>
          </div>
        </div>

        <DrawerFooter className="border-t border-primary/10">
          <Button
            shape="pill"
            size="lg"
            disabled={isSubmitDisabled}
            onClick={() => {
              if (isSubmitDisabled) {
                return;
              }

              onSubmit({ rating, comment: comment.trim() });
            }}
          >
            Submit review
          </Button>
          <Button
            shape="pill"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Maybe later
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
