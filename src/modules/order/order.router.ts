import { protectedProcedure, router } from "@/shared/infra/trpc/trpc";
import {
  CreateOrderInputSchema,
  ListByBranchInputSchema,
  OrderIdInputSchema,
  RejectOrderInputSchema,
  RejectPaymentInputSchema,
  UpdateStatusInputSchema,
} from "./dtos/order.dto";
import { makeOrderService } from "./factories/order.factory";

export const orderRouter = router({
  // ─── Customer procedures ─────────────────────────────────────────────

  create: protectedProcedure
    .input(CreateOrderInputSchema)
    .mutation(async ({ ctx, input }) => {
      const service = makeOrderService();
      return service.create(ctx.session.userId, input);
    }),

  listMine: protectedProcedure.query(async ({ ctx }) => {
    const service = makeOrderService();
    return service.listMine(ctx.session.userId);
  }),

  getDetail: protectedProcedure
    .input(OrderIdInputSchema)
    .query(async ({ ctx, input }) => {
      const service = makeOrderService();
      return service.getDetail(ctx.session.userId, input.orderId);
    }),

  reorder: protectedProcedure
    .input(OrderIdInputSchema)
    .query(async ({ ctx, input }) => {
      const service = makeOrderService();
      return service.reorder(ctx.session.userId, input.orderId);
    }),

  // ─── Owner procedures ────────────────────────────────────────────────

  listByBranch: protectedProcedure
    .input(ListByBranchInputSchema)
    .query(async ({ input }) => {
      const service = makeOrderService();
      return service.listByBranch(input.branchId, input.status);
    }),

  accept: protectedProcedure
    .input(OrderIdInputSchema)
    .mutation(async ({ ctx, input }) => {
      const service = makeOrderService();
      return service.accept(ctx.session.userId, input.orderId);
    }),

  reject: protectedProcedure
    .input(RejectOrderInputSchema)
    .mutation(async ({ ctx, input }) => {
      const service = makeOrderService();
      return service.reject(ctx.session.userId, input.orderId, input.reason);
    }),

  updateStatus: protectedProcedure
    .input(UpdateStatusInputSchema)
    .mutation(async ({ ctx, input }) => {
      const service = makeOrderService();
      return service.updateStatus(
        ctx.session.userId,
        input.orderId,
        input.status,
      );
    }),

  confirmPayment: protectedProcedure
    .input(OrderIdInputSchema)
    .mutation(async ({ ctx, input }) => {
      const service = makeOrderService();
      return service.confirmPayment(ctx.session.userId, input.orderId);
    }),

  rejectPayment: protectedProcedure
    .input(RejectPaymentInputSchema)
    .mutation(async ({ ctx, input }) => {
      const service = makeOrderService();
      return service.rejectPayment(
        ctx.session.userId,
        input.orderId,
        input.reason,
      );
    }),

  getTimeline: protectedProcedure
    .input(OrderIdInputSchema)
    .query(async ({ input }) => {
      const service = makeOrderService();
      return service.getTimeline(input.orderId);
    }),
});
