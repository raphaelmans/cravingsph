import type { IBranchRepository } from "@/modules/branch/repositories/branch.repository";
import type { IRestaurantRepository } from "@/modules/restaurant/repositories/restaurant.repository";
import {
  InvalidRoleTemplateError,
  ScopeNotInOrganizationError,
  TeamInviteAlreadyAcceptedError,
  TeamInviteExpiredError,
  TeamInviteNotFoundError,
  TeamInviteNotPendingError,
} from "@/modules/team-access/errors/team-access.errors";
import type { ITeamInviteRepository } from "@/modules/team-access/repositories/team-invite.repository";
import { InviteService } from "@/modules/team-access/services/invite.service";
import type {
  BranchRecord,
  RestaurantRecord,
  TeamInviteRecord,
} from "@/shared/infra/db/schema";

const ORG_ID = "org-1";
const BRANCH_ID = "branch-1";
const RESTAURANT_ID = "restaurant-1";
const INVITER_ID = "user-owner";

function makeInviteRecord(
  overrides: Partial<TeamInviteRecord> = {},
): TeamInviteRecord {
  return {
    id: "invite-1",
    organizationId: ORG_ID,
    invitedBy: INVITER_ID,
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

function makeMockInviteRepo(
  overrides: Partial<ITeamInviteRepository> = {},
): ITeamInviteRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByToken: vi.fn().mockResolvedValue(null),
    findByOrg: vi.fn().mockResolvedValue([]),
    findByOrgAndStatus: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async (data) => ({
      id: "invite-new",
      ...data,
      createdAt: new Date(),
    })),
    updateStatus: vi.fn().mockImplementation(async (id, status) => ({
      id,
      status,
    })),
    ...overrides,
  };
}

function makeMockRestaurantRepo(
  overrides: Partial<IRestaurantRepository> = {},
): IRestaurantRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findBySlug: vi.fn().mockResolvedValue(null),
    findByOrganizationId: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    ...overrides,
  } as IRestaurantRepository;
}

function makeMockBranchRepo(
  overrides: Partial<IBranchRepository> = {},
): IBranchRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findBySlug: vi.fn().mockResolvedValue(null),
    findByPortalSlug: vi.fn().mockResolvedValue(null),
    findByRestaurantId: vi.fn().mockResolvedValue([]),
    findAccessibleByOwner: vi.fn().mockResolvedValue([]),
    findAccessibleByOrganizationId: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    findOperatingHours: vi.fn().mockResolvedValue([]),
    upsertOperatingHours: vi.fn(),
    ...overrides,
  } as unknown as IBranchRepository;
}

function makeService(
  deps: {
    inviteRepo?: ITeamInviteRepository;
    restaurantRepo?: IRestaurantRepository;
    branchRepo?: IBranchRepository;
  } = {},
) {
  return new InviteService(
    deps.inviteRepo ?? makeMockInviteRepo(),
    deps.restaurantRepo ?? makeMockRestaurantRepo(),
    deps.branchRepo ?? makeMockBranchRepo(),
  );
}

describe("InviteService", () => {
  describe("create", () => {
    it("creates an invite for a valid business scope", async () => {
      const inviteRepo = makeMockInviteRepo();
      const service = makeService({ inviteRepo });

      const result = await service.create(
        {
          organizationId: ORG_ID,
          email: "manager@example.com",
          roleTemplate: "business_manager",
          scopeType: "business",
          scopeId: ORG_ID,
        },
        INVITER_ID,
      );

      expect(inviteRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: ORG_ID,
          email: "manager@example.com",
          roleTemplate: "business_manager",
          scopeType: "business",
          scopeId: ORG_ID,
          status: "pending",
          invitedBy: INVITER_ID,
        }),
        undefined,
      );
      expect(result.id).toBe("invite-new");
    });

    it("creates an invite for a valid branch scope", async () => {
      const branchRepo = makeMockBranchRepo({
        findById: vi.fn().mockResolvedValue({
          id: BRANCH_ID,
          restaurantId: RESTAURANT_ID,
        } as BranchRecord),
      });
      const restaurantRepo = makeMockRestaurantRepo({
        findById: vi.fn().mockResolvedValue({
          id: RESTAURANT_ID,
          organizationId: ORG_ID,
        } as RestaurantRecord),
      });
      const inviteRepo = makeMockInviteRepo();

      const service = makeService({ inviteRepo, branchRepo, restaurantRepo });

      await service.create(
        {
          organizationId: ORG_ID,
          email: "staff@example.com",
          roleTemplate: "branch_staff",
          scopeType: "branch",
          scopeId: BRANCH_ID,
        },
        INVITER_ID,
      );

      expect(inviteRepo.create).toHaveBeenCalled();
    });

    it("generates a cryptographic token (64 hex chars)", async () => {
      const inviteRepo = makeMockInviteRepo();
      const service = makeService({ inviteRepo });

      await service.create(
        {
          organizationId: ORG_ID,
          email: "test@example.com",
          roleTemplate: "business_viewer",
          scopeType: "business",
          scopeId: ORG_ID,
        },
        INVITER_ID,
      );

      const callArgs = (inviteRepo.create as ReturnType<typeof vi.fn>).mock
        .calls[0][0];
      expect(callArgs.token).toMatch(/^[0-9a-f]{64}$/);
    });

    it("sets 7-day expiry", async () => {
      const inviteRepo = makeMockInviteRepo();
      const service = makeService({ inviteRepo });

      const before = Date.now();
      await service.create(
        {
          organizationId: ORG_ID,
          email: "test@example.com",
          roleTemplate: "business_viewer",
          scopeType: "business",
          scopeId: ORG_ID,
        },
        INVITER_ID,
      );

      const callArgs = (inviteRepo.create as ReturnType<typeof vi.fn>).mock
        .calls[0][0];
      const expiresAt = callArgs.expiresAt.getTime();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      expect(expiresAt).toBeGreaterThanOrEqual(before + sevenDays - 1000);
      expect(expiresAt).toBeLessThanOrEqual(before + sevenDays + 1000);
    });

    it("throws InvalidRoleTemplateError for mismatched role/scope", async () => {
      const service = makeService();

      await expect(
        service.create(
          {
            organizationId: ORG_ID,
            email: "test@example.com",
            roleTemplate: "branch_staff",
            scopeType: "business",
            scopeId: ORG_ID,
          },
          INVITER_ID,
        ),
      ).rejects.toThrow(InvalidRoleTemplateError);
    });

    it("throws ScopeNotInOrganizationError for business scope with wrong id", async () => {
      const service = makeService();

      await expect(
        service.create(
          {
            organizationId: ORG_ID,
            email: "test@example.com",
            roleTemplate: "business_manager",
            scopeType: "business",
            scopeId: "wrong-org-id",
          },
          INVITER_ID,
        ),
      ).rejects.toThrow(ScopeNotInOrganizationError);
    });

    it("throws ScopeNotInOrganizationError for branch not in org", async () => {
      const branchRepo = makeMockBranchRepo({
        findById: vi.fn().mockResolvedValue({
          id: BRANCH_ID,
          restaurantId: RESTAURANT_ID,
        } as BranchRecord),
      });
      const restaurantRepo = makeMockRestaurantRepo({
        findById: vi.fn().mockResolvedValue({
          id: RESTAURANT_ID,
          organizationId: "other-org",
        } as RestaurantRecord),
      });

      const service = makeService({ branchRepo, restaurantRepo });

      await expect(
        service.create(
          {
            organizationId: ORG_ID,
            email: "test@example.com",
            roleTemplate: "branch_staff",
            scopeType: "branch",
            scopeId: BRANCH_ID,
          },
          INVITER_ID,
        ),
      ).rejects.toThrow(ScopeNotInOrganizationError);
    });

    it("throws ScopeNotInOrganizationError for non-existent branch", async () => {
      const service = makeService();

      await expect(
        service.create(
          {
            organizationId: ORG_ID,
            email: "test@example.com",
            roleTemplate: "branch_staff",
            scopeType: "branch",
            scopeId: "non-existent-branch",
          },
          INVITER_ID,
        ),
      ).rejects.toThrow(ScopeNotInOrganizationError);
    });
  });

  describe("list", () => {
    it("returns all invites for org when no status filter", async () => {
      const invites = [makeInviteRecord()];
      const inviteRepo = makeMockInviteRepo({
        findByOrg: vi.fn().mockResolvedValue(invites),
      });
      const service = makeService({ inviteRepo });

      const result = await service.list(ORG_ID);

      expect(inviteRepo.findByOrg).toHaveBeenCalledWith(ORG_ID, undefined);
      expect(result).toEqual(invites);
    });

    it("filters by status when provided", async () => {
      const invites = [makeInviteRecord()];
      const inviteRepo = makeMockInviteRepo({
        findByOrgAndStatus: vi.fn().mockResolvedValue(invites),
      });
      const service = makeService({ inviteRepo });

      const result = await service.list(ORG_ID, "pending");

      expect(inviteRepo.findByOrgAndStatus).toHaveBeenCalledWith(
        ORG_ID,
        "pending",
        undefined,
      );
      expect(result).toEqual(invites);
    });
  });

  describe("revoke", () => {
    it("revokes a pending invite", async () => {
      const invite = makeInviteRecord({ status: "pending" });
      const inviteRepo = makeMockInviteRepo({
        findById: vi.fn().mockResolvedValue(invite),
      });
      const service = makeService({ inviteRepo });

      await service.revoke("invite-1");

      expect(inviteRepo.updateStatus).toHaveBeenCalledWith(
        "invite-1",
        "revoked",
        undefined,
      );
    });

    it("throws TeamInviteNotFoundError for unknown invite", async () => {
      const service = makeService();

      await expect(service.revoke("unknown")).rejects.toThrow(
        TeamInviteNotFoundError,
      );
    });

    it("throws TeamInviteNotPendingError for accepted invite", async () => {
      const invite = makeInviteRecord({ status: "accepted" });
      const inviteRepo = makeMockInviteRepo({
        findById: vi.fn().mockResolvedValue(invite),
      });
      const service = makeService({ inviteRepo });

      await expect(service.revoke("invite-1")).rejects.toThrow(
        TeamInviteNotPendingError,
      );
    });

    it("throws TeamInviteNotPendingError for revoked invite", async () => {
      const invite = makeInviteRecord({ status: "revoked" });
      const inviteRepo = makeMockInviteRepo({
        findById: vi.fn().mockResolvedValue(invite),
      });
      const service = makeService({ inviteRepo });

      await expect(service.revoke("invite-1")).rejects.toThrow(
        TeamInviteNotPendingError,
      );
    });
  });

  describe("validate", () => {
    it("returns a valid pending invite", async () => {
      const invite = makeInviteRecord();
      const inviteRepo = makeMockInviteRepo({
        findByToken: vi.fn().mockResolvedValue(invite),
      });
      const service = makeService({ inviteRepo });

      const result = await service.validate("abc123");

      expect(result).toEqual(invite);
    });

    it("throws TeamInviteNotFoundError for unknown token", async () => {
      const service = makeService();

      await expect(service.validate("unknown-token")).rejects.toThrow(
        TeamInviteNotFoundError,
      );
    });

    it("throws TeamInviteAlreadyAcceptedError for accepted invite", async () => {
      const invite = makeInviteRecord({ status: "accepted" });
      const inviteRepo = makeMockInviteRepo({
        findByToken: vi.fn().mockResolvedValue(invite),
      });
      const service = makeService({ inviteRepo });

      await expect(service.validate("abc123")).rejects.toThrow(
        TeamInviteAlreadyAcceptedError,
      );
    });

    it("throws TeamInviteNotPendingError for revoked invite", async () => {
      const invite = makeInviteRecord({ status: "revoked" });
      const inviteRepo = makeMockInviteRepo({
        findByToken: vi.fn().mockResolvedValue(invite),
      });
      const service = makeService({ inviteRepo });

      await expect(service.validate("abc123")).rejects.toThrow(
        TeamInviteNotPendingError,
      );
    });

    it("throws TeamInviteExpiredError for expired invite", async () => {
      const invite = makeInviteRecord({
        expiresAt: new Date(Date.now() - 1000),
      });
      const inviteRepo = makeMockInviteRepo({
        findByToken: vi.fn().mockResolvedValue(invite),
      });
      const service = makeService({ inviteRepo });

      await expect(service.validate("abc123")).rejects.toThrow(
        TeamInviteExpiredError,
      );
    });
  });
});
