import { makeOrganizationRepository } from "@/modules/organization/factories/organization.factory";
import { makeRestaurantRepository } from "@/modules/restaurant/factories/restaurant.factory";
import { getContainer } from "@/shared/infra/container";
import { BranchRepository } from "../repositories/branch.repository";
import { BranchService } from "../services/branch.service";

let branchRepository: BranchRepository | null = null;
let branchService: BranchService | null = null;

export function makeBranchRepository() {
  if (!branchRepository) {
    branchRepository = new BranchRepository(getContainer().db);
  }
  return branchRepository;
}

export function makeBranchService() {
  if (!branchService) {
    branchService = new BranchService(
      makeBranchRepository(),
      makeRestaurantRepository(),
      makeOrganizationRepository(),
      getContainer().transactionManager,
    );
  }
  return branchService;
}
