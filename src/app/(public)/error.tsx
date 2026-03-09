"use client";

import { RouteErrorState } from "@/components/feedback/route-error-state";

export default function PublicError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      title="Something interrupted the customer flow"
      description="The page could not finish loading. You can retry the request or head back to discovery and continue browsing restaurants."
      retry={reset}
      homeHref="/"
      homeLabel="Back to discovery"
      secondaryHref="/search"
      secondaryLabel="Search restaurants"
      shape="pill"
    />
  );
}
