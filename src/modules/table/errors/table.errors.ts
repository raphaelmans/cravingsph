import {
  BusinessRuleError,
  ConflictError,
  NotFoundError,
} from "@/shared/kernel/errors";

export class TableNotFoundError extends NotFoundError {
  readonly code = "TABLE_NOT_FOUND";

  constructor(id: string) {
    super("Table not found", { id });
  }
}

export class TableCodeConflictError extends ConflictError {
  readonly code = "TABLE_CODE_CONFLICT";

  constructor(branchId: string, code: string) {
    super("A table with this code already exists in this branch", {
      branchId,
      code,
    });
  }
}

export class SessionAlreadyActiveError extends BusinessRuleError {
  readonly code = "SESSION_ALREADY_ACTIVE";

  constructor(branchTableId: string) {
    super("This table already has an active session", { branchTableId });
  }
}

export class TableSessionNotFoundError extends NotFoundError {
  readonly code = "TABLE_SESSION_NOT_FOUND";

  constructor(sessionId: string) {
    super("Table session not found", { sessionId });
  }
}
