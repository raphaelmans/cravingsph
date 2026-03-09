import type {
  RestaurantVerificationStatusDTO,
  UploadDocumentInput,
  VerificationDocumentDTO,
} from "../dtos/verification.dto";
import {
  IncompleteDocumentsError,
  RestaurantNotOwnedError,
  VerificationAlreadySubmittedError,
} from "../errors/verification.errors";
import type {
  IVerificationRepository,
  VerificationDocumentRow,
} from "../repositories/verification.repository";

const REQUIRED_DOCUMENT_COUNT = 3;

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IVerificationService {
  getRestaurantStatus(
    userId: string,
    restaurantId: string,
  ): Promise<RestaurantVerificationStatusDTO>;
  uploadDocument(
    userId: string,
    input: UploadDocumentInput,
  ): Promise<VerificationDocumentDTO>;
  removeDocument(
    userId: string,
    restaurantId: string,
    documentType: string,
  ): Promise<void>;
  submit(userId: string, restaurantId: string): Promise<void>;
  isSubmitted(userId: string, restaurantId: string): Promise<boolean>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class VerificationService implements IVerificationService {
  constructor(private repository: IVerificationRepository) {}

  async getRestaurantStatus(
    userId: string,
    restaurantId: string,
  ): Promise<RestaurantVerificationStatusDTO> {
    await this.assertOwnership(userId, restaurantId);

    const docs =
      await this.repository.findDocumentsByRestaurantId(restaurantId);
    const owner = await this.repository.findRestaurantOwner(restaurantId);

    return {
      restaurantId,
      verificationStatus: owner?.verificationStatus ?? "pending",
      documents: docs.map((d) => this.toDTO(d)),
      uploadedCount: docs.length,
      totalRequired: REQUIRED_DOCUMENT_COUNT,
    };
  }

  async uploadDocument(
    userId: string,
    input: UploadDocumentInput,
  ): Promise<VerificationDocumentDTO> {
    await this.assertOwnership(userId, input.restaurantId);

    const row = await this.repository.upsertDocument({
      restaurantId: input.restaurantId,
      documentType: input.documentType,
      fileName: input.fileName,
      fileUrl: input.fileUrl,
    });

    return this.toDTO(row);
  }

  async removeDocument(
    userId: string,
    restaurantId: string,
    documentType: string,
  ): Promise<void> {
    await this.assertOwnership(userId, restaurantId);
    await this.repository.deleteDocument(restaurantId, documentType);
  }

  async submit(userId: string, restaurantId: string): Promise<void> {
    const owner = await this.assertOwnership(userId, restaurantId);

    if (owner.verificationStatus === "pending") {
      throw new VerificationAlreadySubmittedError(restaurantId);
    }

    const docs =
      await this.repository.findDocumentsByRestaurantId(restaurantId);

    if (docs.length < REQUIRED_DOCUMENT_COUNT) {
      throw new IncompleteDocumentsError(
        restaurantId,
        docs.length,
        REQUIRED_DOCUMENT_COUNT,
      );
    }

    await this.repository.updateVerificationStatus(restaurantId, "pending");
  }

  async isSubmitted(userId: string, restaurantId: string): Promise<boolean> {
    await this.assertOwnership(userId, restaurantId);
    const owner = await this.repository.findRestaurantOwner(restaurantId);
    return owner?.verificationStatus === "pending";
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private async assertOwnership(userId: string, restaurantId: string) {
    const owner = await this.repository.findRestaurantOwner(restaurantId);
    if (!owner || owner.ownerId !== userId) {
      throw new RestaurantNotOwnedError(restaurantId);
    }
    return owner;
  }

  private toDTO(row: VerificationDocumentRow): VerificationDocumentDTO {
    return {
      id: row.id,
      documentType: row.documentType,
      fileName: row.fileName ?? "",
      fileUrl: row.fileUrl ?? "",
      uploadedAt: row.uploadedAt?.toISOString() ?? "",
      status: row.status,
      rejectionReason: row.rejectionReason,
    };
  }
}
