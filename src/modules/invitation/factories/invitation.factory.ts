import { getContainer } from "@/shared/infra/container";
import { InvitationRepository } from "../repositories/invitation.repository";
import { InvitationService } from "../services/invitation.service";

let repository: InvitationRepository | null = null;
let service: InvitationService | null = null;

export function makeInvitationRepository(): InvitationRepository {
  if (!repository) {
    repository = new InvitationRepository(getContainer().db);
  }
  return repository;
}

export function makeInvitationService(): InvitationService {
  if (!service) {
    service = new InvitationService(makeInvitationRepository());
  }
  return service;
}
