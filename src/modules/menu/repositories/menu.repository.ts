import { and, asc, eq, inArray } from "drizzle-orm";
import {
  type CategoryRecord,
  category,
  type InsertCategory,
  type InsertItemVariant,
  type InsertMenuItem,
  type InsertModifier,
  type InsertModifierGroup,
  type ItemVariantRecord,
  itemVariant,
  type MenuItemRecord,
  type ModifierGroupRecord,
  type ModifierRecord,
  menuItem,
  modifier,
  modifierGroup,
} from "@/shared/infra/db/schema";
import type { DbClient, DrizzleTransaction } from "@/shared/infra/db/types";
import type { RequestContext } from "@/shared/kernel/context";

// --- Composite types for full menu ---

export type ModifierGroupWithModifiers = {
  group: ModifierGroupRecord;
  modifiers: ModifierRecord[];
};

export type MenuItemWithDetails = {
  item: MenuItemRecord;
  variants: ItemVariantRecord[];
  modifierGroups: ModifierGroupWithModifiers[];
};

export type MenuCategoryWithItems = {
  category: CategoryRecord;
  items: MenuItemWithDetails[];
};

export type FullMenu = MenuCategoryWithItems[];

// --- Interface ---

export interface IMenuRepository {
  // Categories
  findCategoriesByBranch(
    branchId: string,
    ctx?: RequestContext,
  ): Promise<CategoryRecord[]>;
  findCategoryById(
    id: string,
    ctx?: RequestContext,
  ): Promise<CategoryRecord | null>;
  createCategory(
    data: InsertCategory,
    ctx?: RequestContext,
  ): Promise<CategoryRecord>;
  updateCategory(
    id: string,
    data: Partial<InsertCategory>,
    ctx?: RequestContext,
  ): Promise<CategoryRecord>;
  deleteCategory(id: string, ctx?: RequestContext): Promise<void>;

  // Menu Items
  findItemsByCategory(
    categoryId: string,
    ctx?: RequestContext,
  ): Promise<MenuItemRecord[]>;
  findItemById(
    id: string,
    ctx?: RequestContext,
  ): Promise<MenuItemRecord | null>;
  createItem(
    data: InsertMenuItem,
    ctx?: RequestContext,
  ): Promise<MenuItemRecord>;
  updateItem(
    id: string,
    data: Partial<InsertMenuItem>,
    ctx?: RequestContext,
  ): Promise<MenuItemRecord>;
  deleteItem(id: string, ctx?: RequestContext): Promise<void>;

  // Item Variants
  findVariantsByItem(
    menuItemId: string,
    ctx?: RequestContext,
  ): Promise<ItemVariantRecord[]>;
  createVariant(
    data: InsertItemVariant,
    ctx?: RequestContext,
  ): Promise<ItemVariantRecord>;
  findVariantById(
    id: string,
    ctx?: RequestContext,
  ): Promise<ItemVariantRecord | null>;
  updateVariant(
    id: string,
    data: Partial<InsertItemVariant>,
    ctx?: RequestContext,
  ): Promise<ItemVariantRecord>;
  deleteVariant(id: string, ctx?: RequestContext): Promise<void>;

  // Modifier Groups
  findModifierGroupsByItem(
    menuItemId: string,
    ctx?: RequestContext,
  ): Promise<ModifierGroupRecord[]>;
  createModifierGroup(
    data: InsertModifierGroup,
    ctx?: RequestContext,
  ): Promise<ModifierGroupRecord>;
  findModifierGroupById(
    id: string,
    ctx?: RequestContext,
  ): Promise<ModifierGroupRecord | null>;
  updateModifierGroup(
    id: string,
    data: Partial<InsertModifierGroup>,
    ctx?: RequestContext,
  ): Promise<ModifierGroupRecord>;
  deleteModifierGroup(id: string, ctx?: RequestContext): Promise<void>;

  // Modifiers
  findModifiersByGroup(
    groupId: string,
    ctx?: RequestContext,
  ): Promise<ModifierRecord[]>;
  createModifier(
    data: InsertModifier,
    ctx?: RequestContext,
  ): Promise<ModifierRecord>;
  findModifierById(
    id: string,
    ctx?: RequestContext,
  ): Promise<ModifierRecord | null>;
  updateModifier(
    id: string,
    data: Partial<InsertModifier>,
    ctx?: RequestContext,
  ): Promise<ModifierRecord>;
  deleteModifier(id: string, ctx?: RequestContext): Promise<void>;

  // Existence check
  hasContent(branchId: string): Promise<boolean>;

  // Full menu
  findFullMenu(
    branchId: string,
    ctx?: RequestContext,
    options?: {
      includeUnavailable?: boolean;
    },
  ): Promise<FullMenu>;
}

// --- Implementation ---

export class MenuRepository implements IMenuRepository {
  constructor(private db: DbClient) {}

  private getClient(ctx?: RequestContext): DbClient | DrizzleTransaction {
    return (ctx?.tx as DrizzleTransaction) ?? this.db;
  }

  // ─── Categories ──────────────────────────────────────────────

  async findCategoriesByBranch(
    branchId: string,
    ctx?: RequestContext,
  ): Promise<CategoryRecord[]> {
    const client = this.getClient(ctx);
    return client
      .select()
      .from(category)
      .where(eq(category.branchId, branchId))
      .orderBy(asc(category.sortOrder));
  }

  async findCategoryById(
    id: string,
    ctx?: RequestContext,
  ): Promise<CategoryRecord | null> {
    const client = this.getClient(ctx);
    const result = await client
      .select()
      .from(category)
      .where(eq(category.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async createCategory(
    data: InsertCategory,
    ctx?: RequestContext,
  ): Promise<CategoryRecord> {
    const client = this.getClient(ctx);
    const result = await client.insert(category).values(data).returning();
    return result[0];
  }

  async updateCategory(
    id: string,
    data: Partial<InsertCategory>,
    ctx?: RequestContext,
  ): Promise<CategoryRecord> {
    const client = this.getClient(ctx);
    const result = await client
      .update(category)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(category.id, id))
      .returning();

    return result[0];
  }

  async deleteCategory(id: string, ctx?: RequestContext): Promise<void> {
    const client = this.getClient(ctx);
    await client.delete(category).where(eq(category.id, id));
  }

  // ─── Menu Items ──────────────────────────────────────────────

  async findItemsByCategory(
    categoryId: string,
    ctx?: RequestContext,
  ): Promise<MenuItemRecord[]> {
    const client = this.getClient(ctx);
    return client
      .select()
      .from(menuItem)
      .where(eq(menuItem.categoryId, categoryId))
      .orderBy(asc(menuItem.sortOrder));
  }

  async findItemById(
    id: string,
    ctx?: RequestContext,
  ): Promise<MenuItemRecord | null> {
    const client = this.getClient(ctx);
    const result = await client
      .select()
      .from(menuItem)
      .where(eq(menuItem.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async createItem(
    data: InsertMenuItem,
    ctx?: RequestContext,
  ): Promise<MenuItemRecord> {
    const client = this.getClient(ctx);
    const result = await client.insert(menuItem).values(data).returning();
    return result[0];
  }

  async updateItem(
    id: string,
    data: Partial<InsertMenuItem>,
    ctx?: RequestContext,
  ): Promise<MenuItemRecord> {
    const client = this.getClient(ctx);
    const result = await client
      .update(menuItem)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(menuItem.id, id))
      .returning();

    return result[0];
  }

  async deleteItem(id: string, ctx?: RequestContext): Promise<void> {
    const client = this.getClient(ctx);
    await client.delete(menuItem).where(eq(menuItem.id, id));
  }

  // ─── Item Variants ──────────────────────────────────────────

  async findVariantsByItem(
    menuItemId: string,
    ctx?: RequestContext,
  ): Promise<ItemVariantRecord[]> {
    const client = this.getClient(ctx);
    return client
      .select()
      .from(itemVariant)
      .where(eq(itemVariant.menuItemId, menuItemId))
      .orderBy(asc(itemVariant.sortOrder));
  }

  async createVariant(
    data: InsertItemVariant,
    ctx?: RequestContext,
  ): Promise<ItemVariantRecord> {
    const client = this.getClient(ctx);
    const result = await client.insert(itemVariant).values(data).returning();
    return result[0];
  }

  async findVariantById(
    id: string,
    ctx?: RequestContext,
  ): Promise<ItemVariantRecord | null> {
    const client = this.getClient(ctx);
    const result = await client
      .select()
      .from(itemVariant)
      .where(eq(itemVariant.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async updateVariant(
    id: string,
    data: Partial<InsertItemVariant>,
    ctx?: RequestContext,
  ): Promise<ItemVariantRecord> {
    const client = this.getClient(ctx);
    const result = await client
      .update(itemVariant)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(itemVariant.id, id))
      .returning();

    return result[0];
  }

  async deleteVariant(id: string, ctx?: RequestContext): Promise<void> {
    const client = this.getClient(ctx);
    await client.delete(itemVariant).where(eq(itemVariant.id, id));
  }

  // ─── Modifier Groups ────────────────────────────────────────

  async findModifierGroupsByItem(
    menuItemId: string,
    ctx?: RequestContext,
  ): Promise<ModifierGroupRecord[]> {
    const client = this.getClient(ctx);
    return client
      .select()
      .from(modifierGroup)
      .where(eq(modifierGroup.menuItemId, menuItemId))
      .orderBy(asc(modifierGroup.sortOrder));
  }

  async createModifierGroup(
    data: InsertModifierGroup,
    ctx?: RequestContext,
  ): Promise<ModifierGroupRecord> {
    const client = this.getClient(ctx);
    const result = await client.insert(modifierGroup).values(data).returning();
    return result[0];
  }

  async findModifierGroupById(
    id: string,
    ctx?: RequestContext,
  ): Promise<ModifierGroupRecord | null> {
    const client = this.getClient(ctx);
    const result = await client
      .select()
      .from(modifierGroup)
      .where(eq(modifierGroup.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async updateModifierGroup(
    id: string,
    data: Partial<InsertModifierGroup>,
    ctx?: RequestContext,
  ): Promise<ModifierGroupRecord> {
    const client = this.getClient(ctx);
    const result = await client
      .update(modifierGroup)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(modifierGroup.id, id))
      .returning();

    return result[0];
  }

  async deleteModifierGroup(id: string, ctx?: RequestContext): Promise<void> {
    const client = this.getClient(ctx);
    await client.delete(modifierGroup).where(eq(modifierGroup.id, id));
  }

  // ─── Modifiers ──────────────────────────────────────────────

  async findModifiersByGroup(
    groupId: string,
    ctx?: RequestContext,
  ): Promise<ModifierRecord[]> {
    const client = this.getClient(ctx);
    return client
      .select()
      .from(modifier)
      .where(eq(modifier.modifierGroupId, groupId))
      .orderBy(asc(modifier.sortOrder));
  }

  async createModifier(
    data: InsertModifier,
    ctx?: RequestContext,
  ): Promise<ModifierRecord> {
    const client = this.getClient(ctx);
    const result = await client.insert(modifier).values(data).returning();
    return result[0];
  }

  async findModifierById(
    id: string,
    ctx?: RequestContext,
  ): Promise<ModifierRecord | null> {
    const client = this.getClient(ctx);
    const result = await client
      .select()
      .from(modifier)
      .where(eq(modifier.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async updateModifier(
    id: string,
    data: Partial<InsertModifier>,
    ctx?: RequestContext,
  ): Promise<ModifierRecord> {
    const client = this.getClient(ctx);
    const result = await client
      .update(modifier)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(modifier.id, id))
      .returning();

    return result[0];
  }

  async deleteModifier(id: string, ctx?: RequestContext): Promise<void> {
    const client = this.getClient(ctx);
    await client.delete(modifier).where(eq(modifier.id, id));
  }

  // ─── Existence Check ────────────────────────────────────────

  async hasContent(branchId: string): Promise<boolean> {
    const result = await this.db
      .select({ id: menuItem.id })
      .from(menuItem)
      .innerJoin(category, eq(menuItem.categoryId, category.id))
      .where(eq(category.branchId, branchId))
      .limit(1);
    return result.length > 0;
  }

  // ─── Full Menu ──────────────────────────────────────────────

  async findFullMenu(
    branchId: string,
    ctx?: RequestContext,
    options?: {
      includeUnavailable?: boolean;
    },
  ): Promise<FullMenu> {
    const client = this.getClient(ctx);
    const includeUnavailable = options?.includeUnavailable ?? false;

    // 1. Fetch all categories for the branch
    const categories = await client
      .select()
      .from(category)
      .where(eq(category.branchId, branchId))
      .orderBy(asc(category.sortOrder));

    if (categories.length === 0) {
      return [];
    }

    const categoryIds = categories.map((c) => c.id);

    // 2. Fetch all available menu items for these categories in one query
    const allItems = await client
      .select()
      .from(menuItem)
      .where(
        and(
          inArray(menuItem.categoryId, categoryIds),
          ...(includeUnavailable ? [] : [eq(menuItem.isAvailable, true)]),
        ),
      )
      .orderBy(asc(menuItem.sortOrder));

    if (allItems.length === 0) {
      return categories.map((cat) => ({
        category: cat,
        items: [],
      }));
    }

    const itemIds = allItems.map((item) => item.id);

    // 3. Fetch all variants, modifier groups, and modifiers in parallel
    const [allVariants, allModifierGroups, allModifiers] = await Promise.all([
      this.fetchVariantsForItems(client, itemIds),
      this.fetchModifierGroupsForItems(client, itemIds),
      this.fetchAllModifiers(client, itemIds),
    ]);

    // 4. Build lookup maps
    const variantsByItem = new Map<string, ItemVariantRecord[]>();
    for (const v of allVariants) {
      const existing = variantsByItem.get(v.menuItemId) ?? [];
      existing.push(v);
      variantsByItem.set(v.menuItemId, existing);
    }

    const groupsByItem = new Map<string, ModifierGroupRecord[]>();
    for (const g of allModifierGroups) {
      const existing = groupsByItem.get(g.menuItemId) ?? [];
      existing.push(g);
      groupsByItem.set(g.menuItemId, existing);
    }

    const modifiersByGroup = new Map<string, ModifierRecord[]>();
    for (const m of allModifiers) {
      const existing = modifiersByGroup.get(m.modifierGroupId) ?? [];
      existing.push(m);
      modifiersByGroup.set(m.modifierGroupId, existing);
    }

    // 5. Build items by category map
    const itemsByCategory = new Map<string, MenuItemWithDetails[]>();
    for (const item of allItems) {
      const groups = groupsByItem.get(item.id) ?? [];
      const itemDetail: MenuItemWithDetails = {
        item,
        variants: variantsByItem.get(item.id) ?? [],
        modifierGroups: groups.map((group) => ({
          group,
          modifiers: modifiersByGroup.get(group.id) ?? [],
        })),
      };

      const existing = itemsByCategory.get(item.categoryId) ?? [];
      existing.push(itemDetail);
      itemsByCategory.set(item.categoryId, existing);
    }

    // 6. Assemble final structure
    return categories.map((cat) => ({
      category: cat,
      items: itemsByCategory.get(cat.id) ?? [],
    }));
  }

  // --- Private helpers for findFullMenu ---

  private async fetchVariantsForItems(
    client: DbClient | DrizzleTransaction,
    itemIds: string[],
  ): Promise<ItemVariantRecord[]> {
    if (itemIds.length === 0) {
      return [];
    }

    return client
      .select()
      .from(itemVariant)
      .where(inArray(itemVariant.menuItemId, itemIds))
      .orderBy(asc(itemVariant.sortOrder));
  }

  private async fetchModifierGroupsForItems(
    client: DbClient | DrizzleTransaction,
    itemIds: string[],
  ): Promise<ModifierGroupRecord[]> {
    if (itemIds.length === 0) {
      return [];
    }

    return client
      .select()
      .from(modifierGroup)
      .where(inArray(modifierGroup.menuItemId, itemIds))
      .orderBy(asc(modifierGroup.sortOrder));
  }

  private async fetchAllModifiers(
    client: DbClient | DrizzleTransaction,
    itemIds: string[],
  ): Promise<ModifierRecord[]> {
    if (itemIds.length === 0) {
      return [];
    }

    // First get all modifier group IDs for these items
    const groups = await this.fetchModifierGroupsForItems(client, itemIds);
    if (groups.length === 0) {
      return [];
    }

    return client
      .select()
      .from(modifier)
      .where(
        inArray(
          modifier.modifierGroupId,
          groups.map((group) => group.id),
        ),
      )
      .orderBy(asc(modifier.sortOrder));
  }
}
