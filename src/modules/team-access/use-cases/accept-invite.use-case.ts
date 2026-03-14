import type {
  ScopedAssignmentRecord,
  TeamMembershipRecord,
} from "@/shared/infra/db/schema";
import { logger } from "@/shared/infra/logger";
import type { TransactionManager } from "@/shared/kernel/transaction";
import {
  TeamInviteAlreadyAcceptedError,
  TeamInviteExpiredError,
  TeamInviteNotFoundError,
  TeamInviteNotPendingError,
} from "../errors/team-access.errors";
import type { ITeamInviteRepository } from "../repositories/team-invite.repository";
import type { IAssignmentService } from "../services/assignment.service";
import type { IMembershipService } from "../services/membership.service";

interface AcceptInviteResult {
  membership: TeamMembershipRecord;
  assignment: ScopedAssignmentRecord;
}

/**
 * AcceptInviteUseCase orchestrates the multi-service flow of accepting a team invite.
 *
 * Steps (all within a single transaction):
 * 1. Validate invite is pending and not expired
 * 2. Create or reuse existing membership for user in the org
 * 3. Create scoped assignment for the invited role/scope
 * 4. Mark invite as accepted
 */
export class AcceptInviteUseCase {
  constructor(
    private inviteRepository: ITeamInviteRepository,
    private membershipService: IMembershipService,
    private assignmentService: IAssignmentService,
    private transactionManager: TransactionManager,
  ) {}

  async execute(inviteId: string, userId: string): Promise<AcceptInviteResult> {
    // Pre-check: load invite outside transaction for fast-fail
    const invite = await this.inviteRepository.findById(inviteId);

    if (!invite) {
      throw new TeamInviteNotFoundError(inviteId);
    }

    if (invite.status === "accepted") {
      throw new TeamInviteAlreadyAcceptedError(invite.id);
    }

    if (invite.status !== "pending") {
      throw new TeamInviteNotPendingError(invite.id, invite.status);
    }

    if (invite.expiresAt && new Date() > invite.expiresAt) {
      throw new TeamInviteExpiredError(invite.id);
    }

    // Run the multi-step flow in a transaction
    const result = await this.transactionManager.run(async (tx) => {
      const ctx = { tx };

      // 1. Create membership (or reuse if user already has one in this org)
      let membership = await this.membershipService.findByUserAndOrg(
        userId,
        invite.organizationId,
        ctx,
      );

      if (!membership) {
        membership = await this.membershipService.create(
          {
            userId,
            organizationId: invite.organizationId,
          },
          ctx,
        );
      }

      // 2. Create the scoped assignment
      const assignment = await this.assignmentService.create(
        {
          membershipId: membership.id,
          roleTemplate: invite.roleTemplate as Parameters<
            typeof this.assignmentService.create
          >[0]["roleTemplate"],
          scopeType: invite.scopeType as Parameters<
            typeof this.assignmentService.create
          >[0]["scopeType"],
          scopeId: invite.scopeId,
        },
        ctx,
      );

      // 3. Mark invite as accepted
      await this.inviteRepository.updateStatus(invite.id, "accepted", ctx);

      return { membership, assignment };
    });

    logger.info(
      {
        event: "team_invite.accepted",
        inviteId: invite.id,
        userId,
        organizationId: invite.organizationId,
        membershipId: result.membership.id,
        assignmentId: result.assignment.id,
      },
      "Team invite accepted",
    );

    return result;
  }
}
