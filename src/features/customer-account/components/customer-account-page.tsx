"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRightLeft,
  History,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { appRoutes } from "@/common/app-routes";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { useSetPageHeader } from "@/components/layout/page-header-context";
import { Button } from "@/components/ui/button";
import { useLogout, useSession } from "@/features/auth/hooks";
import { useProfile } from "@/features/profile";
import { useTRPC } from "@/trpc/client";
import { CustomerProfileForm } from "./customer-profile-form";

function formatMemberSince(createdAt?: string | Date | null) {
  if (!createdAt) {
    return "Recently joined";
  }

  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) {
    return "Recently joined";
  }

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function getAccountLabel(
  displayName?: string | null,
  email?: string | null,
  fallbackEmail?: string | null,
) {
  if (displayName?.trim()) {
    return displayName.trim();
  }

  const address = email ?? fallbackEmail;
  if (!address) {
    return "Your CravingsPH account";
  }

  return address;
}

export function CustomerAccountPage() {
  useSetPageHeader({ title: "Profile settings", label: "Account" });
  const router = useRouter();
  const trpc = useTRPC();
  const { data: profile } = useProfile();
  const { data: session } = useSession();
  const logout = useLogout();
  const { data: organization } = useQuery({
    ...trpc.organization.mine.queryOptions(),
    retry: false,
  });

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        toast.success("You have been signed out.");
        router.push(appRoutes.login.from(appRoutes.customerAccount.base));
        router.refresh();
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "Unable to sign out.",
        );
      },
    });
  }

  const accountLabel = getAccountLabel(
    profile?.displayName,
    profile?.email,
    session?.email,
  );
  const memberSince = formatMemberSince(profile?.createdAt);

  return (
    <div className="min-h-dvh bg-linear-to-b from-peach via-background to-background">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pt-6">
        <AppPageHeader
          title={accountLabel}
          description={`Member since ${memberSince}`}
          icon={<UserRound className="size-5" />}
        />

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
          <CustomerProfileForm />

          <div className="space-y-4">
            <section className="rounded-3xl border border-primary/15 bg-background p-6 shadow-sm">
              <div className="space-y-1">
                <h2 className="font-heading text-2xl font-semibold tracking-tight">
                  Stay close to your routine
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Jump back into the flows you already use the most.
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <Link
                  href={appRoutes.orders.base}
                  className="flex items-center justify-between rounded-3xl border border-primary/10 px-4 py-4 transition-colors hover:bg-primary/5"
                >
                  <span className="inline-flex items-center gap-4">
                    <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <History className="size-4" />
                    </span>
                    <span>
                      <span className="block font-medium">Order history</span>
                      <span className="text-sm text-muted-foreground">
                        Reorder or leave a review for completed meals.
                      </span>
                    </span>
                  </span>
                  <span className="text-sm font-medium text-primary">Open</span>
                </Link>
              </div>
            </section>

            {organization && (
              <Link
                href={appRoutes.organization.base}
                className="flex items-center justify-between rounded-3xl border border-primary/15 bg-background p-6 shadow-sm transition-colors hover:bg-primary/5"
              >
                <span className="inline-flex items-center gap-4">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ArrowRightLeft className="size-4" />
                  </span>
                  <span>
                    <span className="block font-medium">
                      Switch to Owner Portal
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Manage your restaurant from the owner dashboard.
                    </span>
                  </span>
                </span>
                <span className="text-sm font-medium text-primary">Open</span>
              </Link>
            )}

            <section className="rounded-3xl border border-primary/15 bg-background p-6 shadow-sm">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
                <ShieldCheck className="size-3.5" />
                Session
              </div>

              <div className="mt-4 space-y-2">
                <h2 className="font-heading text-2xl font-semibold tracking-tight">
                  Sign out
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Use this if you are on a shared device or switching to a
                  different customer account.
                </p>
              </div>

              <Button
                type="button"
                shape="pill"
                variant="outline"
                className="mt-6 w-full justify-center border-primary/20 text-primary hover:bg-primary/5 hover:text-primary"
                onClick={handleLogout}
                disabled={logout.isPending}
              >
                <LogOut className="size-4" />
                {logout.isPending ? "Signing out..." : "Sign out"}
              </Button>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}
