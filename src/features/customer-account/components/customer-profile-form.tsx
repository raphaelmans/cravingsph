"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { useSession } from "@/features/auth/hooks";
import { useProfile, useUpdateProfile } from "@/features/profile";
import { UpdateProfileSchema } from "@/modules/profile/dtos/update-profile.dto";

type CustomerProfileFormValues = z.input<typeof UpdateProfileSchema>;

function getDefaultValues(
  profile?: {
    displayName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
  } | null,
  sessionEmail?: string | null,
): CustomerProfileFormValues {
  return {
    displayName: profile?.displayName ?? "",
    email: profile?.email ?? sessionEmail ?? "",
    phoneNumber: profile?.phoneNumber ?? "",
    avatarUrl: "",
  };
}

function formatUpdatedAt(updatedAt?: string | Date | null) {
  if (!updatedAt) {
    return "Your latest details will appear here after you save.";
  }

  const parsed = new Date(updatedAt);
  if (Number.isNaN(parsed.getTime())) {
    return "Your latest details will appear here after you save.";
  }

  return `Last updated ${new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed)}.`;
}

export function CustomerProfileForm() {
  const { data: profile, isLoading } = useProfile();
  const { data: session } = useSession();
  const updateProfile = useUpdateProfile();

  const form = useForm<CustomerProfileFormValues>({
    resolver: zodResolver(UpdateProfileSchema),
    mode: "onChange",
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    form.reset(getDefaultValues(profile, session?.email));
  }, [form, profile, session?.email]);

  async function onSubmit(values: CustomerProfileFormValues) {
    try {
      const normalizedValues = {
        ...values,
        email: values.email?.trim() || session?.email || "",
      };

      await updateProfile.mutateAsync(normalizedValues);
      form.reset(normalizedValues);
      toast.success("Account details updated.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update account.";
      form.setError("root", { message });
      toast.error(message);
    }
  }

  if (isLoading && !profile) {
    return (
      <section className="rounded-3xl border border-primary/15 bg-background p-6 shadow-sm">
        <div className="space-y-4">
          <Skeleton className="h-6 w-40 rounded-full" />
          <Skeleton className="h-4 w-72 rounded-full" />
        </div>
        <div className="mt-6 space-y-4">
          <Skeleton className="h-14 w-full rounded-full" />
          <Skeleton className="h-14 w-full rounded-full" />
          <Skeleton className="h-14 w-full rounded-full" />
          <Skeleton className="h-11 w-36 rounded-full" />
        </div>
      </section>
    );
  }

  const isSubmitting =
    updateProfile.isPending || form.formState.isSubmitting || isLoading;
  const isSubmitDisabled =
    isSubmitting || !form.formState.isDirty || !form.formState.isValid;

  return (
    <section className="rounded-3xl border border-primary/15 bg-background p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Profile details
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Keep your contact details current so receipts, support replies, and
            saved favorites stay tied to the right account.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <CheckCircle2 className="size-3.5" />
          {formatUpdatedAt(profile?.updatedAt)}
        </div>
      </div>

      <Form {...form}>
        <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          {form.formState.errors.root ? (
            <div className="rounded-3xl border border-destructive/20 bg-destructive/5 px-4 py-4 text-sm text-destructive">
              {form.formState.errors.root.message}
            </div>
          ) : null}

          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="px-1 text-sm font-medium">
                  Full name
                </FormLabel>
                <FormControl>
                  <Input
                    shape="pill"
                    placeholder="How should we address you?"
                    autoComplete="name"
                    {...field}
                    value={field.value ?? ""}
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
                <FormLabel className="px-1 text-sm font-medium">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    shape="pill"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...field}
                    value={field.value ?? ""}
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
                <FormLabel className="px-1 text-sm font-medium">
                  Mobile number
                </FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    shape="pill"
                    placeholder="+63 9XX XXX XXXX"
                    autoComplete="tel"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-4 border-t border-primary/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Changes apply to your signed-in customer experience immediately.
            </p>
            <Button type="submit" shape="pill" disabled={isSubmitDisabled}>
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Saving
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
