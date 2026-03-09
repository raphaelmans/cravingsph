"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Store } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";
import { getQueryClient } from "@/trpc/query-client";

// Form-only schema (organizationId injected at submit time)
const RestaurantFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional(),
  cuisineType: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z
    .string()
    .email("Invalid email")
    .max(255)
    .optional()
    .or(z.literal("")),
});

type RestaurantFormValues = z.infer<typeof RestaurantFormSchema>;

const EMPTY_RESTAURANT_FORM_VALUES: RestaurantFormValues = {
  name: "",
  description: "",
  cuisineType: "",
  phone: "",
  email: "",
};

function getDefaultValues(
  initialValues?: Partial<RestaurantFormValues>,
): RestaurantFormValues {
  return {
    name: initialValues?.name ?? "",
    description: initialValues?.description ?? "",
    cuisineType: initialValues?.cuisineType ?? "",
    phone: initialValues?.phone ?? "",
    email: initialValues?.email ?? "",
  };
}

interface RestaurantFormProps {
  mode?: "create" | "edit";
  organizationId?: string;
  restaurantId?: string;
  initialValues?: Partial<RestaurantFormValues>;
  onComplete?: () => void;
  title?: string;
  description?: string;
  submitLabel?: string;
}

export function RestaurantForm({
  mode = "create",
  organizationId,
  restaurantId,
  initialValues,
  onComplete,
  title,
  description,
  submitLabel,
}: RestaurantFormProps) {
  const trpc = useTRPC();
  const queryClient = getQueryClient();
  const isEditMode = mode === "edit";

  const form = useForm<RestaurantFormValues>({
    resolver: zodResolver(RestaurantFormSchema),
    defaultValues: getDefaultValues(initialValues),
  });

  const createMutation = useMutation({
    ...trpc.restaurant.create.mutationOptions(),
    onSuccess: async () => {
      if (organizationId) {
        await queryClient.invalidateQueries({
          queryKey: trpc.restaurant.listByOrganization.queryKey({
            organizationId,
          }),
        });
      }
      form.reset(EMPTY_RESTAURANT_FORM_VALUES);
      onComplete?.();
    },
  });

  const updateMutation = useMutation({
    ...trpc.restaurant.update.mutationOptions(),
    onSuccess: async (restaurant) => {
      if (organizationId) {
        await queryClient.invalidateQueries({
          queryKey: trpc.restaurant.listByOrganization.queryKey({
            organizationId,
          }),
        });
      }
      form.reset(
        getDefaultValues({
          name: restaurant.name,
          description: restaurant.description ?? "",
          cuisineType: restaurant.cuisineType ?? "",
          phone: restaurant.phone ?? "",
          email: restaurant.email ?? "",
        }),
      );
      onComplete?.();
    },
  });

  useEffect(() => {
    form.reset(getDefaultValues(initialValues));
  }, [form, initialValues]);

  const onSubmit = (data: RestaurantFormValues) => {
    if (isEditMode) {
      if (!restaurantId) {
        return;
      }

      updateMutation.mutate({
        id: restaurantId,
        name: data.name,
        description: data.description || "",
        cuisineType: data.cuisineType || "",
        phone: data.phone || "",
        email: data.email || undefined,
      });
      return;
    }

    if (!organizationId) {
      return;
    }

    createMutation.mutate({
      organizationId,
      name: data.name,
      description: data.description || undefined,
      cuisineType: data.cuisineType || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
    });
  };

  const mutation = isEditMode ? updateMutation : createMutation;
  const resolvedTitle =
    title ?? (isEditMode ? "Edit Restaurant" : "Add Restaurant");
  const resolvedDescription =
    description ??
    (isEditMode
      ? "Update your restaurant profile, contact details, and listing copy"
      : "Add your first restaurant with its basic information");
  const resolvedSubmitLabel =
    submitLabel ?? (isEditMode ? "Save Changes" : "Add Restaurant");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <Store className="size-5 text-primary" />
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
                  <FormLabel>Restaurant Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Juan's Chicken" {...field} />
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
                  <FormLabel>
                    Description{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell customers what makes your restaurant special"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cuisineType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Cuisine Type{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Filipino, Japanese" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
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
                      <Input
                        type="tel"
                        placeholder="09XX XXX XXXX"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="restaurant@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
