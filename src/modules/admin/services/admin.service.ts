import type { RequestContext } from "@/shared/kernel/context";
import type {
  AdminDashboardOverviewRecord,
  IAdminRepository,
} from "../repositories/admin.repository";

export interface IAdminService {
  getDashboardOverview(
    ctx?: RequestContext,
  ): Promise<AdminDashboardOverviewRecord>;
}

export class AdminService implements IAdminService {
  constructor(private adminRepository: IAdminRepository) {}

  async getDashboardOverview(
    ctx?: RequestContext,
  ): Promise<AdminDashboardOverviewRecord> {
    return this.adminRepository.getDashboardOverview(ctx);
  }
}
