import { and, eq } from "drizzle-orm";
import { organization, paymentMethod } from "@/shared/infra/db/schema";
import type { DbClient } from "@/shared/infra/db/types";

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------

export interface PaymentMethodRow {
  id: string;
  organizationId: string;
  type: string;
  accountName: string;
  accountNumber: string;
  bankName: string | null;
  isDefault: boolean;
}

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IPaymentConfigRepository {
  findByOrgId(orgId: string): Promise<PaymentMethodRow[]>;
  findById(id: string): Promise<PaymentMethodRow | null>;
  create(data: {
    organizationId: string;
    type: string;
    accountName: string;
    accountNumber: string;
    bankName?: string;
    isDefault: boolean;
  }): Promise<PaymentMethodRow>;
  update(
    id: string,
    data: {
      type: string;
      accountName: string;
      accountNumber: string;
      bankName?: string;
      isDefault: boolean;
    },
  ): Promise<PaymentMethodRow>;
  delete(id: string): Promise<void>;
  clearDefault(orgId: string): Promise<void>;
  getOrgOwnerId(orgId: string): Promise<string | null>;
  findOrgIdByOwnerId(ownerId: string): Promise<string | null>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

const selectFields = {
  id: paymentMethod.id,
  organizationId: paymentMethod.organizationId,
  type: paymentMethod.type,
  accountName: paymentMethod.accountName,
  accountNumber: paymentMethod.accountNumber,
  bankName: paymentMethod.bankName,
  isDefault: paymentMethod.isDefault,
} as const;

export class PaymentConfigRepository implements IPaymentConfigRepository {
  constructor(private db: DbClient) {}

  async findByOrgId(orgId: string): Promise<PaymentMethodRow[]> {
    return this.db
      .select(selectFields)
      .from(paymentMethod)
      .where(
        and(
          eq(paymentMethod.organizationId, orgId),
          eq(paymentMethod.isActive, true),
        ),
      );
  }

  async findById(id: string): Promise<PaymentMethodRow | null> {
    const rows = await this.db
      .select(selectFields)
      .from(paymentMethod)
      .where(eq(paymentMethod.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

  async create(data: {
    organizationId: string;
    type: string;
    accountName: string;
    accountNumber: string;
    bankName?: string;
    isDefault: boolean;
  }): Promise<PaymentMethodRow> {
    const [row] = await this.db
      .insert(paymentMethod)
      .values({
        organizationId: data.organizationId,
        type: data.type,
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        bankName: data.bankName ?? null,
        isDefault: data.isDefault,
      })
      .returning(selectFields);

    return row;
  }

  async update(
    id: string,
    data: {
      type: string;
      accountName: string;
      accountNumber: string;
      bankName?: string;
      isDefault: boolean;
    },
  ): Promise<PaymentMethodRow> {
    const [row] = await this.db
      .update(paymentMethod)
      .set({
        type: data.type,
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        bankName: data.bankName ?? null,
        isDefault: data.isDefault,
        updatedAt: new Date(),
      })
      .where(eq(paymentMethod.id, id))
      .returning(selectFields);

    return row;
  }

  async delete(id: string): Promise<void> {
    await this.db
      .update(paymentMethod)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(paymentMethod.id, id));
  }

  async clearDefault(orgId: string): Promise<void> {
    await this.db
      .update(paymentMethod)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(
        and(
          eq(paymentMethod.organizationId, orgId),
          eq(paymentMethod.isDefault, true),
        ),
      );
  }

  async getOrgOwnerId(orgId: string): Promise<string | null> {
    const rows = await this.db
      .select({ ownerId: organization.ownerId })
      .from(organization)
      .where(eq(organization.id, orgId))
      .limit(1);

    return rows[0]?.ownerId ?? null;
  }

  async findOrgIdByOwnerId(ownerId: string): Promise<string | null> {
    const rows = await this.db
      .select({ id: organization.id })
      .from(organization)
      .where(eq(organization.ownerId, ownerId))
      .limit(1);

    return rows[0]?.id ?? null;
  }
}
