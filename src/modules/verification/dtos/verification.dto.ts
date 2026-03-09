import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const UploadDocumentInputSchema = z.object({
  restaurantId: z.string().uuid(),
  documentType: z.enum([
    "business_registration",
    "valid_government_id",
    "business_permit",
  ]),
  fileName: z.string().min(1).max(500),
  fileUrl: z.string().url(),
});

export type UploadDocumentInput = z.infer<typeof UploadDocumentInputSchema>;

export const RemoveDocumentInputSchema = z.object({
  restaurantId: z.string().uuid(),
  documentType: z.enum([
    "business_registration",
    "valid_government_id",
    "business_permit",
  ]),
});

export type RemoveDocumentInput = z.infer<typeof RemoveDocumentInputSchema>;

export const GetRestaurantStatusInputSchema = z.object({
  restaurantId: z.string().uuid(),
});

export const SubmitVerificationInputSchema = z.object({
  restaurantId: z.string().uuid(),
});

export const IsSubmittedInputSchema = z.object({
  restaurantId: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export interface VerificationDocumentDTO {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  status: string;
  rejectionReason: string | null;
}

export interface RestaurantVerificationStatusDTO {
  restaurantId: string;
  verificationStatus: string;
  documents: VerificationDocumentDTO[];
  uploadedCount: number;
  totalRequired: number;
}
