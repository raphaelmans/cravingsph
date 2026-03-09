import { and, eq } from "drizzle-orm";
import {
  organization,
  restaurant,
  verificationDocument,
} from "@/shared/infra/db/schema";
import type { DbClient } from "@/shared/infra/db/types";

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------

export interface VerificationDocumentRow {
  id: string;
  restaurantId: string;
  documentType: string;
  fileName: string | null;
  fileUrl: string | null;
  uploadedAt: Date | null;
  status: string;
  rejectionReason: string | null;
}

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IVerificationRepository {
  findDocumentsByRestaurantId(
    restaurantId: string,
  ): Promise<VerificationDocumentRow[]>;
  upsertDocument(data: {
    restaurantId: string;
    documentType: string;
    fileName: string;
    fileUrl: string;
  }): Promise<VerificationDocumentRow>;
  deleteDocument(restaurantId: string, documentType: string): Promise<void>;
  findRestaurantOwner(
    restaurantId: string,
  ): Promise<{ ownerId: string; verificationStatus: string } | null>;
  updateVerificationStatus(restaurantId: string, status: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

const selectFields = {
  id: verificationDocument.id,
  restaurantId: verificationDocument.restaurantId,
  documentType: verificationDocument.documentType,
  fileName: verificationDocument.fileName,
  fileUrl: verificationDocument.fileUrl,
  uploadedAt: verificationDocument.uploadedAt,
  status: verificationDocument.status,
  rejectionReason: verificationDocument.rejectionReason,
} as const;

export class VerificationRepository implements IVerificationRepository {
  constructor(private db: DbClient) {}

  async findDocumentsByRestaurantId(
    restaurantId: string,
  ): Promise<VerificationDocumentRow[]> {
    return this.db
      .select(selectFields)
      .from(verificationDocument)
      .where(eq(verificationDocument.restaurantId, restaurantId));
  }

  async upsertDocument(data: {
    restaurantId: string;
    documentType: string;
    fileName: string;
    fileUrl: string;
  }): Promise<VerificationDocumentRow> {
    const now = new Date();
    const [row] = await this.db
      .insert(verificationDocument)
      .values({
        restaurantId: data.restaurantId,
        documentType: data.documentType,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        uploadedAt: now,
        status: "pending",
      })
      .onConflictDoUpdate({
        target: [
          verificationDocument.restaurantId,
          verificationDocument.documentType,
        ],
        set: {
          fileName: data.fileName,
          fileUrl: data.fileUrl,
          uploadedAt: now,
          status: "pending",
          rejectionReason: null,
          updatedAt: now,
        },
      })
      .returning(selectFields);

    return row;
  }

  async deleteDocument(
    restaurantId: string,
    documentType: string,
  ): Promise<void> {
    await this.db
      .delete(verificationDocument)
      .where(
        and(
          eq(verificationDocument.restaurantId, restaurantId),
          eq(verificationDocument.documentType, documentType),
        ),
      );
  }

  async findRestaurantOwner(
    restaurantId: string,
  ): Promise<{ ownerId: string; verificationStatus: string } | null> {
    const rows = await this.db
      .select({
        ownerId: organization.ownerId,
        verificationStatus: restaurant.verificationStatus,
      })
      .from(restaurant)
      .innerJoin(organization, eq(restaurant.organizationId, organization.id))
      .where(eq(restaurant.id, restaurantId))
      .limit(1);

    return rows[0] ?? null;
  }

  async updateVerificationStatus(
    restaurantId: string,
    status: string,
  ): Promise<void> {
    await this.db
      .update(restaurant)
      .set({
        verificationStatus: status,
        updatedAt: new Date(),
      })
      .where(eq(restaurant.id, restaurantId));
  }
}
