import { BusinessRuleError, NotFoundError } from "@/shared/kernel/errors";

export class OrderNotFoundError extends NotFoundError {
  constructor(orderId: string) {
    super(`Order not found: ${orderId}`, { orderId });
  }
}

export class InvalidStatusTransitionError extends BusinessRuleError {
  constructor(from: string, to: string) {
    super(`Cannot transition from "${from}" to "${to}"`, { from, to });
  }
}

export class BranchNotAcceptingOrdersError extends BusinessRuleError {
  constructor(branchId: string) {
    super("This branch is not accepting orders right now", { branchId });
  }
}

export class OrderNotOwnedError extends BusinessRuleError {
  constructor() {
    super("You do not own this order");
  }
}
