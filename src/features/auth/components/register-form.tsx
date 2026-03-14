"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { appRoutes } from "@/common/app-routes";
import { getSafeRedirectPath } from "@/common/redirects";
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
import { type RegisterDTO, RegisterSchema } from "@/modules/auth/dtos";
import { useLoginWithGoogle, useRegister } from "../hooks/use-auth";
import { GoogleSignInButton } from "./google-sign-in-button";

export interface RegisterFormProps {
  redirectParam?: string | null;
}

export function RegisterForm({ redirectParam }: RegisterFormProps = {}) {
  const [success, setSuccess] = useState(false);
  const registerMutation = useRegister();
  const googleLoginMutation = useLoginWithGoogle();

  const redirectUrl = getSafeRedirectPath(redirectParam, {
    fallback: appRoutes.postLogin.base,
    origin: typeof window !== "undefined" ? window.location.origin : undefined,
    disallowRoutes: ["guest"],
  });

  const form = useForm<RegisterDTO>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterDTO) => {
    try {
      await registerMutation.mutateAsync({
        ...data,
        redirect: redirectUrl,
        portalPreference: "customer",
      });
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
      const result = await googleLoginMutation.mutateAsync({
        redirect: redirectUrl,
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

  const loginHref =
    redirectUrl !== appRoutes.postLogin.base
      ? `${appRoutes.login.base}?redirect=${encodeURIComponent(redirectUrl)}`
      : appRoutes.login.base;

  if (success) {
    return (
      <AuthSurface
        eyebrow="Almost there"
        title="Check your inbox"
        description="Open the confirmation link on this device to finish setup."
        footer={
          <>
            <p className="text-sm text-muted-foreground">
              Didn&apos;t get it after a few minutes? Check spam or retry the
              sign-up flow with the same email.
            </p>
            <p className="text-sm text-muted-foreground">
              <Link href={loginHref} className="text-primary hover:underline">
                Back to sign in
              </Link>
            </p>
          </>
        }
      >
        <div className="rounded-3xl border border-primary/15 bg-primary/[0.04] p-5 text-sm leading-6 text-muted-foreground">
          Once you confirm your email, CravingsPH will send you straight to the
          right post-login route for ordering.
        </div>
      </AuthSurface>
    );
  }

  return (
    <AuthSurface
      eyebrow="Get started"
      title="Create your account"
      description="Save orders, speed up checkout, and keep your profile synced."
      helperLabel="For owners"
      helperHref={appRoutes.registerOwner.base}
      footer={
        <>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={loginHref} className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            Want to list your restaurant?{" "}
            <Link
              href={appRoutes.registerOwner.base}
              className="text-primary hover:underline"
            >
              Register as an owner
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
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending
              ? "Creating account..."
              : "Create account"}
          </Button>
        </form>
      </Form>
    </AuthSurface>
  );
}
