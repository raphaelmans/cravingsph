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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  type CreateTableDTO,
  CreateTableSchema,
} from "@/modules/table/dtos/table.dto";
import { useCreateTable } from "../hooks/use-table-management";

interface AddTableDialogProps {
  branchId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTableDialog({
  branchId,
  open,
  onOpenChange,
}: AddTableDialogProps) {
  const createMutation = useCreateTable(branchId);

  const form = useForm<CreateTableDTO>({
    resolver: zodResolver(CreateTableSchema),
    defaultValues: { branchId, label: "", code: "" },
  });

  function onSubmit(data: CreateTableDTO) {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Table created");
        form.reset({ branchId, label: "", code: "" });
        onOpenChange(false);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-semibold tracking-tight">
            Add table
          </DialogTitle>
          <DialogDescription>
            Add a physical table for dine-in ordering.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Table 1, Window Seat A"
                      autoFocus
                      shape="pill"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. T1, WINDOW-A"
                      shape="pill"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Uppercase letters, digits, and hyphens only.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      shape="pill"
                      placeholder="Auto-assigned if empty"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                        )
                      }
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
                {createMutation.isPending ? "Creating..." : "Add Table"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
