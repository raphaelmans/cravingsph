"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTRPC } from "@/trpc/client";

export const REQUIRED_VERIFICATION_DOCUMENTS = [
  {
    type: "business_registration",
    label: "DTI / SEC registration",
    description: "Certificate of registration or incorporation papers.",
  },
  {
    type: "valid_government_id",
    label: "Valid government ID",
    description: "Owner or authorized representative ID with signature.",
  },
  {
    type: "business_permit",
    label: "Business permit",
    description: "Current mayor's permit or barangay clearance.",
  },
] as const;

export type VerificationDocumentType =
  (typeof REQUIRED_VERIFICATION_DOCUMENTS)[number]["type"];

export type OwnerVerificationStatus =
  | "draft"
  | "ready"
  | "under_review"
  | "approved"
  | "rejected";

export const VERIFICATION_STATUS_META = {
  draft: {
    label: "Draft",
    description: "Upload the required documents before submitting.",
    badgeVariant: "outline",
  },
  ready: {
    label: "Ready to submit",
    description: "Everything is complete. Submit when you are ready.",
    badgeVariant: "secondary",
  },
  under_review: {
    label: "Under review",
    description: "The admin team is checking your documents now.",
    badgeVariant: "default",
  },
  approved: {
    label: "Approved",
    description: "Your business is verified and ready for payouts.",
    badgeVariant: "secondary",
  },
  rejected: {
    label: "Changes requested",
    description: "Update the flagged documents and resubmit.",
    badgeVariant: "destructive",
  },
} as const;

export interface VerificationDocumentDraft {
  type: VerificationDocumentType;
  label: string;
  description: string;
  fileName: string | null;
  uploadedAt: string | null;
  isUploaded: boolean;
}

export interface OwnerVerificationRestaurantState {
  restaurant: {
    id: string;
    name: string;
    verificationStatus: string;
    email: string | null;
    phone: string | null;
  };
  status: OwnerVerificationStatus;
  documents: VerificationDocumentDraft[];
  uploadedDocuments: number;
  totalDocuments: number;
  completionPercent: number;
  canSubmit: boolean;
}

function resolveStatus(
  verificationStatus: string,
  uploadedCount: number,
): OwnerVerificationStatus {
  if (verificationStatus === "approved") return "approved";
  if (verificationStatus === "rejected") return "rejected";
  if (verificationStatus === "pending") return "under_review";
  if (uploadedCount === REQUIRED_VERIFICATION_DOCUMENTS.length) return "ready";
  return "draft";
}

export function useOwnerVerification() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const organizationQuery = useQuery({
    ...trpc.organization.mine.queryOptions(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const restaurantsQuery = useQuery({
    ...trpc.restaurant.listByOrganization.queryOptions({
      organizationId: organizationQuery.data?.id ?? "",
    }),
    enabled: Boolean(organizationQuery.data?.id),
    staleTime: 2 * 60 * 1000,
  });

  const restaurants = restaurantsQuery.data ?? [];

  // Fetch verification status for the first restaurant (most owners have one)
  const firstRestaurantId = restaurants[0]?.id ?? "";

  const statusQuery = useQuery({
    ...trpc.verification.getRestaurantStatus.queryOptions({
      restaurantId: firstRestaurantId,
    }),
    enabled: Boolean(firstRestaurantId),
    staleTime: 60 * 1000,
  });

  // Build a map: restaurantId → status data
  // For simplicity, query all statuses from the single endpoint per restaurant.
  // We'll gather them all via individual queries per restaurant later if needed.
  // For now, the verification page typically shows a single selected restaurant.

  const verificationItems = useMemo<OwnerVerificationRestaurantState[]>(() => {
    return restaurants.map((r) => {
      const statusData =
        statusQuery.data?.restaurantId === r.id ? statusQuery.data : undefined;
      const uploadedCount = statusData?.uploadedCount ?? 0;
      const verificationStatus =
        statusData?.verificationStatus ?? r.verificationStatus;
      const status = resolveStatus(verificationStatus, uploadedCount);

      const documents: VerificationDocumentDraft[] =
        REQUIRED_VERIFICATION_DOCUMENTS.map((doc) => {
          const uploaded = statusData?.documents.find(
            (d) => d.documentType === doc.type,
          );
          return {
            type: doc.type,
            label: doc.label,
            description: doc.description,
            fileName: uploaded?.fileName ?? null,
            uploadedAt: uploaded?.uploadedAt ?? null,
            isUploaded: Boolean(uploaded),
          };
        });

      const canSubmit =
        status === "ready" ||
        (status === "rejected" &&
          uploadedCount === REQUIRED_VERIFICATION_DOCUMENTS.length);

      return {
        restaurant: {
          id: r.id,
          name: r.name,
          verificationStatus,
          email: r.email ?? null,
          phone: r.phone ?? null,
        },
        status,
        documents,
        uploadedDocuments: uploadedCount,
        totalDocuments: REQUIRED_VERIFICATION_DOCUMENTS.length,
        completionPercent:
          (uploadedCount / REQUIRED_VERIFICATION_DOCUMENTS.length) * 100,
        canSubmit,
      };
    });
  }, [restaurants, statusQuery.data]);

  function invalidateStatus(restaurantId: string) {
    queryClient.invalidateQueries({
      queryKey: trpc.verification.getRestaurantStatus.queryKey({
        restaurantId,
      }),
    });
  }

  const uploadMutation = useMutation({
    ...trpc.verification.uploadDocument.mutationOptions(),
    onSuccess: (_data, variables) => {
      invalidateStatus(variables.restaurantId);
    },
  });

  const removeMutation = useMutation({
    ...trpc.verification.removeDocument.mutationOptions(),
    onSuccess: (_data, variables) => {
      invalidateStatus(variables.restaurantId);
    },
  });

  const submitMutation = useMutation({
    ...trpc.verification.submit.mutationOptions(),
    onSuccess: (_data, variables) => {
      invalidateStatus(variables.restaurantId);
      queryClient.invalidateQueries({
        queryKey: trpc.restaurant.listByOrganization.queryKey({
          organizationId: organizationQuery.data?.id ?? "",
        }),
      });
    },
  });

  function uploadDocument(
    restaurantId: string,
    type: VerificationDocumentType,
    fileName: string,
    fileUrl: string,
  ) {
    uploadMutation.mutate({
      restaurantId,
      documentType: type,
      fileName,
      fileUrl,
    });
  }

  function removeDocument(
    restaurantId: string,
    type: VerificationDocumentType,
  ) {
    removeMutation.mutate({
      restaurantId,
      documentType: type,
    });
  }

  function submitVerification(restaurantId: string) {
    submitMutation.mutate({ restaurantId });
  }

  function fetchStatus(restaurantId: string) {
    queryClient.prefetchQuery(
      trpc.verification.getRestaurantStatus.queryOptions({
        restaurantId,
      }),
    );
  }

  return {
    organization: organizationQuery.data ?? null,
    verificationItems,
    isLoading:
      organizationQuery.isLoading ||
      restaurantsQuery.isLoading ||
      statusQuery.isLoading,
    uploadDocument,
    removeDocument,
    submitVerification,
    fetchStatus,
  };
}
