"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { appRoutes } from "@/common/app-routes";
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
import { Separator } from "@/components/ui/separator";
import { RegisterSchema } from "@/modules/auth/dtos";
import { useTRPC } from "@/trpc/client";
import { useLoginWithGoogle, useRegister } from "../hooks/use-auth";
import { GoogleSignInButton } from "./google-sign-in-button";

const OwnerRegisterSchema = RegisterSchema.extend({
  organizationName: z
    .string()
    .min(1, "Organization name is required")
    .max(200, "Must be at most 200 characters")
    .transform((value) => value.trim()),
});

type OwnerRegisterDTO = z.infer<typeof OwnerRegisterSchema>;

const ONBOARDING_REDIRECT = appRoutes.organization.getStarted;
const ORG_NAME_STORAGE_KEY = "cravings:pending-org-name";

interface OwnerRegisterFormProps {
  token?: string;
}

export function OwnerRegisterForm({ token }: OwnerRegisterFormProps) {
  const trpc = useTRPC();
  const [success, setSuccess] = useState(false);
  const registerMutation = useRegister();
  const googleLoginMutation = useLoginWithGoogle();

  const acceptInvitationMutation = useMutation(
    trpc.invitation.accept.mutationOptions(),
  );

  const {
    data: invitation,
    isLoading: isValidating,
    error: validationError,
  } = useQuery({
    ...trpc.invitation.validate.queryOptions({ token: token ?? "" }),
    enabled: !!token,
    retry: false,
  });

  const form = useForm<OwnerRegisterDTO>({
    resolver: zodResolver(OwnerRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      organizationName: "",
    },
  });

  // Pre-fill email and organization name from invitation
  useEffect(() => {
    if (invitation) {
      if (invitation.email) {
        form.setValue("email", invitation.email);
      }
      if (invitation.restaurantName) {
        form.setValue("organizationName", invitation.restaurantName);
      }
    }
  }, [invitation, form]);

  const onSubmit = async (data: OwnerRegisterDTO) => {
    try {
      // Store org name for onboarding to pick up after email confirmation
      localStorage.setItem(ORG_NAME_STORAGE_KEY, data.organizationName);

      await registerMutation.mutateAsync({
        email: data.email,
        password: data.password,
        redirect: ONBOARDING_REDIRECT,
        portalPreference: "owner",
      });

      // Mark invitation as accepted after successful registration
      if (token) {
        await acceptInvitationMutation.mutateAsync({ token });
      }

      setSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        form.setError("root", { message: error.message });
      } else {
        form.setError("root", { message: "An unexpected error occurred" });
      }
    }
  };

  const onGoogleLogin = async () => {
    try {
      // Store org name before redirect
      const orgName = form.getValues("organizationName");
      if (orgName) {
        localStorage.setItem(ORG_NAME_STORAGE_KEY, orgName);
      }

      // Store token for post-login acceptance
      if (token) {
        localStorage.setItem("cravings:pending-invite-token", token);
      }

      const result = await googleLoginMutation.mutateAsync({
        redirect: ONBOARDING_REDIRECT,
      });
      window.location.assign(result.url);
    } catch (error) {
      if (error instanceof Error) {
        form.setError("root", { message: error.message });
      } else {
        form.setError("root", { message: "An unexpected error occurred" });
      }
    }
  };

  // No token provided — invitation required
  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-6" />
          </div>
          <CardTitle>Invitation Required</CardTitle>
          <CardDescription>
            Registration requires an invitation link. Contact CravingsPH to get
            started.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href={appRoutes.index.base}>
            <Button variant="outline">Back to home</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // Validating token
  if (isValidating) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Token is invalid or expired
  if (validationError) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-6" />
          </div>
          <CardTitle>Invalid Invitation</CardTitle>
          <CardDescription>
            This invitation link is invalid or has expired. Contact CravingsPH
            to request a new one.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href={appRoutes.index.base}>
            <Button variant="outline">Back to home</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent a confirmation link to your email address. Please
            click the link to verify your account and start setting up your
            restaurant.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link
            href={appRoutes.login.base}
            className="text-primary hover:underline text-sm"
          >
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>You&apos;ve been invited to join CravingsPH</CardTitle>
        <CardDescription>
          Create an owner account to manage your restaurant on CravingsPH
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <CardContent className="space-y-4">
            {form.formState.errors.root && (
              <div className="text-destructive text-sm">
                {form.formState.errors.root.message}
              </div>
            )}

            <GoogleSignInButton
              onClick={onGoogleLogin}
              isLoading={googleLoginMutation.isPending}
            />

            <Separator />

            <FormField
              control={form.control}
              name="organizationName"
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

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={
                registerMutation.isPending || acceptInvitationMutation.isPending
              }
            >
              {registerMutation.isPending || acceptInvitationMutation.isPending
                ? "Creating account..."
                : "Create Owner Account"}
            </Button>

            <div className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link
                href={appRoutes.login.base}
                className="text-primary hover:underline"
              >
                Sign in
              </Link>
            </div>

            <div className="text-muted-foreground text-sm">
              Just want to order food?{" "}
              <Link
                href={appRoutes.register.base}
                className="text-primary hover:underline"
              >
                Create a customer account
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
