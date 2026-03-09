"use client";

import { appRoutes } from "@/common/app-routes";
import { RouteErrorState } from "@/components/feedback/route-error-state";

export default function OwnerError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      title="The owner portal hit a snag"
      description="We could not finish loading this management screen. Retry the request, or jump back to your dashboard and continue from there."
      retry={reset}
      homeHref={appRoutes.organization.base}
      homeLabel="Back to dashboard"
      secondaryHref={appRoutes.organization.getStarted}
      secondaryLabel="Open setup hub"
    />
  );
}
