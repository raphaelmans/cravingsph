"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import type { AdminRestaurantDetailRecord } from "@/modules/admin/repositories/admin.repository";
import { useAdminRestaurantUpdate } from "../hooks/use-admin-restaurants";

const AdminRestaurantProfileSchema = z.object({
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

type AdminRestaurantProfileValues = z.infer<
  typeof AdminRestaurantProfileSchema
>;

interface AdminRestaurantProfileFormProps {
  restaurant: AdminRestaurantDetailRecord;
}

function getDefaultValues(
  restaurant: AdminRestaurantDetailRecord,
): AdminRestaurantProfileValues {
  return {
    name: restaurant.name,
    description: restaurant.description ?? "",
    cuisineType: restaurant.cuisineType ?? "",
    phone: restaurant.phone ?? "",
    email: restaurant.email ?? "",
  };
}

export function AdminRestaurantProfileForm({
  restaurant,
}: AdminRestaurantProfileFormProps) {
  const updateRestaurant = useAdminRestaurantUpdate();
  const form = useForm<AdminRestaurantProfileValues>({
    resolver: zodResolver(AdminRestaurantProfileSchema),
    defaultValues: getDefaultValues(restaurant),
  });

  useEffect(() => {
    form.reset(getDefaultValues(restaurant));
  }, [form, restaurant]);

  async function onSubmit(values: AdminRestaurantProfileValues) {
    try {
      await updateRestaurant.mutateAsync({
        id: restaurant.id,
        name: values.name,
        description: values.description || "",
        cuisineType: values.cuisineType || "",
        phone: values.phone || "",
        email: values.email || undefined,
      });

      toast.success("Restaurant updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update restaurant",
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Restaurant profile</CardTitle>
        <CardDescription>
          Edit the restaurant details visible across the owner workspace and
          customer listing.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restaurant name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Restaurant name" />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add a short overview of the concept, cuisine, and positioning."
                      rows={4}
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
                  <FormLabel>Cuisine type</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Filipino, Japanese, etc." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="09XX XXX XXXX" />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="restaurant@example.com"
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button disabled={updateRestaurant.isPending} type="submit">
              {updateRestaurant.isPending ? "Saving..." : "Save restaurant"}
            </Button>
          </CardContent>
        </form>
      </Form>
    </Card>
  );
}
