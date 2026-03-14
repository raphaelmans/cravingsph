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
import { type MagicLinkDTO, MagicLinkSchema } from "@/modules/auth/dtos";
import { useMagicLink } from "../hooks/use-auth";

export interface MagicLinkFormProps {
  redirectParam?: string | null;
}

export function MagicLinkForm({ redirectParam }: MagicLinkFormProps = {}) {
  const [success, setSuccess] = useState(false);
  const magicLinkMutation = useMagicLink();

  const redirectUrl = getSafeRedirectPath(redirectParam, {
    fallback: appRoutes.postLogin.base,
    origin: typeof window !== "undefined" ? window.location.origin : undefined,
    disallowRoutes: ["guest"],
  });

  const form = useForm<MagicLinkDTO>({
    resolver: zodResolver(MagicLinkSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: MagicLinkDTO) => {
    try {
      await magicLinkMutation.mutateAsync({
        ...data,
        redirect: redirectUrl,
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

  const loginHref =
    redirectUrl !== appRoutes.postLogin.base
      ? `${appRoutes.login.base}?redirect=${encodeURIComponent(redirectUrl)}`
      : appRoutes.login.base;

  if (success) {
    return (
      <AuthSurface
        eyebrow="Check your email"
        title="Magic link sent"
        description="Open the link on this device to sign in. It should arrive within a minute."
        footer={
          <>
            <p className="text-sm text-muted-foreground">
              If it does not arrive, check spam and request a fresh link.
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
          The link will return you to the safe redirect you originally asked for
          after authentication.
        </div>
      </AuthSurface>
    );
  }

  return (
    <AuthSurface
      eyebrow="Passwordless"
      title="Sign in with email"
      description="We'll send a one-tap link — no password needed."
      helperLabel="Use password"
      helperHref={loginHref}
      footer={
        <p className="text-sm text-muted-foreground">
          Prefer the standard flow?{" "}
          <Link href={loginHref} className="text-primary hover:underline">
            Sign in with password
          </Link>
        </p>
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
          </div>

          <Button
            type="submit"
            className="w-full"
            shape="pill"
            size="lg"
            disabled={magicLinkMutation.isPending}
          >
            {magicLinkMutation.isPending ? "Sending..." : "Send magic link"}
          </Button>
        </form>
      </Form>
    </AuthSurface>
  );
}
