import { getContainer } from "@/shared/infra/container";
import { OrganizationRepository } from "../repositories/organization.repository";
import { OrganizationService } from "../services/organization.service";

let organizationRepository: OrganizationRepository | null = null;
let organizationService: OrganizationService | null = null;

export function makeOrganizationRepository() {
  if (!organizationRepository) {
    organizationRepository = new OrganizationRepository(getContainer().db);
  }
  return organizationRepository;
}

export function makeOrganizationService() {
  if (!organizationService) {
    organizationService = new OrganizationService(
      makeOrganizationRepository(),
      getContainer().transactionManager,
    );
  }
  return organizationService;
}
