"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { appRoutes } from "@/common/app-routes";
import { AuthSurface } from "@/components/brand/auth-surface";
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
      <AuthSurface
        eyebrow="Owner access"
        title="Invitation required"
        description="Owner registration is invite-only so restaurant records stay clean and verified."
        footer={
          <p className="text-sm text-muted-foreground">
            <Link
              href={appRoutes.index.base}
              className="text-primary hover:underline"
            >
              Back to home
            </Link>
          </p>
        }
      >
        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-5 text-sm leading-6 text-destructive">
          Contact CravingsPH for a fresh invitation link or onboarding support.
        </div>
      </AuthSurface>
    );
  }

  // Validating token
  if (isValidating) {
    return (
      <AuthSurface
        eyebrow="Owner access"
        title="Checking your invitation"
        description="We are validating the invite link before creating your owner account."
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AuthSurface>
    );
  }

  // Token is invalid or expired
  if (validationError) {
    return (
      <AuthSurface
        eyebrow="Owner access"
        title="Invalid invitation"
        description="This invite link has expired or is no longer valid."
        footer={
          <p className="text-sm text-muted-foreground">
            <Link
              href={appRoutes.index.base}
              className="text-primary hover:underline"
            >
              Back to home
            </Link>
          </p>
        }
      >
        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-5 text-sm leading-6 text-destructive">
          Contact CravingsPH to request a fresh owner invitation before trying
          again.
        </div>
      </AuthSurface>
    );
  }

  if (success) {
    return (
      <AuthSurface
        eyebrow="Owner access"
        title="Check your inbox"
        description="We sent a confirmation link to your email. After verification, CravingsPH will send you to the owner setup hub."
        footer={
          <>
            <p className="text-sm text-muted-foreground">
              Keep this browser handy. We also saved your organization name
              locally so the setup flow can prefill it after verification.
            </p>
            <p className="text-sm text-muted-foreground">
              <Link
                href={appRoutes.login.base}
                className="text-primary hover:underline"
              >
                Back to sign in
              </Link>
            </p>
          </>
        }
      >
        <div className="rounded-3xl border border-primary/15 bg-primary/[0.04] p-5 text-sm leading-6 text-muted-foreground">
          If the email does not arrive, check spam and request a new invite from
          the admin who sent your original link.
        </div>
      </AuthSurface>
    );
  }

  return (
    <AuthSurface
      eyebrow="Owner access"
      title="Accept your owner invitation"
      description="Create an owner account to set up your restaurant, manage branches, and run operations from the dashboard."
      helperLabel="Customer sign-up"
      helperHref={appRoutes.register.base}
      footer={
        <>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={appRoutes.login.base}
              className="text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            Just want to order food?{" "}
            <Link
              href={appRoutes.register.base}
              className="text-primary hover:underline"
            >
              Create a customer account
            </Link>
          </p>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {form.formState.errors.root && (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {form.formState.errors.root.message}
              </div>
            )}

            <GoogleSignInButton
              onClick={onGoogleLogin}
              isLoading={googleLoginMutation.isPending}
              label="Continue with Google"
            />

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                or
              </span>
              <Separator className="flex-1" />
            </div>

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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      shape="pill"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            shape="pill"
            size="lg"
            disabled={
              registerMutation.isPending || acceptInvitationMutation.isPending
            }
          >
            {registerMutation.isPending || acceptInvitationMutation.isPending
              ? "Creating account..."
              : "Create owner account"}
          </Button>
        </form>
      </Form>
    </AuthSurface>
  );
}
