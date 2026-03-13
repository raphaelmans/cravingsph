"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CircleParking, MapPin, Snowflake, TreePine, Wifi } from "lucide-react";
import { useEffect, useMemo } from "react";
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
import type { BranchAmenity } from "@/modules/branch/dtos/branch.dto";
import { useTRPC } from "@/trpc/client";
import { getQueryClient } from "@/trpc/query-client";

const AMENITY_OPTIONS: {
  value: BranchAmenity;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "air_conditioning", label: "Air Conditioning", icon: Snowflake },
  { value: "parking", label: "Parking", icon: CircleParking },
  { value: "free_wifi", label: "Free Wi-Fi", icon: Wifi },
  { value: "outdoor_seating", label: "Outdoor Seating", icon: TreePine },
];

// Form-only schema (restaurantId injected at submit time)
const BranchFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  address: z.string().max(500).optional(),
  street: z.string().max(200).optional(),
  barangay: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  amenities: z
    .array(
      z.enum(["air_conditioning", "parking", "free_wifi", "outdoor_seating"]),
    )
    .optional(),
});

type BranchFormValues = z.infer<typeof BranchFormSchema>;

const EMPTY_BRANCH_FORM_VALUES: BranchFormValues = {
  name: "",
  address: "",
  street: "",
  barangay: "",
  province: "",
  city: "",
  phone: "",
  amenities: [],
};

function getDefaultValues(
  initialValues?: Partial<BranchFormValues>,
): BranchFormValues {
  return {
    name: initialValues?.name ?? "",
    address: initialValues?.address ?? "",
    street: initialValues?.street ?? "",
    barangay: initialValues?.barangay ?? "",
    province: initialValues?.province ?? "",
    city: initialValues?.city ?? "",
    phone: initialValues?.phone ?? "",
    amenities: initialValues?.amenities ?? [],
  };
}

/**
 * Extract the suffix from a branch name given a restaurant name prefix.
 * If the name starts with "RestaurantName - ", return the part after the separator.
 * Otherwise return the entire name (backward compat for names without the prefix).
 */
function extractNameSuffix(fullName: string, restaurantName: string): string {
  const prefix = `${restaurantName} - `;
  if (fullName.startsWith(prefix)) {
    return fullName.slice(prefix.length);
  }
  // Fallback: try splitting on " - "
  const separatorIndex = fullName.indexOf(" - ");
  if (separatorIndex !== -1) {
    return fullName.slice(separatorIndex + 3);
  }
  return fullName;
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
  restaurantName?: string;
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
  restaurantName,
}: BranchFormProps) {
  const trpc = useTRPC();
  const queryClient = getQueryClient();
  const isEditMode = mode === "edit";
  const hasLockedPrefix = !!restaurantName;

  // When we have a locked prefix, we need to transform the initial name
  // to show only the suffix in the form
  const transformedInitialValues = useMemo(() => {
    if (!initialValues) return initialValues;
    if (!hasLockedPrefix) return initialValues;

    return {
      ...initialValues,
      name: initialValues.name
        ? extractNameSuffix(initialValues.name, restaurantName)
        : initialValues.name,
    };
  }, [initialValues, hasLockedPrefix, restaurantName]);

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(BranchFormSchema),
    defaultValues: getDefaultValues(transformedInitialValues),
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
      const resetName = hasLockedPrefix
        ? extractNameSuffix(branch.name, restaurantName)
        : branch.name;
      form.reset(
        getDefaultValues({
          name: resetName,
          address: branch.address ?? "",
          street: ((branch as Record<string, unknown>).street as string) ?? "",
          barangay:
            ((branch as Record<string, unknown>).barangay as string) ?? "",
          province: branch.province ?? "",
          city: branch.city ?? "",
          phone: branch.phone ?? "",
          amenities:
            ((branch as Record<string, unknown>)
              .amenities as BranchAmenity[]) ?? [],
        }),
      );
      onComplete?.();
    },
  });

  useEffect(() => {
    form.reset(getDefaultValues(transformedInitialValues));
  }, [form, transformedInitialValues]);

  /** Build the full branch name, prepending the restaurant prefix if present. */
  const buildFullName = (formName: string): string => {
    if (hasLockedPrefix) {
      return `${restaurantName} - ${formName}`;
    }
    return formName;
  };

  const onSubmit = (data: BranchFormValues) => {
    const fullName = buildFullName(data.name);

    if (isEditMode) {
      if (!branchId) {
        return;
      }

      updateMutation.mutate({
        id: branchId,
        name: fullName,
        address: data.address || "",
        street: data.street || "",
        barangay: data.barangay || "",
        province: data.province || "",
        city: data.city || "",
        phone: data.phone || "",
        amenities: data.amenities ?? [],
      });
      return;
    }

    createMutation.mutate({
      restaurantId,
      name: fullName,
      address: data.address || undefined,
      street: data.street || undefined,
      barangay: data.barangay || undefined,
      province: data.province || undefined,
      city: data.city || undefined,
      phone: data.phone || undefined,
      amenities: data.amenities?.length ? data.amenities : undefined,
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

            {/* Branch Name — locked prefix mode or regular */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch Name</FormLabel>
                  <FormControl>
                    {hasLockedPrefix ? (
                      <div className="flex items-center gap-0">
                        <span className="flex h-9 shrink-0 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                          {restaurantName} &ndash;
                        </span>
                        <Input
                          className="rounded-l-none"
                          placeholder="e.g. Main Branch"
                          {...field}
                        />
                      </div>
                    ) : (
                      <Input placeholder="e.g. Main Branch" {...field} />
                    )}
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
                    Address{" "}
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
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Street{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 123 Rizal Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="barangay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Barangay{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Barangay San Antonio"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            {/* Amenities */}
            <FormField
              control={form.control}
              name="amenities"
              render={({ field }) => {
                const selected = field.value ?? [];
                const toggle = (amenity: BranchAmenity) => {
                  const next = selected.includes(amenity)
                    ? selected.filter((a) => a !== amenity)
                    : [...selected, amenity];
                  field.onChange(next);
                };

                return (
                  <FormItem>
                    <FormLabel>
                      Amenities{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {AMENITY_OPTIONS.map((option) => {
                        const isActive = selected.includes(option.value);
                        const Icon = option.icon;
                        return (
                          <Button
                            key={option.value}
                            type="button"
                            variant="outline"
                            size="sm"
                            className={
                              isActive
                                ? "border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                                : ""
                            }
                            onClick={() => toggle(option.value)}
                          >
                            <Icon className="mr-1.5 size-4" />
                            {option.label}
                          </Button>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
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
