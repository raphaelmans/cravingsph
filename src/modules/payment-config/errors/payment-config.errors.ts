import { NotFoundError } from "@/shared/kernel/errors";

export class PaymentMethodNotFoundError extends NotFoundError {
  constructor(methodId: string) {
    super(`Payment method not found: ${methodId}`, { methodId });
  }
}
