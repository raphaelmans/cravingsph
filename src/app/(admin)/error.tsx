"use client";

import { appRoutes } from "@/common/app-routes";
import { RouteErrorState } from "@/components/feedback/route-error-state";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      title="The admin portal could not finish loading"
      description="The platform management view failed to render completely. Retry the request, or return to the admin overview."
      retry={reset}
      homeHref={appRoutes.admin.base}
      homeLabel="Back to admin"
      secondaryHref={appRoutes.admin.verification}
      secondaryLabel="Open verification queue"
    />
  );
}
