"use client";

import { ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MenuBuilderStepProps {
  onComplete: () => void;
}

export function MenuBuilderStep({ onComplete }: MenuBuilderStepProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <ChefHat className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Build Your Menu</CardTitle>
            <CardDescription>
              Add categories and items to your menu
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Menu management will be available from your dashboard after completing
          the setup wizard. You can add categories, items, variants, and
          modifiers there.
        </p>
        <div className="flex gap-2">
          <Button onClick={onComplete}>Skip for Now</Button>
        </div>
      </CardContent>
    </Card>
  );
}
