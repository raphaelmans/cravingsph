import {
  BusinessRuleError,
  ConflictError,
  NotFoundError,
} from "@/shared/kernel/errors";

export class InvitationNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super(`Invitation not found: ${identifier}`);
  }
}

export class InvitationExpiredError extends BusinessRuleError {
  constructor() {
    super("This invitation link has expired");
  }
}

export class InvitationAlreadyAcceptedError extends ConflictError {
  constructor() {
    super("This invitation has already been accepted");
  }
}
