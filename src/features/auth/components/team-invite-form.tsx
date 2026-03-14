"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle2,
  Loader2,
  LogIn,
  Shield,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { appRoutes } from "@/common/app-routes";
import { AuthSurface } from "@/components/brand/auth-surface";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useSession } from "../hooks/use-auth";

const ROLE_LABELS: Record<string, string> = {
  business_owner: "Business Owner",
  business_manager: "Business Manager",
  business_viewer: "Business Viewer",
  branch_manager: "Branch Manager",
  branch_staff: "Branch Staff",
  branch_viewer: "Branch Viewer",
};

interface TeamInviteFormProps {
  token?: string;
}

export function TeamInviteForm({ token }: TeamInviteFormProps) {
  const trpc = useTRPC();
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  const { data: session, isLoading: isSessionLoading } = useSession();

  const {
    data: invite,
    isLoading: isValidating,
    error: validationError,
  } = useQuery({
    ...trpc.teamAccess.invite.validate.queryOptions({ token: token ?? "" }),
    enabled: !!token,
    retry: false,
  });

  const acceptMutation = useMutation(
    trpc.teamAccess.invite.accept.mutationOptions(),
  );

  const onAccept = async () => {
    if (!invite) return;
    setAcceptError(null);

    try {
      await acceptMutation.mutateAsync({ inviteId: invite.id });
      setAccepted(true);

      // Redirect after a brief moment so user sees success
      setTimeout(() => {
        router.push(appRoutes.organization.base);
        router.refresh();
      }, 1500);
    } catch (error) {
      if (error instanceof Error) {
        setAcceptError(error.message);
      } else {
        setAcceptError("Something went wrong. Please try again.");
      }
    }
  };

  // No token provided
  if (!token) {
    return (
      <AuthSurface
        eyebrow="Team access"
        title="Invitation required"
        description="You need a valid invitation link to join a team."
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
          Ask the organization owner to send you a fresh invitation link.
        </div>
      </AuthSurface>
    );
  }

  // Validating token
  if (isValidating || isSessionLoading) {
    return (
      <AuthSurface
        eyebrow="Team access"
        title="Checking your invitation"
        description="We are validating the invite link."
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AuthSurface>
    );
  }

  // Token is invalid or expired
  if (validationError) {
    const errorMessage = getValidationErrorMessage(validationError);
    return (
      <AuthSurface
        eyebrow="Team access"
        title="Invalid invitation"
        description="This invite link is no longer valid."
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
          {errorMessage}
        </div>
      </AuthSurface>
    );
  }

  // Accepted successfully
  if (accepted) {
    return (
      <AuthSurface
        eyebrow="Team access"
        title="You're in!"
        description={`You've joined ${invite?.organizationName ?? "the team"} successfully.`}
      >
        <div className="flex flex-col items-center gap-4 py-8">
          <CheckCircle2 className="size-12 text-success" />
          <p className="text-center text-sm text-muted-foreground">
            Redirecting to your dashboard...
          </p>
        </div>
      </AuthSurface>
    );
  }

  // Valid invite — show details
  if (!invite) return null;

  const roleLabel = ROLE_LABELS[invite.roleTemplate] ?? invite.roleTemplate;
  const isBranchScope = invite.scopeType === "branch";

  // Build login/register URLs with redirect back to this page
  const returnUrl = `${appRoutes.registerTeam.base}?token=${encodeURIComponent(token)}`;
  const loginUrl = `${appRoutes.login.base}?redirect=${encodeURIComponent(returnUrl)}`;
  const registerUrl = `${appRoutes.register.base}?redirect=${encodeURIComponent(returnUrl)}`;

  return (
    <AuthSurface
      eyebrow="Team access"
      title="You've been invited"
      description={`${invite.organizationName} has invited you to join their team.`}
    >
      <div className="space-y-6">
        {/* Invite details card */}
        <div className="space-y-3 rounded-3xl border border-primary/15 bg-primary/[0.04] p-5">
          <div className="flex items-center gap-3">
            <Building2 className="size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">{invite.organizationName}</p>
              <p className="text-xs text-muted-foreground">Organization</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield className="size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">{roleLabel}</p>
              <p className="text-xs text-muted-foreground">
                {isBranchScope
                  ? `Branch: ${invite.scopeName}`
                  : invite.scopeName}
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Invited as{" "}
            <span className="font-medium text-foreground">{invite.email}</span>
          </p>
        </div>

        {acceptError && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {acceptError}
          </div>
        )}

        {/* Authenticated: show accept button */}
        {session ? (
          <div className="space-y-3">
            <Button
              className="w-full"
              shape="pill"
              size="lg"
              onClick={onAccept}
              disabled={acceptMutation.isPending}
            >
              {acceptMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Accept invitation"
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Signed in as {session.email}
            </p>
          </div>
        ) : (
          /* Not authenticated: show sign up / sign in options */
          <div className="space-y-3">
            <Button className="w-full" shape="pill" size="lg" asChild>
              <Link href={registerUrl}>
                <UserPlus className="size-4" />
                Sign up to accept
              </Link>
            </Button>
            <Button
              className="w-full"
              variant="outline"
              shape="pill"
              size="lg"
              asChild
            >
              <Link href={loginUrl}>
                <LogIn className="size-4" />
                Sign in to accept
              </Link>
            </Button>
          </div>
        )}
      </div>
    </AuthSurface>
  );
}

function getValidationErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("expired")) {
      return "This invitation has expired. Ask the organization owner to send a new one.";
    }
    if (message.includes("accepted")) {
      return "This invitation has already been accepted.";
    }
    if (message.includes("not pending") || message.includes("revoked")) {
      return "This invitation has been revoked and is no longer valid.";
    }
  }
  return "This invitation link is invalid or has expired. Ask the organization owner to send a new one.";
}
