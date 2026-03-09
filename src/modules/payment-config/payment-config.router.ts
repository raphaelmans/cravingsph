import { protectedProcedure, router } from "@/shared/infra/trpc/trpc";
import {
  AddPaymentMethodInputSchema,
  RemovePaymentMethodInputSchema,
  SetDefaultPaymentMethodInputSchema,
  UpdatePaymentMethodInputSchema,
} from "./dtos/payment-config.dto";
import { makePaymentConfigService } from "./factories/payment-config.factory";

export const paymentConfigRouter = router({
  /**
   * List all active payment methods for the current user's organization.
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const service = makePaymentConfigService();
    return service.list(ctx.session.userId);
  }),

  /**
   * Add a new payment method.
   */
  add: protectedProcedure
    .input(AddPaymentMethodInputSchema)
    .mutation(async ({ ctx, input }) => {
      const service = makePaymentConfigService();
      return service.add(ctx.session.userId, input);
    }),

  /**
   * Update an existing payment method.
   */
  update: protectedProcedure
    .input(UpdatePaymentMethodInputSchema)
    .mutation(async ({ ctx, input }) => {
      const service = makePaymentConfigService();
      return service.update(ctx.session.userId, input);
    }),

  /**
   * Remove (soft-delete) a payment method.
   */
  remove: protectedProcedure
    .input(RemovePaymentMethodInputSchema)
    .mutation(async ({ ctx, input }) => {
      const service = makePaymentConfigService();
      return service.remove(ctx.session.userId, input.id);
    }),

  /**
   * Set a payment method as the default.
   */
  setDefault: protectedProcedure
    .input(SetDefaultPaymentMethodInputSchema)
    .mutation(async ({ ctx, input }) => {
      const service = makePaymentConfigService();
      return service.setDefault(ctx.session.userId, input.id);
    }),

  /**
   * Check if the organization has at least one payment method.
   * Used by onboarding wizard.
   */
  has: protectedProcedure.query(async ({ ctx }) => {
    const service = makePaymentConfigService();
    return service.has(ctx.session.userId);
  }),
});
