"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateItem } from "../hooks/use-management-menu";
import type { ManagementMenuItem } from "../types";

/** Form schema for the edit dialog (id omitted from form, injected on submit). */
const EditItemFormSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  basePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  imageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});
type EditItemFormValues = z.infer<typeof EditItemFormSchema>;

interface EditItemDialogProps {
  branchId: string;
  item: ManagementMenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditItemDialog({
  branchId,
  item,
  open,
  onOpenChange,
}: EditItemDialogProps) {
  const updateMutation = useUpdateItem(branchId);

  const form = useForm<EditItemFormValues>({
    resolver: zodResolver(EditItemFormSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: "",
      imageUrl: "",
    },
  });

  // Reset form values when item changes
  useEffect(() => {
    if (item) {
      form.reset({
        name: item.item.name,
        description: item.item.description ?? "",
        basePrice: item.item.basePrice,
        imageUrl: item.item.imageUrl ?? "",
      });
    }
  }, [item, form]);

  function onSubmit(data: EditItemFormValues) {
    if (!item) return;

    updateMutation.mutate(
      {
        id: item.item.id,
        name: data.name,
        description: data.description || undefined,
        basePrice: data.basePrice,
        imageUrl: data.imageUrl || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Item updated");
          onOpenChange(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Update the details for &ldquo;{item?.item.name}&rdquo;.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the item"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Price</FormLabel>
                  <FormControl>
                    <Input placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
