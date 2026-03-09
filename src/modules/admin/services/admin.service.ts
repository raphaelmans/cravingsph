import { RestaurantNotFoundError } from "@/modules/restaurant/errors/restaurant.errors";
import type { RequestContext } from "@/shared/kernel/context";
import type { UpdateAdminRestaurantDTO } from "../dtos/admin.dto";
import type {
  AdminDashboardOverviewRecord,
  AdminRestaurantDetailRecord,
  AdminRestaurantListItemRecord,
  AdminVerificationQueueItemRecord,
  AdminVerificationRequestRecord,
  IAdminRepository,
} from "../repositories/admin.repository";

export interface IAdminService {
  getDashboardOverview(
    ctx?: RequestContext,
  ): Promise<AdminDashboardOverviewRecord>;
  getRestaurants(
    ctx?: RequestContext,
  ): Promise<AdminRestaurantListItemRecord[]>;
  getRestaurant(
    id: string,
    ctx?: RequestContext,
  ): Promise<AdminRestaurantDetailRecord>;
  updateRestaurant(
    id: string,
    data: Omit<UpdateAdminRestaurantDTO, "id">,
    ctx?: RequestContext,
  ): Promise<AdminRestaurantDetailRecord>;
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

  async getRestaurants(
    ctx?: RequestContext,
  ): Promise<AdminRestaurantListItemRecord[]> {
    return this.adminRepository.getRestaurants(ctx);
  }

  async getRestaurant(
    id: string,
    ctx?: RequestContext,
  ): Promise<AdminRestaurantDetailRecord> {
    const restaurant = await this.adminRepository.getRestaurantById(id, ctx);

    if (!restaurant) {
      throw new RestaurantNotFoundError(id);
    }

    return restaurant;
  }

  async updateRestaurant(
    id: string,
    data: Omit<UpdateAdminRestaurantDTO, "id">,
    ctx?: RequestContext,
  ): Promise<AdminRestaurantDetailRecord> {
    const updated = await this.adminRepository.updateRestaurant(id, data, ctx);

    if (!updated) {
      throw new RestaurantNotFoundError(id);
    }

    return this.getRestaurant(id, ctx);
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
