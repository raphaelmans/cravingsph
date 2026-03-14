"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  type UpdateTableDTO,
  UpdateTableSchema,
} from "@/modules/table/dtos/table.dto";
import { useUpdateTable } from "../hooks/use-table-management";

interface EditableTable {
  id: string;
  label: string;
  code: string;
  sortOrder: number;
  isActive: boolean;
}

interface EditTableDialogProps {
  branchId: string;
  table: EditableTable | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTableDialog({
  branchId,
  table,
  open,
  onOpenChange,
}: EditTableDialogProps) {
  const updateMutation = useUpdateTable(branchId);

  const form = useForm<UpdateTableDTO>({
    resolver: zodResolver(UpdateTableSchema),
    defaultValues: {
      id: table?.id ?? "",
      label: table?.label ?? "",
      code: table?.code ?? "",
      sortOrder: table?.sortOrder ?? 0,
      isActive: table?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (table) {
      form.reset({
        id: table.id,
        label: table.label,
        code: table.code,
        sortOrder: table.sortOrder,
        isActive: table.isActive,
      });
    }
  }, [table, form]);

  function onSubmit(data: UpdateTableDTO) {
    updateMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Table updated");
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
            Edit table
          </DialogTitle>
          <DialogDescription>
            Update table details and availability.
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
                    <Input shape="pill" placeholder="e.g. Table 1" {...field} />
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
                      placeholder="e.g. T1"
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
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      shape="pill"
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-3xl border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Inactive tables are hidden from customers.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
