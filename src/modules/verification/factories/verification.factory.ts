import { getContainer } from "@/shared/infra/container";
import { VerificationRepository } from "../repositories/verification.repository";
import { VerificationService } from "../services/verification.service";

let verificationRepository: VerificationRepository | null = null;
let verificationService: VerificationService | null = null;

export function makeVerificationRepository() {
  if (!verificationRepository) {
    verificationRepository = new VerificationRepository(getContainer().db);
  }
  return verificationRepository;
}

export function makeVerificationService() {
  if (!verificationService) {
    verificationService = new VerificationService(makeVerificationRepository());
  }
  return verificationService;
}
