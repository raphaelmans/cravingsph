import {
  TeamInviteAlreadyAcceptedError,
  TeamInviteExpiredError,
  TeamInviteNotFoundError,
  TeamInviteNotPendingError,
} from "@/modules/team-access/errors/team-access.errors";
import type { ITeamInviteRepository } from "@/modules/team-access/repositories/team-invite.repository";
import type { IAssignmentService } from "@/modules/team-access/services/assignment.service";
import type { IMembershipService } from "@/modules/team-access/services/membership.service";
import { AcceptInviteUseCase } from "@/modules/team-access/use-cases/accept-invite.use-case";
import type {
  ScopedAssignmentRecord,
  TeamInviteRecord,
  TeamMembershipRecord,
} from "@/shared/infra/db/schema";
import type { TransactionManager } from "@/shared/kernel/transaction";

const ORG_ID = "org-1";
const BRANCH_ID = "branch-1";
const USER_ID = "user-acceptor";
const INVITE_ID = "invite-1";

function makeInviteRecord(
  overrides: Partial<TeamInviteRecord> = {},
): TeamInviteRecord {
  return {
    id: INVITE_ID,
    organizationId: ORG_ID,
    invitedBy: "user-owner",
    email: "staff@example.com",
    token: "abc123",
    roleTemplate: "branch_staff",
    scopeType: "branch",
    scopeId: BRANCH_ID,
    status: "pending",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    ...overrides,
  } as TeamInviteRecord;
}

function makeMembership(
  overrides: Partial<TeamMembershipRecord> = {},
): TeamMembershipRecord {
  return {
    id: "mem-1",
    userId: USER_ID,
    organizationId: ORG_ID,
    status: "active",
    joinedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as TeamMembershipRecord;
}

function makeAssignment(
  overrides: Partial<ScopedAssignmentRecord> = {},
): ScopedAssignmentRecord {
  return {
    id: "assign-1",
    membershipId: "mem-1",
    roleTemplate: "branch_staff",
    scopeType: "branch",
    scopeId: BRANCH_ID,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as ScopedAssignmentRecord;
}

function makeMockInviteRepo(
  overrides: Partial<ITeamInviteRepository> = {},
): ITeamInviteRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByToken: vi.fn().mockResolvedValue(null),
    findByOrg: vi.fn().mockResolvedValue([]),
    findByOrgAndStatus: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    updateStatus: vi.fn().mockImplementation(async (id, status) => ({
      id,
      status,
    })),
    ...overrides,
  };
}

function makeMockMembershipService(
  overrides: Partial<IMembershipService> = {},
): IMembershipService {
  return {
    create: vi.fn().mockResolvedValue(makeMembership()),
    revoke: vi.fn(),
    findByUserAndOrg: vi.fn().mockResolvedValue(null),
    findByOrg: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

function makeMockAssignmentService(
  overrides: Partial<IAssignmentService> = {},
): IAssignmentService {
  return {
    create: vi.fn().mockResolvedValue(makeAssignment()),
    revoke: vi.fn(),
    hasAccess: vi.fn().mockResolvedValue(false),
    getAccessLevel: vi.fn().mockResolvedValue(null),
    findActiveByUser: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

/** A transaction manager that just runs the callback immediately */
function makeMockTransactionManager(): TransactionManager {
  return {
    run: vi.fn().mockImplementation(async (fn) => fn({})),
  };
}

describe("AcceptInviteUseCase", () => {
  it("creates membership, assignment, and marks invite accepted", async () => {
    const invite = makeInviteRecord();
    const inviteRepo = makeMockInviteRepo({
      findById: vi.fn().mockResolvedValue(invite),
    });
    const membershipService = makeMockMembershipService();
    const assignmentService = makeMockAssignmentService();
    const txManager = makeMockTransactionManager();

    const useCase = new AcceptInviteUseCase(
      inviteRepo,
      membershipService,
      assignmentService,
      txManager,
    );

    const result = await useCase.execute(INVITE_ID, USER_ID);

    // Verify membership was created
    expect(membershipService.findByUserAndOrg).toHaveBeenCalledWith(
      USER_ID,
      ORG_ID,
      expect.any(Object),
    );
    expect(membershipService.create).toHaveBeenCalledWith(
      { userId: USER_ID, organizationId: ORG_ID },
      expect.any(Object),
    );

    // Verify assignment was created
    expect(assignmentService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        membershipId: "mem-1",
        roleTemplate: "branch_staff",
        scopeType: "branch",
        scopeId: BRANCH_ID,
      }),
      expect.any(Object),
    );

    // Verify invite was marked accepted
    expect(inviteRepo.updateStatus).toHaveBeenCalledWith(
      INVITE_ID,
      "accepted",
      expect.any(Object),
    );

    // Verify result shape
    expect(result.membership.id).toBe("mem-1");
    expect(result.assignment.id).toBe("assign-1");
  });

  it("reuses existing membership if user already has one", async () => {
    const invite = makeInviteRecord();
    const existingMembership = makeMembership({ id: "mem-existing" });
    const inviteRepo = makeMockInviteRepo({
      findById: vi.fn().mockResolvedValue(invite),
    });
    const membershipService = makeMockMembershipService({
      findByUserAndOrg: vi.fn().mockResolvedValue(existingMembership),
    });
    const assignmentService = makeMockAssignmentService();
    const txManager = makeMockTransactionManager();

    const useCase = new AcceptInviteUseCase(
      inviteRepo,
      membershipService,
      assignmentService,
      txManager,
    );

    const result = await useCase.execute(INVITE_ID, USER_ID);

    // Should NOT create a new membership
    expect(membershipService.create).not.toHaveBeenCalled();

    // Should create assignment with existing membership ID
    expect(assignmentService.create).toHaveBeenCalledWith(
      expect.objectContaining({ membershipId: "mem-existing" }),
      expect.any(Object),
    );

    expect(result.membership.id).toBe("mem-existing");
  });

  it("runs everything in a transaction", async () => {
    const invite = makeInviteRecord();
    const inviteRepo = makeMockInviteRepo({
      findById: vi.fn().mockResolvedValue(invite),
    });
    const txManager = makeMockTransactionManager();

    const useCase = new AcceptInviteUseCase(
      inviteRepo,
      makeMockMembershipService(),
      makeMockAssignmentService(),
      txManager,
    );

    await useCase.execute(INVITE_ID, USER_ID);

    expect(txManager.run).toHaveBeenCalledTimes(1);
  });

  it("throws TeamInviteNotFoundError for unknown invite", async () => {
    const useCase = new AcceptInviteUseCase(
      makeMockInviteRepo(),
      makeMockMembershipService(),
      makeMockAssignmentService(),
      makeMockTransactionManager(),
    );

    await expect(useCase.execute("unknown", USER_ID)).rejects.toThrow(
      TeamInviteNotFoundError,
    );
  });

  it("throws TeamInviteAlreadyAcceptedError for accepted invite", async () => {
    const invite = makeInviteRecord({ status: "accepted" });
    const inviteRepo = makeMockInviteRepo({
      findById: vi.fn().mockResolvedValue(invite),
    });

    const useCase = new AcceptInviteUseCase(
      inviteRepo,
      makeMockMembershipService(),
      makeMockAssignmentService(),
      makeMockTransactionManager(),
    );

    await expect(useCase.execute(INVITE_ID, USER_ID)).rejects.toThrow(
      TeamInviteAlreadyAcceptedError,
    );
  });

  it("throws TeamInviteNotPendingError for revoked invite", async () => {
    const invite = makeInviteRecord({ status: "revoked" });
    const inviteRepo = makeMockInviteRepo({
      findById: vi.fn().mockResolvedValue(invite),
    });

    const useCase = new AcceptInviteUseCase(
      inviteRepo,
      makeMockMembershipService(),
      makeMockAssignmentService(),
      makeMockTransactionManager(),
    );

    await expect(useCase.execute(INVITE_ID, USER_ID)).rejects.toThrow(
      TeamInviteNotPendingError,
    );
  });

  it("throws TeamInviteExpiredError for expired invite", async () => {
    const invite = makeInviteRecord({
      expiresAt: new Date(Date.now() - 1000),
    });
    const inviteRepo = makeMockInviteRepo({
      findById: vi.fn().mockResolvedValue(invite),
    });

    const useCase = new AcceptInviteUseCase(
      inviteRepo,
      makeMockMembershipService(),
      makeMockAssignmentService(),
      makeMockTransactionManager(),
    );

    await expect(useCase.execute(INVITE_ID, USER_ID)).rejects.toThrow(
      TeamInviteExpiredError,
    );
  });
});
