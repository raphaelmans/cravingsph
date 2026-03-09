"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useSyncExternalStore } from "react";
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

interface VerificationDocumentStoreEntry {
  fileName: string | null;
  uploadedAt: string | null;
}

interface RestaurantVerificationDraft {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
  submittedAt: string | null;
  feedback: string | null;
  statusOverride: OwnerVerificationStatus | null;
  documents: Record<VerificationDocumentType, VerificationDocumentStoreEntry>;
}

interface VerificationStore {
  byRestaurantId: Record<string, RestaurantVerificationDraft>;
}

interface RestaurantVerificationRecord {
  id: string;
  name: string;
  verificationStatus: string;
  email: string | null;
  phone: string | null;
}

export interface OwnerVerificationRestaurantState {
  restaurant: RestaurantVerificationRecord;
  draft: RestaurantVerificationDraft;
  status: OwnerVerificationStatus;
  documents: VerificationDocumentDraft[];
  uploadedDocuments: number;
  totalDocuments: number;
  completionPercent: number;
  canSubmit: boolean;
}

const SEEDED_SUBMITTED_AT = "2026-03-06T09:00:00.000Z";

let verificationStore: VerificationStore = {
  byRestaurantId: {},
};

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function getSnapshot() {
  return verificationStore;
}

function setStore(next: VerificationStore) {
  verificationStore = next;
  emitChange();
}

function createEmptyDocuments(): Record<
  VerificationDocumentType,
  VerificationDocumentStoreEntry
> {
  return {
    business_registration: {
      fileName: null,
      uploadedAt: null,
    },
    valid_government_id: {
      fileName: null,
      uploadedAt: null,
    },
    business_permit: {
      fileName: null,
      uploadedAt: null,
    },
  };
}

function createUploadedDocuments(
  restaurantName: string,
): Record<VerificationDocumentType, VerificationDocumentStoreEntry> {
  const normalizedName = restaurantName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    business_registration: {
      fileName: `${normalizedName || "restaurant"}-registration.pdf`,
      uploadedAt: SEEDED_SUBMITTED_AT,
    },
    valid_government_id: {
      fileName: `${normalizedName || "restaurant"}-owner-id.jpg`,
      uploadedAt: SEEDED_SUBMITTED_AT,
    },
    business_permit: {
      fileName: `${normalizedName || "restaurant"}-permit.pdf`,
      uploadedAt: SEEDED_SUBMITTED_AT,
    },
  };
}

function createInitialDraft(
  restaurant: RestaurantVerificationRecord,
): RestaurantVerificationDraft {
  const contactName = `${restaurant.name} Operations`;
  const contactEmail =
    restaurant.email ??
    `${restaurant.name.toLowerCase().replace(/\s+/g, "")}@cravings.ph`;

  if (restaurant.verificationStatus === "approved") {
    return {
      contactName,
      contactEmail,
      contactPhone: restaurant.phone ?? "",
      notes: "Approved. Keep your permit and IDs current for yearly renewals.",
      submittedAt: SEEDED_SUBMITTED_AT,
      feedback: null,
      statusOverride: null,
      documents: createUploadedDocuments(restaurant.name),
    };
  }

  if (restaurant.verificationStatus === "rejected") {
    return {
      contactName,
      contactEmail,
      contactPhone: restaurant.phone ?? "",
      notes: "Updated permit copy is ready for re-review.",
      submittedAt: SEEDED_SUBMITTED_AT,
      feedback:
        "Please replace the expired permit scan and ensure the document corners are fully visible.",
      statusOverride: null,
      documents: createUploadedDocuments(restaurant.name),
    };
  }

  if (restaurant.verificationStatus === "pending") {
    return {
      contactName,
      contactEmail,
      contactPhone: restaurant.phone ?? "",
      notes:
        "Submitted through the owner portal. Waiting for the platform team to review the documents.",
      submittedAt: SEEDED_SUBMITTED_AT,
      feedback: null,
      statusOverride: "under_review",
      documents: createUploadedDocuments(restaurant.name),
    };
  }

  return {
    contactName,
    contactEmail,
    contactPhone: restaurant.phone ?? "",
    notes: "",
    submittedAt: null,
    feedback: null,
    statusOverride: null,
    documents: createEmptyDocuments(),
  };
}

function mergeDraft(
  base: RestaurantVerificationDraft,
  override?: RestaurantVerificationDraft,
) {
  if (!override) {
    return base;
  }

  return {
    ...base,
    ...override,
    documents: {
      ...base.documents,
      ...override.documents,
    },
  };
}

function buildDocuments(draft: RestaurantVerificationDraft) {
  return REQUIRED_VERIFICATION_DOCUMENTS.map((document) => {
    const entry = draft.documents[document.type];

    return {
      type: document.type,
      label: document.label,
      description: document.description,
      fileName: entry.fileName,
      uploadedAt: entry.uploadedAt,
      isUploaded: Boolean(entry.fileName),
    } satisfies VerificationDocumentDraft;
  });
}

function resolveStatus(
  restaurant: RestaurantVerificationRecord,
  draft: RestaurantVerificationDraft,
  uploadedDocuments: number,
) {
  if (restaurant.verificationStatus === "approved") {
    return "approved" satisfies OwnerVerificationStatus;
  }

  if (restaurant.verificationStatus === "rejected") {
    return draft.statusOverride === "under_review"
      ? "under_review"
      : "rejected";
  }

  if (
    restaurant.verificationStatus === "pending" ||
    draft.statusOverride === "under_review"
  ) {
    return "under_review" satisfies OwnerVerificationStatus;
  }

  const hasContactDetails =
    draft.contactName.trim().length > 0 && draft.contactEmail.trim().length > 0;

  if (
    uploadedDocuments === REQUIRED_VERIFICATION_DOCUMENTS.length &&
    hasContactDetails
  ) {
    return "ready" satisfies OwnerVerificationStatus;
  }

  return "draft" satisfies OwnerVerificationStatus;
}

export function useOwnerVerification() {
  const trpc = useTRPC();
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

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

  const restaurants = useMemo<RestaurantVerificationRecord[]>(
    () =>
      (restaurantsQuery.data ?? []).map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        verificationStatus: restaurant.verificationStatus,
        email: restaurant.email ?? null,
        phone: restaurant.phone ?? null,
      })),
    [restaurantsQuery.data],
  );

  const restaurantMap = useMemo(
    () => new Map(restaurants.map((restaurant) => [restaurant.id, restaurant])),
    [restaurants],
  );

  const verificationItems = useMemo<OwnerVerificationRestaurantState[]>(
    () =>
      restaurants.map((restaurant) => {
        const draft = mergeDraft(
          createInitialDraft(restaurant),
          snapshot.byRestaurantId[restaurant.id],
        );
        const documents = buildDocuments(draft);
        const uploadedDocuments = documents.filter(
          (document) => document.isUploaded,
        ).length;
        const status = resolveStatus(restaurant, draft, uploadedDocuments);
        const canSubmit =
          status === "ready" ||
          (status === "rejected" &&
            uploadedDocuments === REQUIRED_VERIFICATION_DOCUMENTS.length);

        return {
          restaurant,
          draft,
          status,
          documents,
          uploadedDocuments,
          totalDocuments: REQUIRED_VERIFICATION_DOCUMENTS.length,
          completionPercent:
            (uploadedDocuments / REQUIRED_VERIFICATION_DOCUMENTS.length) * 100,
          canSubmit,
        };
      }),
    [restaurants, snapshot.byRestaurantId],
  );

  function updateDraft(
    restaurantId: string,
    updater: (
      draft: RestaurantVerificationDraft,
    ) => RestaurantVerificationDraft,
  ) {
    const restaurant = restaurantMap.get(restaurantId);

    if (!restaurant) {
      return;
    }

    const currentDraft = mergeDraft(
      createInitialDraft(restaurant),
      verificationStore.byRestaurantId[restaurantId],
    );

    setStore({
      byRestaurantId: {
        ...verificationStore.byRestaurantId,
        [restaurantId]: updater(currentDraft),
      },
    });
  }

  function updateContactDetails(
    restaurantId: string,
    updates: Partial<
      Pick<
        RestaurantVerificationDraft,
        "contactName" | "contactEmail" | "contactPhone" | "notes"
      >
    >,
  ) {
    updateDraft(restaurantId, (draft) => ({
      ...draft,
      ...updates,
    }));
  }

  function uploadDocument(
    restaurantId: string,
    type: VerificationDocumentType,
    fileName: string,
  ) {
    updateDraft(restaurantId, (draft) => ({
      ...draft,
      statusOverride: null,
      feedback: null,
      documents: {
        ...draft.documents,
        [type]: {
          fileName,
          uploadedAt: new Date().toISOString(),
        },
      },
    }));
  }

  function removeDocument(
    restaurantId: string,
    type: VerificationDocumentType,
  ) {
    updateDraft(restaurantId, (draft) => ({
      ...draft,
      statusOverride: null,
      documents: {
        ...draft.documents,
        [type]: {
          fileName: null,
          uploadedAt: null,
        },
      },
    }));
  }

  function submitVerification(restaurantId: string) {
    updateDraft(restaurantId, (draft) => ({
      ...draft,
      submittedAt: new Date().toISOString(),
      statusOverride: "under_review",
      feedback: null,
    }));
  }

  return {
    organization: organizationQuery.data ?? null,
    verificationItems,
    isLoading: organizationQuery.isLoading || restaurantsQuery.isLoading,
    updateContactDetails,
    uploadDocument,
    removeDocument,
    submitVerification,
  };
}
