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
  type CreateCategoryDTO,
  CreateCategorySchema,
} from "@/modules/menu/dtos/menu.dto";
import { useCreateCategory } from "../hooks/use-management-menu";

interface AddCategoryDialogProps {
  branchId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCategoryDialog({
  branchId,
  open,
  onOpenChange,
}: AddCategoryDialogProps) {
  const createMutation = useCreateCategory(branchId);

  const form = useForm<CreateCategoryDTO>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: { branchId, name: "" },
  });

  function onSubmit(data: CreateCategoryDTO) {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Category created");
        form.reset({ branchId, name: "" });
        onOpenChange(false);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
          <DialogDescription>
            Categories organize your menu items into sections.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Drinks, Appetizers, Main Course"
                      autoFocus
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
                {createMutation.isPending ? "Creating..." : "Add Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
