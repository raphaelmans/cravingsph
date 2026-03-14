import {
  AuthorizationError,
  BusinessRuleError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/shared/kernel/errors";

export class MembershipNotFoundError extends NotFoundError {
  readonly code = "MEMBERSHIP_NOT_FOUND";

  constructor(identifier: string) {
    super("Team membership not found", { identifier });
  }
}

export class MembershipAlreadyExistsError extends ConflictError {
  readonly code = "MEMBERSHIP_ALREADY_EXISTS";

  constructor(userId: string, organizationId: string) {
    super("User already has a membership in this organization", {
      userId,
      organizationId,
    });
  }
}

export class AssignmentNotFoundError extends NotFoundError {
  readonly code = "ASSIGNMENT_NOT_FOUND";

  constructor(assignmentId: string) {
    super("Scoped assignment not found", { assignmentId });
  }
}

export class InsufficientBranchAccessError extends AuthorizationError {
  readonly code = "INSUFFICIENT_BRANCH_ACCESS";

  constructor(userId: string, branchId: string) {
    super("User does not have access to this branch", { userId, branchId });
  }
}

export class TeamInviteNotFoundError extends NotFoundError {
  readonly code = "TEAM_INVITE_NOT_FOUND";

  constructor(identifier: string) {
    super("Team invite not found", { identifier });
  }
}

export class TeamInviteExpiredError extends BusinessRuleError {
  readonly code = "TEAM_INVITE_EXPIRED";

  constructor(inviteId: string) {
    super("Team invite has expired", { inviteId });
  }
}

export class TeamInviteAlreadyAcceptedError extends BusinessRuleError {
  readonly code = "TEAM_INVITE_ALREADY_ACCEPTED";

  constructor(inviteId: string) {
    super("Team invite has already been accepted", { inviteId });
  }
}

export class InvalidRoleTemplateError extends ValidationError {
  readonly code = "INVALID_ROLE_TEMPLATE";

  constructor(roleTemplate: string, scopeType: string) {
    super(
      `Role template "${roleTemplate}" is not valid for scope type "${scopeType}"`,
      { roleTemplate, scopeType },
    );
  }
}
