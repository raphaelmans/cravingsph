"use client";

import { RouteErrorState } from "@/components/feedback/route-error-state";

export default function AuthError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      title="Authentication needs another try"
      description="We could not complete that sign-in or registration step. Retry once more, or return to the main login screen."
      retry={reset}
      homeHref="/login"
      homeLabel="Back to login"
      secondaryHref="/register"
      secondaryLabel="Create an account"
      shape="pill"
    />
  );
}
