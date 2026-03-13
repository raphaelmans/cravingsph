"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, ChefHat } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { getQueryClient } from "@/trpc/query-client";

const QuickMenuSchema = z.object({
  categoryName: z.string().min(1, "Category name is required").max(100),
  itemName: z.string().min(1, "Item name is required").max(200),
  itemPrice: z
    .string()
    .min(1, "Price is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid price (e.g. 150 or 150.00)"),
});

type QuickMenuValues = z.infer<typeof QuickMenuSchema>;

interface MenuBuilderStepProps {
  branchId: string;
  onComplete: () => void;
}

export function MenuBuilderStep({
  branchId,
  onComplete,
}: MenuBuilderStepProps) {
  const trpc = useTRPC();
  const queryClient = getQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: hasMenu } = useQuery({
    ...trpc.menu.hasContent.queryOptions({ branchId }),
  });

  const createCategoryMutation = useMutation(
    trpc.menu.createCategory.mutationOptions(),
  );

  const createItemMutation = useMutation(
    trpc.menu.createItem.mutationOptions(),
  );

  const form = useForm<QuickMenuValues>({
    resolver: zodResolver(QuickMenuSchema),
    defaultValues: {
      categoryName: "",
      itemName: "",
      itemPrice: "",
    },
  });

  const onSubmit = async (data: QuickMenuValues) => {
    setIsSubmitting(true);
    try {
      const category = await createCategoryMutation.mutateAsync({
        branchId,
        name: data.categoryName,
      });

      await createItemMutation.mutateAsync({
        categoryId: category.id,
        name: data.itemName,
        basePrice: data.itemPrice,
      });

      await queryClient.invalidateQueries({
        queryKey: trpc.menu.hasContent.queryKey({ branchId }),
      });

      onComplete();
    } catch {
      form.setError("root", {
        message: "Failed to create menu. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasMenu) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-success/10">
              <Check className="size-5 text-success" />
            </div>
            <div>
              <CardTitle className="text-base">Menu Created</CardTitle>
              <CardDescription>
                Your menu has items. You can add more from the dashboard later.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={onComplete}>Continue</Button>
        </CardContent>
      </Card>
    );
  }

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
              Add your first category and item to get started. You can add more
              from the dashboard later.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {form.formState.errors.root && (
              <div className="text-destructive text-sm">
                {form.formState.errors.root.message}
              </div>
            )}

            <FormField
              control={form.control}
              name="categoryName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Menu Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Main Dishes, Drinks" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="itemName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Item Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Chicken Adobo, Halo-Halo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="itemPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (PHP)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g. 150"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Menu Item"}
              </Button>
              <Button type="button" variant="ghost" onClick={onComplete}>
                Skip for Now
              </Button>
            </div>
          </CardContent>
        </form>
      </Form>
    </Card>
  );
}
