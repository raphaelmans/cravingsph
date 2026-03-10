"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { useEffect } from "react";
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

// Form-only schema (restaurantId injected at submit time)
const BranchFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  address: z.string().max(500).optional(),
  province: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
});

type BranchFormValues = z.infer<typeof BranchFormSchema>;

const EMPTY_BRANCH_FORM_VALUES: BranchFormValues = {
  name: "",
  address: "",
  province: "",
  city: "",
  phone: "",
};

function getDefaultValues(
  initialValues?: Partial<BranchFormValues>,
): BranchFormValues {
  return {
    name: initialValues?.name ?? "",
    address: initialValues?.address ?? "",
    province: initialValues?.province ?? "",
    city: initialValues?.city ?? "",
    phone: initialValues?.phone ?? "",
  };
}

interface BranchFormProps {
  mode?: "create" | "edit";
  restaurantId: string;
  branchId?: string;
  initialValues?: Partial<BranchFormValues>;
  onComplete?: () => void;
  title?: string;
  description?: string;
  submitLabel?: string;
}

export function BranchForm({
  mode = "create",
  restaurantId,
  branchId,
  initialValues,
  onComplete,
  title,
  description,
  submitLabel,
}: BranchFormProps) {
  const trpc = useTRPC();
  const queryClient = getQueryClient();
  const isEditMode = mode === "edit";

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(BranchFormSchema),
    defaultValues: getDefaultValues(initialValues),
  });

  const createMutation = useMutation({
    ...trpc.branch.create.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: trpc.branch.listByRestaurant.queryKey({
          restaurantId,
        }),
      });
      form.reset(EMPTY_BRANCH_FORM_VALUES);
      onComplete?.();
    },
  });

  const updateMutation = useMutation({
    ...trpc.branch.update.mutationOptions(),
    onSuccess: async (branch) => {
      await queryClient.invalidateQueries({
        queryKey: trpc.branch.listByRestaurant.queryKey({
          restaurantId,
        }),
      });
      form.reset(
        getDefaultValues({
          name: branch.name,
          address: branch.address ?? "",
          province: branch.province ?? "",
          city: branch.city ?? "",
          phone: branch.phone ?? "",
        }),
      );
      onComplete?.();
    },
  });

  useEffect(() => {
    form.reset(getDefaultValues(initialValues));
  }, [form, initialValues]);

  const onSubmit = (data: BranchFormValues) => {
    if (isEditMode) {
      if (!branchId) {
        return;
      }

      updateMutation.mutate({
        id: branchId,
        name: data.name,
        address: data.address || "",
        province: data.province || "",
        city: data.city || "",
        phone: data.phone || "",
      });
      return;
    }

    createMutation.mutate({
      restaurantId,
      name: data.name,
      address: data.address || undefined,
      province: data.province || undefined,
      city: data.city || undefined,
      phone: data.phone || undefined,
    });
  };

  const mutation = isEditMode ? updateMutation : createMutation;
  const resolvedTitle = title ?? (isEditMode ? "Edit Branch" : "Add Branch");
  const resolvedDescription =
    description ??
    (isEditMode
      ? "Update branch contact details, address, and branch naming"
      : "Set up your first branch location");
  const resolvedSubmitLabel =
    submitLabel ?? (isEditMode ? "Save Changes" : "Add Branch");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{resolvedTitle}</CardTitle>
            <CardDescription>{resolvedDescription}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {mutation.isError && (
              <div className="text-destructive text-sm">
                {mutation.error.message}
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Main Branch" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Street Address{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 123 Rizal St., Brgy. San Antonio"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Province{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Metro Manila" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      City{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Makati" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="09XX XXX XXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? isEditMode
                  ? "Saving..."
                  : "Creating..."
                : resolvedSubmitLabel}
            </Button>
          </CardContent>
        </form>
      </Form>
    </Card>
  );
}
