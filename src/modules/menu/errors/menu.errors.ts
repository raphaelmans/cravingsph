import { BusinessRuleError, NotFoundError } from "@/shared/kernel/errors";

export class CategoryNotFoundError extends NotFoundError {
  readonly code = "CATEGORY_NOT_FOUND";

  constructor(id: string) {
    super("Category not found", { id });
  }
}

export class MenuItemNotFoundError extends NotFoundError {
  readonly code = "MENU_ITEM_NOT_FOUND";

  constructor(id: string) {
    super("Menu item not found", { id });
  }
}

export class ModifierGroupNotFoundError extends NotFoundError {
  readonly code = "MODIFIER_GROUP_NOT_FOUND";

  constructor(id: string) {
    super("Modifier group not found", { id });
  }
}

export class VariantNotFoundError extends NotFoundError {
  readonly code = "VARIANT_NOT_FOUND";

  constructor(id: string) {
    super("Variant not found", { id });
  }
}

export class ModifierNotFoundError extends NotFoundError {
  readonly code = "MODIFIER_NOT_FOUND";

  constructor(id: string) {
    super("Modifier not found", { id });
  }
}

export class InvalidModifierGroupSelectionRulesError extends BusinessRuleError {
  readonly code = "INVALID_MODIFIER_GROUP_SELECTION_RULES";

  constructor(minSelections: number, maxSelections: number) {
    super("Modifier group selection rules are invalid", {
      minSelections,
      maxSelections,
    });
  }
}
