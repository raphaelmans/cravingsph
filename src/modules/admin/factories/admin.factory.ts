import { getContainer } from "@/shared/infra/container";
import { AdminRepository } from "../repositories/admin.repository";
import { AdminService } from "../services/admin.service";

let adminRepository: AdminRepository | null = null;
let adminService: AdminService | null = null;

export function makeAdminRepository() {
  if (!adminRepository) {
    adminRepository = new AdminRepository(getContainer().db);
  }
  return adminRepository;
}

export function makeAdminService() {
  if (!adminService) {
    adminService = new AdminService(makeAdminRepository());
  }
  return adminService;
}
