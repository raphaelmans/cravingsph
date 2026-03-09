"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  type CreateMenuItemDTO,
  CreateMenuItemSchema,
} from "@/modules/menu/dtos/menu.dto";
import { useCreateItem } from "../hooks/use-management-menu";
import type { ManagementCategory } from "../types";

interface AddItemDialogProps {
  branchId: string;
  categories: ManagementCategory[];
  defaultCategoryId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddItemDialog({
  branchId,
  categories,
  defaultCategoryId,
  open,
  onOpenChange,
}: AddItemDialogProps) {
  const createMutation = useCreateItem(branchId);

  const form = useForm<CreateMenuItemDTO>({
    resolver: zodResolver(CreateMenuItemSchema),
    defaultValues: {
      categoryId: defaultCategoryId ?? "",
      name: "",
      description: "",
      basePrice: "",
      imageUrl: "",
    },
  });

  function onSubmit(data: CreateMenuItemDTO) {
    // Strip empty optional fields
    const payload: CreateMenuItemDTO = {
      ...data,
      description: data.description || undefined,
      imageUrl: data.imageUrl || undefined,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Item created");
        form.reset({
          categoryId: defaultCategoryId ?? "",
          name: "",
          description: "",
          basePrice: "",
          imageUrl: "",
        });
        onOpenChange(false);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  // Reset categoryId when defaultCategoryId changes (e.g. switching active tab)
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen && defaultCategoryId) {
      form.setValue("categoryId", defaultCategoryId);
    }
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Item</DialogTitle>
          <DialogDescription>
            Add a new menu item to a category.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem
                          key={cat.category.id}
                          value={cat.category.id}
                        >
                          {cat.category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Iced Coffee, Chicken Adobo"
                      autoFocus
                      {...field}
                    />
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
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Add Item"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
