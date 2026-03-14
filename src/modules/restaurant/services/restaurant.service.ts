import { OrganizationNotFoundError } from "@/modules/organization/errors/organization.errors";
import type { IOrganizationRepository } from "@/modules/organization/repositories/organization.repository";
import type { RestaurantRecord } from "@/shared/infra/db/schema";
import { logger } from "@/shared/infra/logger";
import type { RequestContext } from "@/shared/kernel/context";
import { AuthorizationError } from "@/shared/kernel/errors";
import type { TransactionManager } from "@/shared/kernel/transaction";
import type {
  CreateRestaurantDTO,
  UpdateRestaurantDTO,
} from "../dtos/restaurant.dto";
import {
  RestaurantNotFoundError,
  RestaurantSlugTakenError,
} from "../errors/restaurant.errors";
import type { IRestaurantRepository } from "../repositories/restaurant.repository";

export interface IRestaurantService {
  getById(id: string): Promise<RestaurantRecord>;
  getBySlug(slug: string): Promise<RestaurantRecord>;
  listByOrganizationId(organizationId: string): Promise<RestaurantRecord[]>;
  listByOrganization(
    userId: string,
    organizationId: string,
  ): Promise<RestaurantRecord[]>;
  create(
    userId: string,
    organizationId: string,
    data: Omit<CreateRestaurantDTO, "organizationId">,
  ): Promise<RestaurantRecord>;
  update(
    userId: string,
    id: string,
    data: Omit<UpdateRestaurantDTO, "id">,
  ): Promise<RestaurantRecord>;
}

/**
 * Generates a URL-friendly slug from a name.
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Generates a random 4-character alphanumeric suffix.
 */
function randomSuffix(): string {
  return Math.random().toString(36).substring(2, 6);
}

export class RestaurantService implements IRestaurantService {
  constructor(
    private restaurantRepository: IRestaurantRepository,
    private organizationRepository: IOrganizationRepository,
    private transactionManager: TransactionManager,
  ) {}

  async getById(id: string): Promise<RestaurantRecord> {
    const restaurant = await this.restaurantRepository.findById(id);
    if (!restaurant) {
      throw new RestaurantNotFoundError(id);
    }
    return restaurant;
  }

  async getBySlug(slug: string): Promise<RestaurantRecord> {
    const restaurant = await this.restaurantRepository.findBySlug(slug);
    if (!restaurant) {
      throw new RestaurantNotFoundError(slug);
    }
    return restaurant;
  }

  async listByOrganizationId(
    organizationId: string,
  ): Promise<RestaurantRecord[]> {
    return this.restaurantRepository.findByOrganizationId(organizationId);
  }

  async listByOrganization(
    userId: string,
    organizationId: string,
  ): Promise<RestaurantRecord[]> {
    await this.assertOrganizationOwnership(userId, organizationId);
    return this.restaurantRepository.findByOrganizationId(organizationId);
  }

  async create(
    userId: string,
    organizationId: string,
    data: Omit<CreateRestaurantDTO, "organizationId">,
  ): Promise<RestaurantRecord> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      await this.assertOrganizationOwnership(userId, organizationId, ctx);

      let slug = generateSlug(data.name);
      const existing = await this.restaurantRepository.findBySlug(slug, ctx);
      if (existing) {
        slug = `${slug}-${randomSuffix()}`;
        const stillTaken = await this.restaurantRepository.findBySlug(
          slug,
          ctx,
        );
        if (stillTaken) {
          throw new RestaurantSlugTakenError(slug);
        }
      }

      const created = await this.restaurantRepository.create(
        {
          organizationId,
          name: data.name,
          slug,
          description: data.description ?? null,
          cuisineType: data.cuisineType ?? null,
          phone: data.phone ?? null,
          email: data.email ?? null,
        },
        ctx,
      );

      logger.info(
        {
          event: "restaurant.created",
          restaurantId: created.id,
          organizationId: created.organizationId,
          slug: created.slug,
        },
        "Restaurant created",
      );

      return created;
    });
  }

  async update(
    userId: string,
    id: string,
    data: Omit<UpdateRestaurantDTO, "id">,
  ): Promise<RestaurantRecord> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };

      const existing = await this.restaurantRepository.findById(id, ctx);
      if (!existing) {
        throw new RestaurantNotFoundError(id);
      }
      await this.assertOrganizationOwnership(
        userId,
        existing.organizationId,
        ctx,
      );

      const updated = await this.restaurantRepository.update(id, data, ctx);

      logger.info(
        {
          event: "restaurant.updated",
          restaurantId: updated.id,
          organizationId: updated.organizationId,
          fields: Object.keys(data),
        },
        "Restaurant updated",
      );

      return updated;
    });
  }

  private async assertOrganizationOwnership(
    userId: string,
    organizationId: string,
    ctx?: RequestContext,
  ): Promise<void> {
    const organization = await this.organizationRepository.findById(
      organizationId,
      ctx,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(organizationId);
    }

    if (organization.ownerId !== userId) {
      throw new AuthorizationError(
        "Not authorized to manage this organization",
        {
          organizationId,
          userId,
        },
      );
    }
  }
}
