"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function HealthCheck() {
  const trpc = useTRPC();
  const { data, isLoading, isError, error } = useQuery(
    trpc.health.check.queryOptions(),
  );

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 rounded-lg bg-warning/10 px-4 py-2 text-sm text-warning shadow-lg">
        Checking health...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="fixed bottom-4 right-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive shadow-lg">
        Health check failed: {error?.message}
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 rounded-lg bg-success/10 px-4 py-2 text-sm text-success shadow-lg">
      <div className="font-medium">Server: {data?.status}</div>
      <div className="text-xs opacity-75">
        Uptime: {Math.floor(data?.uptime ?? 0)}s
      </div>
    </div>
  );
}
