"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { REQUIRED_VERIFICATION_DOCUMENTS } from "@/features/verification/hooks/use-owner-verification";
import type {
  AdminVerificationQueueItemRecord,
  AdminVerificationRequestRecord,
} from "@/modules/admin/repositories/admin.repository";
import { useTRPC } from "@/trpc/client";

type VerificationStatus = "pending" | "approved" | "rejected";

export interface AdminVerificationDocumentRecord {
  type: (typeof REQUIRED_VERIFICATION_DOCUMENTS)[number]["type"];
  label: string;
  description: string;
  fileName: string;
  uploadedAt: string;
  status: "uploaded" | "approved" | "flagged";
  note: string;
}

export const ADMIN_VERIFICATION_STATUS_META: Record<
  VerificationStatus,
  {
    label: string;
    description: string;
    badgeVariant: "default" | "secondary" | "destructive";
  }
> = {
  pending: {
    label: "Pending review",
    description: "Submitted and waiting on an admin decision.",
    badgeVariant: "default",
  },
  approved: {
    label: "Approved",
    description: "This restaurant can proceed with activation and payouts.",
    badgeVariant: "secondary",
  },
  rejected: {
    label: "Rejected",
    description: "The owner needs to update the flagged requirements.",
    badgeVariant: "destructive",
  },
};

function normalizeFileSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

export function formatAdminTimestamp(value: Date | string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getVerificationBadgeVariant(status: VerificationStatus) {
  return ADMIN_VERIFICATION_STATUS_META[status].badgeVariant;
}

export function buildAdminVerificationDocuments(
  request: Pick<
    AdminVerificationRequestRecord,
    "restaurantName" | "restaurantSlug" | "verificationStatus" | "submittedAt"
  >,
): AdminVerificationDocumentRecord[] {
  const slug = normalizeFileSlug(
    request.restaurantSlug || request.restaurantName,
  );
  const uploadedAt = toIsoString(request.submittedAt);

  return REQUIRED_VERIFICATION_DOCUMENTS.map((document) => {
    const extension = document.type === "valid_government_id" ? "jpg" : "pdf";
    const base = `${slug || "restaurant"}-${document.type.replaceAll("_", "-")}.${extension}`;

    if (request.verificationStatus === "approved") {
      return {
        type: document.type,
        label: document.label,
        description: document.description,
        fileName: base,
        uploadedAt,
        status: "approved" as const,
        note: "Checked and approved during the most recent review.",
      };
    }

    if (
      request.verificationStatus === "rejected" &&
      document.type === "business_permit"
    ) {
      return {
        type: document.type,
        label: document.label,
        description: document.description,
        fileName: base,
        uploadedAt,
        status: "flagged" as const,
        note: "Flagged for replacement during the previous review pass.",
      };
    }

    return {
      type: document.type,
      label: document.label,
      description: document.description,
      fileName: base,
      uploadedAt,
      status: "uploaded" as const,
      note: "Uploaded by the owner and ready for admin review.",
    };
  });
}

export function useAdminVerificationQueue() {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.admin.getVerificationQueue.queryOptions(),
    staleTime: 30 * 1000,
  });
}

export function useAdminVerificationRequest(requestId: string) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.admin.getVerificationRequest.queryOptions({ requestId }),
    enabled: requestId.length > 0,
    staleTime: 30 * 1000,
  });
}

export function useAdminVerificationDecision() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.admin.updateVerificationStatus.mutationOptions(),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: trpc.admin.getDashboardOverview.queryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: trpc.admin.getVerificationQueue.queryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: trpc.admin.getVerificationRequest.queryKey({
            requestId: variables.requestId,
          }),
        }),
      ]);
    },
  });
}

export function getPendingVerificationOrganizations(
  items: AdminVerificationQueueItemRecord[],
) {
  return new Set(items.map((item) => item.organizationId)).size;
}
