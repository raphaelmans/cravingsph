import type { IOrganizationRepository } from "@/modules/organization/repositories/organization.repository";
import {
  AssignmentNotFoundError,
  InvalidRoleTemplateError,
} from "@/modules/team-access/errors/team-access.errors";
import type { IAssignmentRepository } from "@/modules/team-access/repositories/assignment.repository";
import { AssignmentService } from "@/modules/team-access/services/assignment.service";
import type {
  OrganizationRecord,
  ScopedAssignmentRecord,
} from "@/shared/infra/db/schema";

const USER_ID = "user-1";
const OWNER_ID = "owner-1";
const ORG_ID = "org-1";
const BRANCH_ID = "branch-1";
const BRANCH_ID_2 = "branch-2";
const MEMBERSHIP_ID = "mem-1";

function makeOrg(ownerId = OWNER_ID): OrganizationRecord {
  return {
    id: ORG_ID,
    ownerId,
    name: "Test Org",
    slug: "test-org",
    description: null,
    logoUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function makeAssignment(
  overrides: Partial<ScopedAssignmentRecord> = {},
): ScopedAssignmentRecord {
  return {
    id: "assign-1",
    membershipId: MEMBERSHIP_ID,
    roleTemplate: "branch_staff",
    scopeType: "branch",
    scopeId: BRANCH_ID,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeMockAssignmentRepo(
  overrides: Partial<IAssignmentRepository> = {},
): IAssignmentRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByMembership: vi.fn().mockResolvedValue([]),
    findByUserAndScope: vi.fn().mockResolvedValue(null),
    findActiveByUser: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async (data) => ({
      id: "assign-new",
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    revoke: vi.fn().mockImplementation(async (id) => ({
      id,
      membershipId: MEMBERSHIP_ID,
      roleTemplate: "branch_staff",
      scopeType: "branch",
      scopeId: BRANCH_ID,
      status: "revoked",
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    ...overrides,
  };
}

function makeMockOrgRepo(
  overrides: Partial<IOrganizationRepository> = {},
): IOrganizationRepository {
  return {
    findById: vi.fn().mockResolvedValue(makeOrg()),
    findByOwnerId: vi.fn().mockResolvedValue(makeOrg()),
    findBySlug: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    update: vi.fn(),
    ...overrides,
  } as IOrganizationRepository;
}

describe("AssignmentService", () => {
  describe("create", () => {
    it("creates an assignment with valid role+scope", async () => {
      const assignRepo = makeMockAssignmentRepo();
      const orgRepo = makeMockOrgRepo();
      const service = new AssignmentService(assignRepo, orgRepo);

      const result = await service.create({
        membershipId: MEMBERSHIP_ID,
        roleTemplate: "branch_staff",
        scopeType: "branch",
        scopeId: BRANCH_ID,
      });

      expect(assignRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          membershipId: MEMBERSHIP_ID,
          roleTemplate: "branch_staff",
          scopeType: "branch",
          scopeId: BRANCH_ID,
          status: "active",
        }),
        undefined,
      );
      expect(result.id).toBe("assign-new");
    });

    it("rejects business_owner with branch scope", async () => {
      const assignRepo = makeMockAssignmentRepo();
      const orgRepo = makeMockOrgRepo();
      const service = new AssignmentService(assignRepo, orgRepo);

      await expect(
        service.create({
          membershipId: MEMBERSHIP_ID,
          roleTemplate: "business_owner",
          scopeType: "branch",
          scopeId: BRANCH_ID,
        }),
      ).rejects.toThrow(InvalidRoleTemplateError);
    });

    it("rejects branch_staff with business scope", async () => {
      const assignRepo = makeMockAssignmentRepo();
      const orgRepo = makeMockOrgRepo();
      const service = new AssignmentService(assignRepo, orgRepo);

      await expect(
        service.create({
          membershipId: MEMBERSHIP_ID,
          roleTemplate: "branch_staff",
          scopeType: "business",
          scopeId: ORG_ID,
        }),
      ).rejects.toThrow(InvalidRoleTemplateError);
    });
  });

  describe("revoke", () => {
    it("revokes an existing assignment", async () => {
      const assignRepo = makeMockAssignmentRepo({
        findById: vi.fn().mockResolvedValue(makeAssignment()),
      });
      const orgRepo = makeMockOrgRepo();
      const service = new AssignmentService(assignRepo, orgRepo);

      await service.revoke("assign-1");
      expect(assignRepo.revoke).toHaveBeenCalledWith("assign-1", undefined);
    });

    it("throws AssignmentNotFoundError for unknown id", async () => {
      const assignRepo = makeMockAssignmentRepo();
      const orgRepo = makeMockOrgRepo();
      const service = new AssignmentService(assignRepo, orgRepo);

      await expect(service.revoke("unknown")).rejects.toThrow(
        AssignmentNotFoundError,
      );
    });
  });

  describe("hasAccess", () => {
    it("returns true for org owner without any membership row", async () => {
      const assignRepo = makeMockAssignmentRepo();
      const orgRepo = makeMockOrgRepo();
      const service = new AssignmentService(assignRepo, orgRepo);

      const result = await service.hasAccess(
        OWNER_ID,
        "branch",
        BRANCH_ID,
        ORG_ID,
      );
      expect(result).toBe(true);
      // Should not even check assignments
      expect(assignRepo.findByUserAndScope).not.toHaveBeenCalled();
    });

    it("returns true for user with direct branch assignment", async () => {
      const assignRepo = makeMockAssignmentRepo({
        findByUserAndScope: vi.fn().mockResolvedValue(makeAssignment()),
      });
      const orgRepo = makeMockOrgRepo();
      const service = new AssignmentService(assignRepo, orgRepo);

      const result = await service.hasAccess(
        USER_ID,
        "branch",
        BRANCH_ID,
        ORG_ID,
      );
      expect(result).toBe(true);
    });

    it("returns true for user with business-scope assignment accessing a branch", async () => {
      const assignRepo = makeMockAssignmentRepo({
        findByUserAndScope: vi
          .fn()
          // First call: direct branch check returns null
          // Second call: business scope check returns assignment
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(
            makeAssignment({
              roleTemplate: "business_manager",
              scopeType: "business",
              scopeId: ORG_ID,
            }),
          ),
      });
      const orgRepo = makeMockOrgRepo();
      const service = new AssignmentService(assignRepo, orgRepo);

      const result = await service.hasAccess(
        USER_ID,
        "branch",
        BRANCH_ID,
        ORG_ID,
      );
      expect(result).toBe(true);
    });

    it("returns false for user with no membership", async () => {
      const assignRepo = makeMockAssignmentRepo();
      const orgRepo = makeMockOrgRepo();
      const service = new AssignmentService(assignRepo, orgRepo);

      const result = await service.hasAccess(
        USER_ID,
        "branch",
        BRANCH_ID,
        ORG_ID,
      );
      expect(result).toBe(false);
    });

    it("returns false for user assigned to different branch", async () => {
      // findByUserAndScope returns null for both: direct branch and business scope
      const assignRepo = makeMockAssignmentRepo({
        findByUserAndScope: vi.fn().mockResolvedValue(null),
      });
      const orgRepo = makeMockOrgRepo();
      const service = new AssignmentService(assignRepo, orgRepo);

      const result = await service.hasAccess(
        USER_ID,
        "branch",
        BRANCH_ID_2,
        ORG_ID,
      );
      expect(result).toBe(false);
    });
  });

  describe("getAccessLevel", () => {
    it("returns business_owner for org owner", async () => {
      const assignRepo = makeMockAssignmentRepo();
      const orgRepo = makeMockOrgRepo();
      const service = new AssignmentService(assignRepo, orgRepo);

      const level = await service.getAccessLevel(
        OWNER_ID,
        "branch",
        BRANCH_ID,
        ORG_ID,
      );
      expect(level).toBe("business_owner");
    });

    it("returns the direct assignment role template", async () => {
      const assignRepo = makeMockAssignmentRepo({
        findByUserAndScope: vi
          .fn()
          .mockResolvedValue(
            makeAssignment({ roleTemplate: "branch_manager" }),
          ),
      });
      const orgRepo = makeMockOrgRepo();
      const service = new AssignmentService(assignRepo, orgRepo);

      const level = await service.getAccessLevel(
        USER_ID,
        "branch",
        BRANCH_ID,
        ORG_ID,
      );
      expect(level).toBe("branch_manager");
    });

    it("returns null when no access", async () => {
      const assignRepo = makeMockAssignmentRepo();
      const orgRepo = makeMockOrgRepo();
      const service = new AssignmentService(assignRepo, orgRepo);

      const level = await service.getAccessLevel(
        USER_ID,
        "branch",
        BRANCH_ID,
        ORG_ID,
      );
      expect(level).toBeNull();
    });
  });
});
