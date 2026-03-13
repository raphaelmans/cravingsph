import { BranchNotFoundError } from "@/modules/branch/errors/branch.errors";
import type { IBranchRepository } from "@/modules/branch/repositories/branch.repository";
import { OrganizationNotFoundError } from "@/modules/organization/errors/organization.errors";
import type { IOrganizationRepository } from "@/modules/organization/repositories/organization.repository";
import { RestaurantNotFoundError } from "@/modules/restaurant/errors/restaurant.errors";
import type { IRestaurantRepository } from "@/modules/restaurant/repositories/restaurant.repository";
import type {
  BranchTableRecord,
  TableSessionRecord,
} from "@/shared/infra/db/schema";
import { logger } from "@/shared/infra/logger";
import type { RequestContext } from "@/shared/kernel/context";
import { AuthorizationError } from "@/shared/kernel/errors";
import type { TransactionManager } from "@/shared/kernel/transaction";
import type { CreateTableDTO, UpdateTableDTO } from "../dtos/table.dto";
import {
  SessionAlreadyActiveError,
  TableNotFoundError,
  TableSessionNotFoundError,
} from "../errors/table.errors";
import type {
  ITableRepository,
  TableWithSession,
} from "../repositories/table.repository";

export interface ITableService {
  listTables(userId: string, branchId: string): Promise<TableWithSession[]>;
  createTable(userId: string, data: CreateTableDTO): Promise<BranchTableRecord>;
  updateTable(
    userId: string,
    id: string,
    data: Omit<UpdateTableDTO, "id">,
  ): Promise<BranchTableRecord>;
  deleteTable(userId: string, id: string): Promise<{ success: true }>;
  openSession(
    userId: string,
    branchTableId: string,
  ): Promise<TableSessionRecord>;
  closeSession(userId: string, sessionId: string): Promise<TableSessionRecord>;
  closeAllSessions(
    userId: string,
    branchId: string,
  ): Promise<{ closed: number }>;
}

export class TableService implements ITableService {
  constructor(
    private tableRepository: ITableRepository,
    private branchRepository: IBranchRepository,
    private restaurantRepository: IRestaurantRepository,
    private organizationRepository: IOrganizationRepository,
    private transactionManager: TransactionManager,
  ) {}

  async listTables(
    userId: string,
    branchId: string,
  ): Promise<TableWithSession[]> {
    await this.assertBranchOwnership(userId, branchId);
    return this.tableRepository.findByBranchIdWithSessions(branchId);
  }

  async createTable(
    userId: string,
    data: CreateTableDTO,
  ): Promise<BranchTableRecord> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      await this.assertBranchOwnership(userId, data.branchId, ctx);

      const sortOrder =
        data.sortOrder ??
        (await this.tableRepository.getNextSortOrder(data.branchId, ctx));

      const created = await this.tableRepository.create(
        {
          branchId: data.branchId,
          label: data.label,
          code: data.code,
          sortOrder,
        },
        ctx,
      );

      logger.info(
        {
          event: "table.created",
          tableId: created.id,
          branchId: created.branchId,
        },
        "Table created",
      );

      return created;
    });
  }

  async updateTable(
    userId: string,
    id: string,
    data: Omit<UpdateTableDTO, "id">,
  ): Promise<BranchTableRecord> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      const table = await this.tableRepository.findById(id, ctx);
      if (!table) {
        throw new TableNotFoundError(id);
      }

      await this.assertBranchOwnership(userId, table.branchId, ctx);
      const updated = await this.tableRepository.update(id, data, ctx);

      logger.info(
        {
          event: "table.updated",
          tableId: updated.id,
          fields: Object.keys(data),
        },
        "Table updated",
      );

      return updated;
    });
  }

  async deleteTable(userId: string, id: string): Promise<{ success: true }> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      const table = await this.tableRepository.findById(id, ctx);
      if (!table) {
        throw new TableNotFoundError(id);
      }

      await this.assertBranchOwnership(userId, table.branchId, ctx);
      await this.tableRepository.delete(id, ctx);

      logger.info({ event: "table.deleted", tableId: id }, "Table deleted");

      return { success: true };
    });
  }

  async openSession(
    userId: string,
    branchTableId: string,
  ): Promise<TableSessionRecord> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      const table = await this.tableRepository.findById(branchTableId, ctx);
      if (!table) {
        throw new TableNotFoundError(branchTableId);
      }

      await this.assertBranchOwnership(userId, table.branchId, ctx);

      const existing = await this.tableRepository.findActiveSession(
        branchTableId,
        ctx,
      );
      if (existing) {
        throw new SessionAlreadyActiveError(branchTableId);
      }

      const session = await this.tableRepository.createSession(
        {
          branchTableId,
          status: "active",
          openedBy: userId,
        },
        ctx,
      );

      logger.info(
        {
          event: "table.session.opened",
          sessionId: session.id,
          branchTableId,
        },
        "Table session opened",
      );

      return session;
    });
  }

  async closeSession(
    userId: string,
    sessionId: string,
  ): Promise<TableSessionRecord> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      const session = await this.tableRepository.findSessionById(
        sessionId,
        ctx,
      );
      if (!session) {
        throw new TableSessionNotFoundError(sessionId);
      }

      const table = await this.tableRepository.findById(
        session.branchTableId,
        ctx,
      );
      if (!table) {
        throw new TableNotFoundError(session.branchTableId);
      }

      await this.assertBranchOwnership(userId, table.branchId, ctx);
      const closed = await this.tableRepository.closeSession(
        sessionId,
        userId,
        ctx,
      );

      logger.info(
        {
          event: "table.session.closed",
          sessionId,
          branchTableId: table.id,
        },
        "Table session closed",
      );

      return closed;
    });
  }

  async closeAllSessions(
    userId: string,
    branchId: string,
  ): Promise<{ closed: number }> {
    return this.transactionManager.run(async (tx) => {
      const ctx: RequestContext = { tx };
      await this.assertBranchOwnership(userId, branchId, ctx);
      const closed = await this.tableRepository.closeAllActiveSessions(
        branchId,
        userId,
        ctx,
      );

      logger.info(
        {
          event: "table.session.closed_all",
          branchId,
          count: closed,
        },
        "All table sessions closed",
      );

      return { closed };
    });
  }

  private async assertBranchOwnership(
    userId: string,
    branchId: string,
    ctx?: RequestContext,
  ): Promise<void> {
    const branch = await this.branchRepository.findById(branchId, ctx);
    if (!branch) {
      throw new BranchNotFoundError(branchId);
    }

    const restaurant = await this.restaurantRepository.findById(
      branch.restaurantId,
      ctx,
    );
    if (!restaurant) {
      throw new RestaurantNotFoundError(branch.restaurantId);
    }

    const organization = await this.organizationRepository.findById(
      restaurant.organizationId,
      ctx,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(restaurant.organizationId);
    }

    if (organization.ownerId !== userId) {
      throw new AuthorizationError("Not authorized to manage this branch", {
        branchId,
        userId,
      });
    }
  }
}
