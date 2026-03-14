"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Skeleton } from "@/components/ui/skeleton";
import { UpdateProfileSchema } from "@/modules/profile/dtos/update-profile.dto";
import { useProfile, useUpdateProfile } from "../hooks";

type ProfileFormValues = z.input<typeof UpdateProfileSchema>;

export function ProfileForm() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(UpdateProfileSchema),
    mode: "onChange",
    defaultValues: {
      displayName: "",
      email: "",
      phoneNumber: "",
      avatarUrl: "",
    },
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    form.reset({
      displayName: profile.displayName ?? "",
      email: profile.email ?? "",
      phoneNumber: profile.phoneNumber ?? "",
      avatarUrl: profile.avatarUrl ?? "",
    });
  }, [form, profile]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await updateProfile.mutateAsync(values);
      form.reset(values);
    } catch (error) {
      if (error instanceof Error) {
        form.setError("root", { message: error.message });
      } else {
        form.setError("root", { message: "Unable to update profile" });
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-3xl border-border/70 bg-background/95">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  const submitting = updateProfile.isPending || form.formState.isSubmitting;
  const isSubmitDisabled =
    submitting || !form.formState.isDirty || !form.formState.isValid;

  return (
    <Card className="rounded-3xl border-border/70 bg-background/95">
      <CardHeader>
        <CardTitle className="font-heading text-xl font-semibold tracking-tight">
          Profile
        </CardTitle>
        <CardDescription>
          Manage your personal details used across authenticated features.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {form.formState.errors.root && (
              <div className="rounded-3xl border border-destructive/20 bg-destructive/5 px-4 py-4 text-sm text-destructive">
                {form.formState.errors.root.message}
              </div>
            )}

            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input shape="pill" placeholder="Your name" {...field} />
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
                      type="email"
                      shape="pill"
                      placeholder="you@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      shape="pill"
                      placeholder="+1 555 123 4567"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter>
            <Button type="submit" shape="pill" disabled={isSubmitDisabled}>
              {submitting ? "Saving..." : "Save Profile"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
