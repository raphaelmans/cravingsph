import { BranchNotFoundError } from "@/modules/branch/errors/branch.errors";
import type { IBranchRepository } from "@/modules/branch/repositories/branch.repository";
import { OrganizationNotFoundError } from "@/modules/organization/errors/organization.errors";
import type { IOrganizationRepository } from "@/modules/organization/repositories/organization.repository";
import { RestaurantNotFoundError } from "@/modules/restaurant/errors/restaurant.errors";
import type { IRestaurantRepository } from "@/modules/restaurant/repositories/restaurant.repository";
import type {
  BranchRecord,
  CategoryRecord,
  ItemVariantRecord,
  MenuItemRecord,
  ModifierGroupRecord,
  ModifierRecord,
  OrganizationRecord,
  RestaurantRecord,
} from "@/shared/infra/db/schema";
import { logger } from "@/shared/infra/logger";
import type { RequestContext } from "@/shared/kernel/context";
import { AuthorizationError, ValidationError } from "@/shared/kernel/errors";
import type { TransactionManager } from "@/shared/kernel/transaction";
import type {
  CreateCategoryDTO,
  CreateMenuItemDTO,
  CreateModifierDTO,
  CreateModifierGroupDTO,
  CreateVariantDTO,
  ReorderCategoriesDTO,
  UpdateCategoryDTO,
  UpdateMenuItemDTO,
  UpdateModifierDTO,
  UpdateModifierGroupDTO,
  UpdateVariantDTO,
} from "../dtos/menu.dto";
import {
  CategoryNotFoundError,
  InvalidModifierGroupSelectionRulesError,
  MenuItemNotFoundError,
  ModifierGroupNotFoundError,
  ModifierNotFoundError,
  VariantNotFoundError,
} from "../errors/menu.errors";
import type { FullMenu, IMenuRepository } from "../repositories/menu.repository";

function nextSortOrder<T extends { sortOrder: number }>(records: T[]): number {
  if (records.length === 0) {
    return 0;
  }

  return Math.max(...records.map((record) => record.sortOrder)) + 1;
}

export interface IMenuService {
  getPublicMenu(branchId: string): Promise<FullMenu>;
  getManagementMenu(userId: string, branchId: string): Promise<FullMenu>;
  createCategory(
    userId: string,
    data: CreateCategoryDTO,
  ): Promise<CategoryRecord>;
  updateCategory(
    userId: string,
    data: UpdateCategoryDTO,
  ): Promise<CategoryRecord>;
  reorderCategories(
    userId: string,
    data: ReorderCategoriesDTO,
  ): Promise<CategoryRecord[]>;
  deleteCategory(userId: string, id: string): Promise<{ success: true }>;
  createItem(userId: string, data: CreateMenuItemDTO): Promise<MenuItemRecord>;
  updateItem(userId: string, data: UpdateMenuItemDTO): Promise<MenuItemRecord>;
  deleteItem(userId: string, id: string): Promise<{ success: true }>;
  createVariant(
    userId: string,
    data: CreateVariantDTO,
  ): Promise<ItemVariantRecord>;
  updateVariant(
    userId: string,
    data: UpdateVariantDTO,
  ): Promise<ItemVariantRecord>;
  deleteVariant(userId: string, id: string): Promise<{ success: true }>;
  createModifierGroup(
    userId: string,
    data: CreateModifierGroupDTO,
  ): Promise<ModifierGroupRecord>;
  updateModifierGroup(
    userId: string,
    data: UpdateModifierGroupDTO,
  ): Promise<ModifierGroupRecord>;
  deleteModifierGroup(userId: string, id: string): Promise<{ success: true }>;
  createModifier(
    userId: string,
    data: CreateModifierDTO,
  ): Promise<ModifierRecord>;
  updateModifier(
    userId: string,
    data: UpdateModifierDTO,
  ): Promise<ModifierRecord>;
  deleteModifier(userId: string, id: string): Promise<{ success: true }>;
}

export class MenuService implements IMenuService {
  constructor(
    private menuRepository: IMenuRepository,
    private branchRepository: IBranchRepository,
    private restaurantRepository: IRestaurantRepository,
    private organizationRepository: IOrganizationRepository,
    private transactionManager: TransactionManager,
  ) {}

  async getPublicMenu(branchId: string): Promise<FullMenu> {
    return this.menuRepository.findFullMenu(branchId);
  }

  async getManagementMenu(userId: string, branchId: string): Promise<FullMenu> {
    await this.assertBranchOwnership(userId, branchId);
    return this.menuRepository.findFullMenu(branchId, undefined, {
      includeUnavailable: true,
    });
  }

  async createCategory(
    userId: string,
    data: CreateCategoryDTO,
  ): Promise<CategoryRecord> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      await this.assertBranchOwnership(userId, data.branchId, ctx);
      const existingCategories = await this.menuRepository.findCategoriesByBranch(
        data.branchId,
        ctx,
      );

      const created = await this.menuRepository.createCategory(
        {
          branchId: data.branchId,
          name: data.name,
          sortOrder: nextSortOrder(existingCategories),
        },
        ctx,
      );

      logger.info(
        {
          event: "menu.category.created",
          categoryId: created.id,
          branchId: created.branchId,
        },
        "Menu category created",
      );

      return created;
    });
  }

  async updateCategory(
    userId: string,
    data: UpdateCategoryDTO,
  ): Promise<CategoryRecord> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      const category = await this.assertCategoryOwnership(userId, data.id, ctx);
      const { id, ...updateData } = data;

      const updated = await this.menuRepository.updateCategory(
        id,
        updateData,
        ctx,
      );

      logger.info(
        {
          event: "menu.category.updated",
          categoryId: updated.id,
          branchId: category.branchId,
          fields: Object.keys(updateData),
        },
        "Menu category updated",
      );

      return updated;
    });
  }

  async reorderCategories(
    userId: string,
    data: ReorderCategoriesDTO,
  ): Promise<CategoryRecord[]> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      await this.assertBranchOwnership(userId, data.branchId, ctx);
      const categories = await this.menuRepository.findCategoriesByBranch(
        data.branchId,
        ctx,
      );
      const existingIds = categories.map((category) => category.id);

      if (
        existingIds.length !== data.orderedIds.length ||
        existingIds.some((id) => !data.orderedIds.includes(id)) ||
        new Set(data.orderedIds).size !== data.orderedIds.length
      ) {
        throw new ValidationError(
          "Category reorder payload must match the branch category set",
          { branchId: data.branchId },
        );
      }

      const updatedCategories = await Promise.all(
        data.orderedIds.map((id, sortOrder) =>
          this.menuRepository.updateCategory(id, { sortOrder }, ctx),
        ),
      );

      logger.info(
        {
          event: "menu.category.reordered",
          branchId: data.branchId,
          categoryIds: data.orderedIds,
        },
        "Menu categories reordered",
      );

      return updatedCategories;
    });
  }

  async deleteCategory(
    userId: string,
    id: string,
  ): Promise<{ success: true }> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      await this.assertCategoryOwnership(userId, id, ctx);
      await this.menuRepository.deleteCategory(id, ctx);

      logger.info(
        {
          event: "menu.category.deleted",
          categoryId: id,
        },
        "Menu category deleted",
      );

      return { success: true };
    });
  }

  async createItem(
    userId: string,
    data: CreateMenuItemDTO,
  ): Promise<MenuItemRecord> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      await this.assertCategoryOwnership(userId, data.categoryId, ctx);
      const existingItems = await this.menuRepository.findItemsByCategory(
        data.categoryId,
        ctx,
      );

      const created = await this.menuRepository.createItem(
        {
          categoryId: data.categoryId,
          name: data.name,
          description: data.description ?? null,
          imageUrl: data.imageUrl ?? null,
          basePrice: data.basePrice,
          sortOrder: nextSortOrder(existingItems),
        },
        ctx,
      );

      logger.info(
        {
          event: "menu.item.created",
          menuItemId: created.id,
          categoryId: created.categoryId,
        },
        "Menu item created",
      );

      return created;
    });
  }

  async updateItem(
    userId: string,
    data: UpdateMenuItemDTO,
  ): Promise<MenuItemRecord> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      await this.assertItemOwnership(userId, data.id, ctx);
      const { id, ...updateData } = data;

      const updated = await this.menuRepository.updateItem(id, updateData, ctx);

      logger.info(
        {
          event: "menu.item.updated",
          menuItemId: updated.id,
          fields: Object.keys(updateData),
        },
        "Menu item updated",
      );

      return updated;
    });
  }

  async deleteItem(userId: string, id: string): Promise<{ success: true }> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      await this.assertItemOwnership(userId, id, ctx);
      await this.menuRepository.deleteItem(id, ctx);

      logger.info(
        {
          event: "menu.item.deleted",
          menuItemId: id,
        },
        "Menu item deleted",
      );

      return { success: true };
    });
  }

  async createVariant(
    userId: string,
    data: CreateVariantDTO,
  ): Promise<ItemVariantRecord> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      await this.assertItemOwnership(userId, data.menuItemId, ctx);
      const existingVariants = await this.menuRepository.findVariantsByItem(
        data.menuItemId,
        ctx,
      );

      const created = await this.menuRepository.createVariant(
        {
          menuItemId: data.menuItemId,
          name: data.name,
          price: data.price,
          sortOrder: nextSortOrder(existingVariants),
        },
        ctx,
      );

      logger.info(
        {
          event: "menu.variant.created",
          variantId: created.id,
          menuItemId: created.menuItemId,
        },
        "Menu variant created",
      );

      return created;
    });
  }

  async updateVariant(
    userId: string,
    data: UpdateVariantDTO,
  ): Promise<ItemVariantRecord> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      await this.assertVariantOwnership(userId, data.id, ctx);
      const { id, ...updateData } = data;

      const updated = await this.menuRepository.updateVariant(
        id,
        updateData,
        ctx,
      );

      logger.info(
        {
          event: "menu.variant.updated",
          variantId: updated.id,
          fields: Object.keys(updateData),
        },
        "Menu variant updated",
      );

      return updated;
    });
  }

  async deleteVariant(
    userId: string,
    id: string,
  ): Promise<{ success: true }> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      await this.assertVariantOwnership(userId, id, ctx);
      await this.menuRepository.deleteVariant(id, ctx);

      logger.info(
        {
          event: "menu.variant.deleted",
          variantId: id,
        },
        "Menu variant deleted",
      );

      return { success: true };
    });
  }

  async createModifierGroup(
    userId: string,
    data: CreateModifierGroupDTO,
  ): Promise<ModifierGroupRecord> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      await this.assertItemOwnership(userId, data.menuItemId, ctx);

      const minSelections = data.minSelections ?? (data.isRequired ? 1 : 0);
      const maxSelections = data.maxSelections ?? Math.max(minSelections, 1);
      this.assertValidSelectionRules(minSelections, maxSelections);

      const existingGroups = await this.menuRepository.findModifierGroupsByItem(
        data.menuItemId,
        ctx,
      );

      const created = await this.menuRepository.createModifierGroup(
        {
          menuItemId: data.menuItemId,
          name: data.name,
          isRequired: data.isRequired ?? false,
          minSelections,
          maxSelections,
          sortOrder: nextSortOrder(existingGroups),
        },
        ctx,
      );

      logger.info(
        {
          event: "menu.modifier-group.created",
          modifierGroupId: created.id,
          menuItemId: created.menuItemId,
        },
        "Modifier group created",
      );

      return created;
    });
  }

  async updateModifierGroup(
    userId: string,
    data: UpdateModifierGroupDTO,
  ): Promise<ModifierGroupRecord> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      const existing = await this.assertModifierGroupOwnership(
        userId,
        data.id,
        ctx,
      );
      const minSelections = data.minSelections ?? existing.minSelections;
      const maxSelections = data.maxSelections ?? existing.maxSelections;
      this.assertValidSelectionRules(minSelections, maxSelections);

      const { id, ...updateData } = data;
      const updated = await this.menuRepository.updateModifierGroup(
        id,
        updateData,
        ctx,
      );

      logger.info(
        {
          event: "menu.modifier-group.updated",
          modifierGroupId: updated.id,
          fields: Object.keys(updateData),
        },
        "Modifier group updated",
      );

      return updated;
    });
  }

  async deleteModifierGroup(
    userId: string,
    id: string,
  ): Promise<{ success: true }> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      await this.assertModifierGroupOwnership(userId, id, ctx);
      await this.menuRepository.deleteModifierGroup(id, ctx);

      logger.info(
        {
          event: "menu.modifier-group.deleted",
          modifierGroupId: id,
        },
        "Modifier group deleted",
      );

      return { success: true };
    });
  }

  async createModifier(
    userId: string,
    data: CreateModifierDTO,
  ): Promise<ModifierRecord> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      await this.assertModifierGroupOwnership(userId, data.modifierGroupId, ctx);
      const existingModifiers = await this.menuRepository.findModifiersByGroup(
        data.modifierGroupId,
        ctx,
      );

      const created = await this.menuRepository.createModifier(
        {
          modifierGroupId: data.modifierGroupId,
          name: data.name,
          price: data.price ?? "0",
          sortOrder: nextSortOrder(existingModifiers),
        },
        ctx,
      );

      logger.info(
        {
          event: "menu.modifier.created",
          modifierId: created.id,
          modifierGroupId: created.modifierGroupId,
        },
        "Modifier created",
      );

      return created;
    });
  }

  async updateModifier(
    userId: string,
    data: UpdateModifierDTO,
  ): Promise<ModifierRecord> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      await this.assertModifierOwnership(userId, data.id, ctx);
      const { id, ...updateData } = data;

      const updated = await this.menuRepository.updateModifier(
        id,
        updateData,
        ctx,
      );

      logger.info(
        {
          event: "menu.modifier.updated",
          modifierId: updated.id,
          fields: Object.keys(updateData),
        },
        "Modifier updated",
      );

      return updated;
    });
  }

  async deleteModifier(
    userId: string,
    id: string,
  ): Promise<{ success: true }> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      await this.assertModifierOwnership(userId, id, ctx);
      await this.menuRepository.deleteModifier(id, ctx);

      logger.info(
        {
          event: "menu.modifier.deleted",
          modifierId: id,
        },
        "Modifier deleted",
      );

      return { success: true };
    });
  }

  private async assertBranchOwnership(
    userId: string,
    branchId: string,
    ctx?: RequestContext,
  ): Promise<{
    branch: BranchRecord;
    restaurant: RestaurantRecord;
    organization: OrganizationRecord;
  }> {
    const branch = await this.branchRepository.findById(branchId, ctx);
    if (!branch) {
      throw new BranchNotFoundError(branchId);
    }

    const restaurant = await this.restaurantRepository.findById(
      branch.restaurantId,
      ctx,
    );
    if (!restaurant) {
      throw new RestaurantNotFoundError(branch.restaurantId);
    }

    const organization = await this.organizationRepository.findById(
      restaurant.organizationId,
      ctx,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(restaurant.organizationId);
    }

    if (organization.ownerId !== userId) {
      throw new AuthorizationError("Not authorized to manage this branch", {
        branchId,
        userId,
      });
    }

    return { branch, restaurant, organization };
  }

  private async assertCategoryOwnership(
    userId: string,
    categoryId: string,
    ctx?: RequestContext,
  ): Promise<CategoryRecord> {
    const category = await this.menuRepository.findCategoryById(categoryId, ctx);
    if (!category) {
      throw new CategoryNotFoundError(categoryId);
    }

    await this.assertBranchOwnership(userId, category.branchId, ctx);
    return category;
  }

  private async assertItemOwnership(
    userId: string,
    menuItemId: string,
    ctx?: RequestContext,
  ): Promise<MenuItemRecord> {
    const item = await this.menuRepository.findItemById(menuItemId, ctx);
    if (!item) {
      throw new MenuItemNotFoundError(menuItemId);
    }

    const category = await this.menuRepository.findCategoryById(item.categoryId, ctx);
    if (!category) {
      throw new CategoryNotFoundError(item.categoryId);
    }

    await this.assertBranchOwnership(userId, category.branchId, ctx);
    return item;
  }

  private async assertVariantOwnership(
    userId: string,
    variantId: string,
    ctx?: RequestContext,
  ): Promise<ItemVariantRecord> {
    const variant = await this.menuRepository.findVariantById(variantId, ctx);
    if (!variant) {
      throw new VariantNotFoundError(variantId);
    }

    await this.assertItemOwnership(userId, variant.menuItemId, ctx);
    return variant;
  }

  private async assertModifierGroupOwnership(
    userId: string,
    modifierGroupId: string,
    ctx?: RequestContext,
  ): Promise<ModifierGroupRecord> {
    const group = await this.menuRepository.findModifierGroupById(
      modifierGroupId,
      ctx,
    );
    if (!group) {
      throw new ModifierGroupNotFoundError(modifierGroupId);
    }

    await this.assertItemOwnership(userId, group.menuItemId, ctx);
    return group;
  }

  private async assertModifierOwnership(
    userId: string,
    modifierId: string,
    ctx?: RequestContext,
  ): Promise<ModifierRecord> {
    const modifier = await this.menuRepository.findModifierById(modifierId, ctx);
    if (!modifier) {
      throw new ModifierNotFoundError(modifierId);
    }

    await this.assertModifierGroupOwnership(userId, modifier.modifierGroupId, ctx);
    return modifier;
  }

  private assertValidSelectionRules(
    minSelections: number,
    maxSelections: number,
  ): void {
    if (minSelections < 0 || maxSelections < minSelections) {
      throw new InvalidModifierGroupSelectionRulesError(
        minSelections,
        maxSelections,
      );
    }
  }
}
