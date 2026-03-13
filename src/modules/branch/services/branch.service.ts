import { OrganizationNotFoundError } from "@/modules/organization/errors/organization.errors";
import type { IOrganizationRepository } from "@/modules/organization/repositories/organization.repository";
import { RestaurantNotFoundError } from "@/modules/restaurant/errors/restaurant.errors";
import type { IRestaurantRepository } from "@/modules/restaurant/repositories/restaurant.repository";
import type { BranchRecord } from "@/shared/infra/db/schema";
import { logger } from "@/shared/infra/logger";
import type { RequestContext } from "@/shared/kernel/context";
import { AuthorizationError } from "@/shared/kernel/errors";
import type { TransactionManager } from "@/shared/kernel/transaction";
import type {
  CreateBranchDTO,
  OperatingHourEntry,
  UpdateBranchDTO,
} from "../dtos/branch.dto";
import { BranchNotFoundError } from "../errors/branch.errors";
import type { IBranchRepository } from "../repositories/branch.repository";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export interface IBranchService {
  getById(id: string): Promise<BranchRecord>;
  getBySlug(restaurantId: string, slug: string): Promise<BranchRecord>;
  listPublicByRestaurant(restaurantId: string): Promise<BranchRecord[]>;
  listByRestaurant(
    userId: string,
    restaurantId: string,
  ): Promise<BranchRecord[]>;
  create(
    userId: string,
    restaurantId: string,
    data: CreateBranchDTO,
  ): Promise<BranchRecord>;
  update(
    userId: string,
    id: string,
    data: UpdateBranchDTO,
  ): Promise<BranchRecord>;
  getOperatingHours(
    userId: string,
    branchId: string,
  ): Promise<OperatingHourEntry[]>;
  updateOperatingHours(
    userId: string,
    branchId: string,
    hours: OperatingHourEntry[],
  ): Promise<void>;
}

export class BranchService implements IBranchService {
  constructor(
    private branchRepository: IBranchRepository,
    private restaurantRepository: IRestaurantRepository,
    private organizationRepository: IOrganizationRepository,
    private transactionManager: TransactionManager,
  ) {}

  async getById(id: string): Promise<BranchRecord> {
    const branch = await this.branchRepository.findById(id);
    if (!branch) {
      throw new BranchNotFoundError(id);
    }
    return branch;
  }

  async getBySlug(restaurantId: string, slug: string): Promise<BranchRecord> {
    const branch = await this.branchRepository.findBySlug(restaurantId, slug);
    if (!branch) {
      throw new BranchNotFoundError(slug);
    }
    return branch;
  }

  async listPublicByRestaurant(restaurantId: string): Promise<BranchRecord[]> {
    const branches =
      await this.branchRepository.findByRestaurantId(restaurantId);
    return branches.filter((b) => b.isActive);
  }

  async listByRestaurant(
    userId: string,
    restaurantId: string,
  ): Promise<BranchRecord[]> {
    await this.assertRestaurantOwnership(userId, restaurantId);
    return this.branchRepository.findByRestaurantId(restaurantId);
  }

  async create(
    userId: string,
    restaurantId: string,
    data: CreateBranchDTO,
  ): Promise<BranchRecord> {
    const slug = generateSlug(data.name);

    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      await this.assertRestaurantOwnership(userId, restaurantId, ctx);

      const created = await this.branchRepository.create(
        {
          restaurantId,
          name: data.name,
          slug,
          address: data.address ?? null,
          province: data.province ?? null,
          city: data.city ?? null,
          phone: data.phone ?? null,
        },
        ctx,
      );

      logger.info(
        {
          event: "branch.created",
          branchId: created.id,
          restaurantId: created.restaurantId,
          slug: created.slug,
        },
        "Branch created",
      );

      return created;
    });
  }

  async update(
    userId: string,
    id: string,
    data: UpdateBranchDTO,
  ): Promise<BranchRecord> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };

      const existing = await this.branchRepository.findById(id, ctx);
      if (!existing) {
        throw new BranchNotFoundError(id);
      }
      await this.assertRestaurantOwnership(userId, existing.restaurantId, ctx);

      const { id: _id, ...updateData } = data;

      const updated = await this.branchRepository.update(id, updateData, ctx);

      logger.info(
        {
          event: "branch.updated",
          branchId: updated.id,
          restaurantId: updated.restaurantId,
          fields: Object.keys(updateData),
        },
        "Branch updated",
      );

      return updated;
    });
  }

  async getOperatingHours(
    userId: string,
    branchId: string,
  ): Promise<OperatingHourEntry[]> {
    const existing = await this.branchRepository.findById(branchId);
    if (!existing) {
      throw new BranchNotFoundError(branchId);
    }
    await this.assertRestaurantOwnership(userId, existing.restaurantId);

    const rows = await this.branchRepository.findOperatingHours(branchId);
    return rows.map((r) => ({
      dayOfWeek: r.dayOfWeek,
      slotIndex: r.slotIndex,
      opensAt: r.opensAt,
      closesAt: r.closesAt,
      isClosed: r.isClosed,
    }));
  }

  async updateOperatingHours(
    userId: string,
    branchId: string,
    hours: OperatingHourEntry[],
  ): Promise<void> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };

      const existing = await this.branchRepository.findById(branchId, ctx);
      if (!existing) {
        throw new BranchNotFoundError(branchId);
      }
      await this.assertRestaurantOwnership(userId, existing.restaurantId, ctx);

      await this.branchRepository.upsertOperatingHours(branchId, hours, ctx);

      logger.info(
        {
          event: "branch.operating_hours.updated",
          branchId,
        },
        "Operating hours updated",
      );
    });
  }

  private async assertRestaurantOwnership(
    userId: string,
    restaurantId: string,
    ctx?: RequestContext,
  ): Promise<void> {
    const restaurant = await this.restaurantRepository.findById(
      restaurantId,
      ctx,
    );
    if (!restaurant) {
      throw new RestaurantNotFoundError(restaurantId);
    }

    const organization = await this.organizationRepository.findById(
      restaurant.organizationId,
      ctx,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(restaurant.organizationId);
    }

    if (organization.ownerId !== userId) {
      throw new AuthorizationError("Not authorized to manage this restaurant", {
        restaurantId,
        userId,
      });
    }
  }
}
