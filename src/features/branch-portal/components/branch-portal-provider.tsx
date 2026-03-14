"use client";

import { createContext, use } from "react";

export interface BranchPortalContextValue {
  branchId: string;
  restaurantId: string;
  portalSlug: string;
  branchName: string;
  restaurantName: string;
  restaurantSlug: string;
}

const BranchPortalContext = createContext<BranchPortalContextValue | null>(
  null,
);

export function BranchPortalProvider({
  value,
  children,
}: {
  value: BranchPortalContextValue;
  children: React.ReactNode;
}) {
  return (
    <BranchPortalContext.Provider value={value}>
      {children}
    </BranchPortalContext.Provider>
  );
}

export function useBranchPortal(): BranchPortalContextValue {
  const ctx = use(BranchPortalContext);
  if (!ctx) {
    throw new Error(
      "useBranchPortal must be used within a BranchPortalProvider",
    );
  }
  return ctx;
}
