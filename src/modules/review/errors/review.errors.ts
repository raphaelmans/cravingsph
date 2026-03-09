import {
  BusinessRuleError,
  ConflictError,
  NotFoundError,
} from "@/shared/kernel/errors";

export class ReviewAlreadyExistsError extends ConflictError {
  constructor(orderId: string) {
    super("A review already exists for this order", { orderId });
  }
}

export class OrderNotCompletedError extends BusinessRuleError {
  constructor(orderId: string, status: string) {
    super("Only completed orders can be reviewed", { orderId, status });
  }
}

export class ReviewOrderNotFoundError extends NotFoundError {
  constructor(orderId: string) {
    super(`Order not found: ${orderId}`, { orderId });
  }
}

export class ReviewOrderNotOwnedError extends BusinessRuleError {
  constructor() {
    super("You do not own this order");
  }
}
