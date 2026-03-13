import { makeBranchRepository } from "@/modules/branch/factories/branch.factory";
import { makeOrganizationRepository } from "@/modules/organization/factories/organization.factory";
import { makeRestaurantRepository } from "@/modules/restaurant/factories/restaurant.factory";
import { getContainer } from "@/shared/infra/container";
import { TableRepository } from "../repositories/table.repository";
import { TableService } from "../services/table.service";

let tableRepository: TableRepository | null = null;
let tableService: TableService | null = null;

export function makeTableRepository() {
  if (!tableRepository) {
    tableRepository = new TableRepository(getContainer().db);
  }
  return tableRepository;
}

export function makeTableService() {
  if (!tableService) {
    tableService = new TableService(
      makeTableRepository(),
      makeBranchRepository(),
      makeRestaurantRepository(),
      makeOrganizationRepository(),
      getContainer().transactionManager,
    );
  }
  return tableService;
}
