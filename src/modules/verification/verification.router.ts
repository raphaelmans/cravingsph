import { protectedProcedure, router } from "@/shared/infra/trpc/trpc";
import {
  GetRestaurantStatusInputSchema,
  IsSubmittedInputSchema,
  RemoveDocumentInputSchema,
  SubmitVerificationInputSchema,
  UploadDocumentInputSchema,
} from "./dtos/verification.dto";
import { makeVerificationService } from "./factories/verification.factory";

export const verificationRouter = router({
  getRestaurantStatus: protectedProcedure
    .input(GetRestaurantStatusInputSchema)
    .query(async ({ ctx, input }) => {
      const service = makeVerificationService();
      return service.getRestaurantStatus(
        ctx.session.userId,
        input.restaurantId,
      );
    }),

  uploadDocument: protectedProcedure
    .input(UploadDocumentInputSchema)
    .mutation(async ({ ctx, input }) => {
      const service = makeVerificationService();
      return service.uploadDocument(ctx.session.userId, input);
    }),

  removeDocument: protectedProcedure
    .input(RemoveDocumentInputSchema)
    .mutation(async ({ ctx, input }) => {
      const service = makeVerificationService();
      return service.removeDocument(
        ctx.session.userId,
        input.restaurantId,
        input.documentType,
      );
    }),

  submit: protectedProcedure
    .input(SubmitVerificationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const service = makeVerificationService();
      return service.submit(ctx.session.userId, input.restaurantId);
    }),

  isSubmitted: protectedProcedure
    .input(IsSubmittedInputSchema)
    .query(async ({ ctx, input }) => {
      const service = makeVerificationService();
      return service.isSubmitted(ctx.session.userId, input.restaurantId);
    }),
});
