import { ConflictError, NotFoundError } from "@/shared/kernel/errors";

export class OrganizationNotFoundError extends NotFoundError {
  readonly code = "ORGANIZATION_NOT_FOUND";

  constructor(identifier: string) {
    super("Organization not found", { identifier });
  }
}

export class OrganizationAlreadyExistsError extends ConflictError {
  readonly code = "ORGANIZATION_ALREADY_EXISTS";

  constructor(ownerId: string) {
    super("Organization already exists for this owner", { ownerId });
  }
}
