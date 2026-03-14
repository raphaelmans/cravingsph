"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { type LoginDTO, LoginSchema } from "@/modules/auth/dtos";
import { useLogin, useLoginWithGoogle } from "../hooks/use-auth";
import { GoogleSignInButton } from "./google-sign-in-button";

export interface LoginFormProps {
  redirectParam?: string | null;
}

export function LoginForm({ redirectParam }: LoginFormProps = {}) {
  const router = useRouter();
  const loginMutation = useLogin();
  const googleLoginMutation = useLoginWithGoogle();

  const redirectUrl = getSafeRedirectPath(redirectParam, {
    fallback: appRoutes.postLogin.base,
    origin: typeof window !== "undefined" ? window.location.origin : undefined,
    disallowRoutes: ["guest"],
  });

  const form = useForm<LoginDTO>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginDTO) => {
    try {
      await loginMutation.mutateAsync(data);
      router.push(redirectUrl);
      router.refresh();
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

  const registerHref =
    redirectUrl !== appRoutes.postLogin.base
      ? `${appRoutes.register.base}?redirect=${encodeURIComponent(redirectUrl)}`
      : appRoutes.register.base;

  const magicLinkHref =
    redirectUrl !== appRoutes.postLogin.base
      ? `${appRoutes.magicLink.base}?redirect=${encodeURIComponent(redirectUrl)}`
      : appRoutes.magicLink.base;

  return (
    <AuthSurface
      eyebrow="Welcome back"
      title="Sign in to CravingsPH"
      description="Access your orders, saved restaurants, and checkout."
      helperLabel="Browse first"
      helperHref={appRoutes.index.base}
      footer={
        <>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href={registerHref} className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            Prefer email-only access?{" "}
            <Link href={magicLinkHref} className="text-primary hover:underline">
              Sign in with magic link
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
                      placeholder="Enter your password"
                      autoComplete="current-password"
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
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Form>
    </AuthSurface>
  );
}
