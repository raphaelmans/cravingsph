"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Building2, Check } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import {
  type CreateOrganizationDTO,
  CreateOrganizationSchema,
} from "@/modules/organization/dtos/organization.dto";
import { useTRPC } from "@/trpc/client";
import { getQueryClient } from "@/trpc/query-client";

const ORG_NAME_STORAGE_KEY = "cravings:pending-org-name";

interface OrganizationFormProps {
  existingName?: string;
  isComplete: boolean;
  onComplete: () => void;
}

export function OrganizationForm({
  existingName,
  isComplete,
  onComplete,
}: OrganizationFormProps) {
  const trpc = useTRPC();
  const queryClient = getQueryClient();

  const createMutation = useMutation({
    ...trpc.organization.create.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: trpc.organization.mine.queryKey(),
      });
      localStorage.removeItem(ORG_NAME_STORAGE_KEY);
      onComplete();
    },
  });

  const form = useForm<CreateOrganizationDTO>({
    resolver: zodResolver(CreateOrganizationSchema),
    defaultValues: { name: "" },
  });

  // Pre-populate from localStorage (set during owner registration)
  useEffect(() => {
    if (!isComplete) {
      const pending = localStorage.getItem(ORG_NAME_STORAGE_KEY);
      if (pending) {
        form.setValue("name", pending);
      }
    }
  }, [isComplete, form]);

  if (isComplete) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-success/10">
              <Check className="size-5 text-success" />
            </div>
            <div>
              <CardTitle className="text-base">Organization Created</CardTitle>
              <CardDescription>{existingName}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={onComplete}>Continue</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Create Organization</CardTitle>
            <CardDescription>
              Your organization is the parent entity for all your restaurants
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
        >
          <CardContent className="space-y-4">
            {form.formState.errors.root && (
              <div className="text-destructive text-sm">
                {form.formState.errors.root.message}
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Juan's Food Group"
                      autoComplete="organization"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Organization"}
            </Button>
          </CardContent>
        </form>
      </Form>
    </Card>
  );
}
