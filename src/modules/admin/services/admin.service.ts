import { RestaurantNotFoundError } from "@/modules/restaurant/errors/restaurant.errors";
import type { RequestContext } from "@/shared/kernel/context";
import type {
  AdminDashboardOverviewRecord,
  AdminVerificationQueueItemRecord,
  AdminVerificationRequestRecord,
  IAdminRepository,
} from "../repositories/admin.repository";

export interface IAdminService {
  getDashboardOverview(
    ctx?: RequestContext,
  ): Promise<AdminDashboardOverviewRecord>;
  getVerificationQueue(
    ctx?: RequestContext,
  ): Promise<AdminVerificationQueueItemRecord[]>;
  getVerificationRequest(
    requestId: string,
    ctx?: RequestContext,
  ): Promise<AdminVerificationRequestRecord>;
  updateVerificationStatus(
    requestId: string,
    status: "approved" | "rejected",
    ctx?: RequestContext,
  ): Promise<AdminVerificationRequestRecord>;
}

export class AdminService implements IAdminService {
  constructor(private adminRepository: IAdminRepository) {}

  async getDashboardOverview(
    ctx?: RequestContext,
  ): Promise<AdminDashboardOverviewRecord> {
    return this.adminRepository.getDashboardOverview(ctx);
  }

  async getVerificationQueue(
    ctx?: RequestContext,
  ): Promise<AdminVerificationQueueItemRecord[]> {
    return this.adminRepository.getVerificationQueue(ctx);
  }

  async getVerificationRequest(
    requestId: string,
    ctx?: RequestContext,
  ): Promise<AdminVerificationRequestRecord> {
    const request = await this.adminRepository.getVerificationRequestById(
      requestId,
      ctx,
    );

    if (!request) {
      throw new RestaurantNotFoundError(requestId);
    }

    return request;
  }

  async updateVerificationStatus(
    requestId: string,
    status: "approved" | "rejected",
    ctx?: RequestContext,
  ): Promise<AdminVerificationRequestRecord> {
    const updated = await this.adminRepository.updateVerificationStatus(
      requestId,
      status,
      ctx,
    );

    if (!updated) {
      throw new RestaurantNotFoundError(requestId);
    }

    return this.getVerificationRequest(requestId, ctx);
  }
}
