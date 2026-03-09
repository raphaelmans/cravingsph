import { ConflictError, NotFoundError } from "@/shared/kernel/errors";

export class RestaurantNotFoundError extends NotFoundError {
  readonly code = "RESTAURANT_NOT_FOUND";

  constructor(identifier: string) {
    super("Restaurant not found", { identifier });
  }
}

export class RestaurantSlugTakenError extends ConflictError {
  readonly code = "RESTAURANT_SLUG_TAKEN";

  constructor(slug: string) {
    super("Restaurant slug is already taken", { slug });
  }
}
