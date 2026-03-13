import { protectedProcedure, router } from "@/shared/infra/trpc/trpc";
import {
  CloseAllSessionsSchema,
  CloseSessionSchema,
  CreateTableSchema,
  ListTablesSchema,
  OpenSessionSchema,
  TableIdSchema,
  UpdateTableSchema,
} from "./dtos/table.dto";
import { makeTableService } from "./factories/table.factory";

export const tableRouter = router({
  list: protectedProcedure
    .input(ListTablesSchema)
    .query(async ({ input, ctx }) => {
      const tableService = makeTableService();
      return tableService.listTables(ctx.userId, input.branchId);
    }),

  create: protectedProcedure
    .input(CreateTableSchema)
    .mutation(async ({ input, ctx }) => {
      const tableService = makeTableService();
      return tableService.createTable(ctx.userId, input);
    }),

  update: protectedProcedure
    .input(UpdateTableSchema)
    .mutation(async ({ input, ctx }) => {
      const tableService = makeTableService();
      const { id, ...data } = input;
      return tableService.updateTable(ctx.userId, id, data);
    }),

  delete: protectedProcedure
    .input(TableIdSchema)
    .mutation(async ({ input, ctx }) => {
      const tableService = makeTableService();
      return tableService.deleteTable(ctx.userId, input.id);
    }),

  openSession: protectedProcedure
    .input(OpenSessionSchema)
    .mutation(async ({ input, ctx }) => {
      const tableService = makeTableService();
      return tableService.openSession(ctx.userId, input.branchTableId);
    }),

  closeSession: protectedProcedure
    .input(CloseSessionSchema)
    .mutation(async ({ input, ctx }) => {
      const tableService = makeTableService();
      return tableService.closeSession(ctx.userId, input.sessionId);
    }),

  closeAllSessions: protectedProcedure
    .input(CloseAllSessionsSchema)
    .mutation(async ({ input, ctx }) => {
      const tableService = makeTableService();
      return tableService.closeAllSessions(ctx.userId, input.branchId);
    }),
});
