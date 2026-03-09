import { makeBranchRepository } from "@/modules/branch/factories/branch.factory";
import { makeOrganizationRepository } from "@/modules/organization/factories/organization.factory";
import { makeRestaurantRepository } from "@/modules/restaurant/factories/restaurant.factory";
import { getContainer } from "@/shared/infra/container";
import { MenuRepository } from "../repositories/menu.repository";
import { MenuService } from "../services/menu.service";

let menuRepository: MenuRepository | null = null;
let menuService: MenuService | null = null;

export function makeMenuRepository() {
  if (!menuRepository) {
    menuRepository = new MenuRepository(getContainer().db);
  }
  return menuRepository;
}

export function makeMenuService() {
  if (!menuService) {
    menuService = new MenuService(
      makeMenuRepository(),
      makeBranchRepository(),
      makeRestaurantRepository(),
      makeOrganizationRepository(),
      getContainer().transactionManager,
    );
  }
  return menuService;
}
