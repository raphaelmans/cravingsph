import { BusinessRuleError, NotFoundError } from "@/shared/kernel/errors";

export class RestaurantNotOwnedError extends NotFoundError {
  constructor(restaurantId: string) {
    super(`Restaurant not found or not owned: ${restaurantId}`, {
      restaurantId,
    });
  }
}

export class VerificationAlreadySubmittedError extends BusinessRuleError {
  constructor(restaurantId: string) {
    super(`Verification already submitted for restaurant: ${restaurantId}`, {
      restaurantId,
    });
  }
}

export class IncompleteDocumentsError extends BusinessRuleError {
  constructor(restaurantId: string, uploaded: number, required: number) {
    super(
      `Cannot submit verification: ${uploaded}/${required} documents uploaded`,
      { restaurantId, uploaded, required },
    );
  }
}
