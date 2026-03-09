import { OrganizationNotFoundError } from "@/modules/organization/errors/organization.errors";
import type {
  AddPaymentMethodInput,
  PaymentMethodDTO,
  UpdatePaymentMethodInput,
} from "../dtos/payment-config.dto";
import { PaymentMethodNotFoundError } from "../errors/payment-config.errors";
import type {
  IPaymentConfigRepository,
  PaymentMethodRow,
} from "../repositories/payment-config.repository";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IPaymentConfigService {
  list(userId: string): Promise<PaymentMethodDTO[]>;
  add(userId: string, input: AddPaymentMethodInput): Promise<PaymentMethodDTO>;
  update(
    userId: string,
    input: UpdatePaymentMethodInput,
  ): Promise<PaymentMethodDTO>;
  remove(userId: string, methodId: string): Promise<void>;
  setDefault(userId: string, methodId: string): Promise<void>;
  has(userId: string): Promise<boolean>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class PaymentConfigService implements IPaymentConfigService {
  constructor(private repository: IPaymentConfigRepository) {}

  async list(userId: string): Promise<PaymentMethodDTO[]> {
    const orgId = await this.resolveOrgId(userId);
    const rows = await this.repository.findByOrgId(orgId);
    return rows.map((r) => this.toDTO(r));
  }

  async add(
    userId: string,
    input: AddPaymentMethodInput,
  ): Promise<PaymentMethodDTO> {
    const orgId = await this.resolveOrgId(userId);

    // If this is marked as default, clear others first
    if (input.isDefault) {
      await this.repository.clearDefault(orgId);
    }

    // If no methods exist yet, make this the default regardless
    const existing = await this.repository.findByOrgId(orgId);
    const shouldBeDefault = input.isDefault || existing.length === 0;

    const row = await this.repository.create({
      organizationId: orgId,
      type: input.type,
      accountName: input.accountName,
      accountNumber: input.accountNumber,
      bankName: input.type === "bank" ? input.bankName : undefined,
      isDefault: shouldBeDefault,
    });

    return this.toDTO(row);
  }

  async update(
    userId: string,
    input: UpdatePaymentMethodInput,
  ): Promise<PaymentMethodDTO> {
    const orgId = await this.resolveOrgId(userId);
    const method = await this.repository.findById(input.id);

    if (!method || method.organizationId !== orgId) {
      throw new PaymentMethodNotFoundError(input.id);
    }

    if (input.isDefault) {
      await this.repository.clearDefault(orgId);
    }

    const row = await this.repository.update(input.id, {
      type: input.type,
      accountName: input.accountName,
      accountNumber: input.accountNumber,
      bankName: input.type === "bank" ? input.bankName : undefined,
      isDefault: input.isDefault ?? method.isDefault,
    });

    return this.toDTO(row);
  }

  async remove(userId: string, methodId: string): Promise<void> {
    const orgId = await this.resolveOrgId(userId);
    const method = await this.repository.findById(methodId);

    if (!method || method.organizationId !== orgId) {
      throw new PaymentMethodNotFoundError(methodId);
    }

    const wasDefault = method.isDefault;
    await this.repository.delete(methodId);

    // If the removed method was the default, promote the first remaining
    if (wasDefault) {
      const remaining = await this.repository.findByOrgId(orgId);
      if (remaining.length > 0 && !remaining.some((m) => m.isDefault)) {
        await this.repository.update(remaining[0].id, {
          type: remaining[0].type,
          accountName: remaining[0].accountName,
          accountNumber: remaining[0].accountNumber,
          bankName: remaining[0].bankName ?? undefined,
          isDefault: true,
        });
      }
    }
  }

  async setDefault(userId: string, methodId: string): Promise<void> {
    const orgId = await this.resolveOrgId(userId);
    const method = await this.repository.findById(methodId);

    if (!method || method.organizationId !== orgId) {
      throw new PaymentMethodNotFoundError(methodId);
    }

    await this.repository.clearDefault(orgId);
    await this.repository.update(methodId, {
      type: method.type,
      accountName: method.accountName,
      accountNumber: method.accountNumber,
      bankName: method.bankName ?? undefined,
      isDefault: true,
    });
  }

  async has(userId: string): Promise<boolean> {
    const orgId = await this.resolveOrgId(userId);
    const methods = await this.repository.findByOrgId(orgId);
    return methods.length > 0;
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private async resolveOrgId(userId: string): Promise<string> {
    const orgId = await this.repository.findOrgIdByOwnerId(userId);
    if (!orgId) {
      throw new OrganizationNotFoundError(userId);
    }
    return orgId;
  }

  private toDTO(row: PaymentMethodRow): PaymentMethodDTO {
    return {
      id: row.id,
      type: row.type as PaymentMethodDTO["type"],
      accountName: row.accountName,
      accountNumber: row.accountNumber,
      bankName: row.bankName,
      isDefault: row.isDefault,
    };
  }
}
