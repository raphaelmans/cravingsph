import type { OrganizationRecord } from "@/shared/infra/db/schema";
import { logger } from "@/shared/infra/logger";
import type { RequestContext } from "@/shared/kernel/context";
import type { TransactionManager } from "@/shared/kernel/transaction";
import type {
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
} from "../dtos/organization.dto";
import {
  OrganizationAlreadyExistsError,
  OrganizationNotFoundError,
} from "../errors/organization.errors";
import type { IOrganizationRepository } from "../repositories/organization.repository";

export interface IOrganizationService {
  getById(id: string): Promise<OrganizationRecord>;
  getByOwnerId(ownerId: string): Promise<OrganizationRecord>;
  create(
    ownerId: string,
    data: CreateOrganizationDTO,
  ): Promise<OrganizationRecord>;
  update(id: string, data: UpdateOrganizationDTO): Promise<OrganizationRecord>;
}

/**
 * Generates a URL-friendly slug from a name.
 * Lowercases, replaces spaces/special chars with hyphens, trims hyphens.
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Generates a random 4-character alphanumeric suffix.
 */
function randomSuffix(): string {
  return Math.random().toString(36).substring(2, 6);
}

export class OrganizationService implements IOrganizationService {
  constructor(
    private organizationRepository: IOrganizationRepository,
    private transactionManager: TransactionManager,
  ) {}

  async getById(id: string): Promise<OrganizationRecord> {
    const org = await this.organizationRepository.findById(id);
    if (!org) {
      throw new OrganizationNotFoundError(id);
    }
    return org;
  }

  async getByOwnerId(ownerId: string): Promise<OrganizationRecord> {
    const org = await this.organizationRepository.findByOwnerId(ownerId);
    if (!org) {
      throw new OrganizationNotFoundError(ownerId);
    }
    return org;
  }

  async create(
    ownerId: string,
    data: CreateOrganizationDTO,
  ): Promise<OrganizationRecord> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };

      // Check if owner already has an organization
      const existing = await this.organizationRepository.findByOwnerId(
        ownerId,
        ctx,
      );
      if (existing) {
        throw new OrganizationAlreadyExistsError(ownerId);
      }

      // Generate a unique slug from the name
      let slug = generateSlug(data.name);
      const existingBySlug = await this.organizationRepository.findBySlug(
        slug,
        ctx,
      );
      if (existingBySlug) {
        slug = `${slug}-${randomSuffix()}`;
      }

      const created = await this.organizationRepository.create(
        {
          ownerId,
          name: data.name,
          slug,
        },
        ctx,
      );

      logger.info(
        {
          event: "organization.created",
          organizationId: created.id,
          ownerId: created.ownerId,
          slug: created.slug,
        },
        "Organization created",
      );

      return created;
    });
  }

  async update(
    id: string,
    data: UpdateOrganizationDTO,
  ): Promise<OrganizationRecord> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };

      const existing = await this.organizationRepository.findById(id, ctx);
      if (!existing) {
        throw new OrganizationNotFoundError(id);
      }

      const updated = await this.organizationRepository.update(id, data, ctx);

      logger.info(
        {
          event: "organization.updated",
          organizationId: updated.id,
          ownerId: updated.ownerId,
          fields: Object.keys(data),
        },
        "Organization updated",
      );

      return updated;
    });
  }
}
