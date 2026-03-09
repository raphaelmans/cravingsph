import {
  protectedProcedure,
  publicProcedure,
  router,
} from "@/shared/infra/trpc/trpc";
import {
  CreateCategorySchema,
  CreateMenuItemSchema,
  CreateModifierGroupSchema,
  CreateModifierSchema,
  CreateVariantSchema,
  ReorderCategoriesSchema,
  UpdateCategorySchema,
  UpdateMenuItemSchema,
  UpdateModifierGroupSchema,
  UpdateModifierSchema,
  UpdateVariantSchema,
} from "./dtos/menu.dto";
import { makeMenuService } from "./factories/menu.factory";

const IdSchema = UpdateCategorySchema.pick({ id: true });

export const menuRouter = router({
  hasContent: protectedProcedure
    .input(CreateCategorySchema.pick({ branchId: true }))
    .query(async ({ input }) => {
      const menuService = makeMenuService();
      return menuService.hasContent(input.branchId);
    }),

  getPublicMenu: publicProcedure
    .input(CreateCategorySchema.pick({ branchId: true }))
    .query(async ({ input }) => {
      const menuService = makeMenuService();
      return menuService.getPublicMenu(input.branchId);
    }),

  getManagementMenu: protectedProcedure
    .input(CreateCategorySchema.pick({ branchId: true }))
    .query(async ({ input, ctx }) => {
      const menuService = makeMenuService();
      return menuService.getManagementMenu(ctx.userId, input.branchId);
    }),

  createCategory: protectedProcedure
    .input(CreateCategorySchema)
    .mutation(async ({ input, ctx }) => {
      const menuService = makeMenuService();
      return menuService.createCategory(ctx.userId, input);
    }),

  updateCategory: protectedProcedure
    .input(UpdateCategorySchema)
    .mutation(async ({ input, ctx }) => {
      const menuService = makeMenuService();
      return menuService.updateCategory(ctx.userId, input);
    }),

  reorderCategories: protectedProcedure
    .input(ReorderCategoriesSchema)
    .mutation(async ({ input, ctx }) => {
      const menuService = makeMenuService();
      return menuService.reorderCategories(ctx.userId, input);
    }),

  deleteCategory: protectedProcedure
    .input(IdSchema)
    .mutation(async ({ input, ctx }) => {
      const menuService = makeMenuService();
      return menuService.deleteCategory(ctx.userId, input.id);
    }),

  createItem: protectedProcedure
    .input(CreateMenuItemSchema)
    .mutation(async ({ input, ctx }) => {
      const menuService = makeMenuService();
      return menuService.createItem(ctx.userId, input);
    }),

  updateItem: protectedProcedure
    .input(UpdateMenuItemSchema)
    .mutation(async ({ input, ctx }) => {
      const menuService = makeMenuService();
      return menuService.updateItem(ctx.userId, input);
    }),

  deleteItem: protectedProcedure
    .input(UpdateMenuItemSchema.pick({ id: true }))
    .mutation(async ({ input, ctx }) => {
      const menuService = makeMenuService();
      return menuService.deleteItem(ctx.userId, input.id);
    }),

  createVariant: protectedProcedure
    .input(CreateVariantSchema)
    .mutation(async ({ input, ctx }) => {
      const menuService = makeMenuService();
      return menuService.createVariant(ctx.userId, input);
    }),

  updateVariant: protectedProcedure
    .input(UpdateVariantSchema)
    .mutation(async ({ input, ctx }) => {
      const menuService = makeMenuService();
      return menuService.updateVariant(ctx.userId, input);
    }),

  deleteVariant: protectedProcedure
    .input(UpdateVariantSchema.pick({ id: true }))
    .mutation(async ({ input, ctx }) => {
      const menuService = makeMenuService();
      return menuService.deleteVariant(ctx.userId, input.id);
    }),

  createModifierGroup: protectedProcedure
    .input(CreateModifierGroupSchema)
    .mutation(async ({ input, ctx }) => {
      const menuService = makeMenuService();
      return menuService.createModifierGroup(ctx.userId, input);
    }),

  updateModifierGroup: protectedProcedure
    .input(UpdateModifierGroupSchema)
    .mutation(async ({ input, ctx }) => {
      const menuService = makeMenuService();
      return menuService.updateModifierGroup(ctx.userId, input);
    }),

  deleteModifierGroup: protectedProcedure
    .input(UpdateModifierGroupSchema.pick({ id: true }))
    .mutation(async ({ input, ctx }) => {
      const menuService = makeMenuService();
      return menuService.deleteModifierGroup(ctx.userId, input.id);
    }),

  createModifier: protectedProcedure
    .input(CreateModifierSchema)
    .mutation(async ({ input, ctx }) => {
      const menuService = makeMenuService();
      return menuService.createModifier(ctx.userId, input);
    }),

  updateModifier: protectedProcedure
    .input(UpdateModifierSchema)
    .mutation(async ({ input, ctx }) => {
      const menuService = makeMenuService();
      return menuService.updateModifier(ctx.userId, input);
    }),

  deleteModifier: protectedProcedure
    .input(UpdateModifierSchema.pick({ id: true }))
    .mutation(async ({ input, ctx }) => {
      const menuService = makeMenuService();
      return menuService.deleteModifier(ctx.userId, input.id);
    }),
});
