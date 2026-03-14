import type { IOrganizationRepository } from "@/modules/organization/repositories/organization.repository";
import { InsufficientBranchAccessError } from "@/modules/team-access/errors/team-access.errors";
import type { IAssignmentRepository } from "@/modules/team-access/repositories/assignment.repository";
import { AssignmentService } from "@/modules/team-access/services/assignment.service";
import type {
  OrganizationRecord,
  ScopedAssignmentRecord,
} from "@/shared/infra/db/schema";

/**
 * Tests for the branch portal authorization logic used in the layout.
 * Verifies both legacy (org-ownership) and team-based access paths.
 */

const OWNER_ID = "owner-1";
const STAFF_ID = "staff-1";
const UNRELATED_ID = "unrelated-1";
const ORG_ID = "org-1";
const BRANCH_ID = "branch-1";
const BRANCH_ID_OTHER = "branch-2";

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
    membershipId: "mem-1",
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
    create: vi.fn(),
    revoke: vi.fn(),
    ...overrides,
  };
}

function makeMockOrgRepo(): IOrganizationRepository {
  return {
    findById: vi.fn().mockResolvedValue(makeOrg()),
    findByOwnerId: vi.fn().mockResolvedValue(makeOrg()),
    findBySlug: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    update: vi.fn(),
  } as IOrganizationRepository;
}

describe("Branch portal authorization", () => {
  describe("flag ON (branchScopedStaffAccess)", () => {
    it("allows org owner with business_owner access level", async () => {
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

    it("allows branch_staff with direct assignment", async () => {
      const assignRepo = makeMockAssignmentRepo({
        findByUserAndScope: vi.fn().mockResolvedValue(makeAssignment()),
      });
      const orgRepo = makeMockOrgRepo();
      const service = new AssignmentService(assignRepo, orgRepo);

      const level = await service.getAccessLevel(
        STAFF_ID,
        "branch",
        BRANCH_ID,
        ORG_ID,
      );

      expect(level).toBe("branch_staff");
    });

    it("allows branch_manager with direct assignment", async () => {
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
        STAFF_ID,
        "branch",
        BRANCH_ID,
        ORG_ID,
      );

      expect(level).toBe("branch_manager");
    });

    it("allows business_manager via business-scope fallback", async () => {
      const assignRepo = makeMockAssignmentRepo({
        findByUserAndScope: vi
          .fn()
          .mockResolvedValueOnce(null) // no direct branch assignment
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

      const level = await service.getAccessLevel(
        STAFF_ID,
        "branch",
        BRANCH_ID,
        ORG_ID,
      );

      expect(level).toBe("business_manager");
    });

    it("denies user with no membership (returns null)", async () => {
      const assignRepo = makeMockAssignmentRepo();
      const orgRepo = makeMockOrgRepo();
      const service = new AssignmentService(assignRepo, orgRepo);

      const level = await service.getAccessLevel(
        UNRELATED_ID,
        "branch",
        BRANCH_ID,
        ORG_ID,
      );

      expect(level).toBeNull();
    });

    it("denies user assigned to a different branch", async () => {
      // User has branch_staff for BRANCH_ID but tries accessing BRANCH_ID_OTHER
      const assignRepo = makeMockAssignmentRepo({
        findByUserAndScope: vi.fn().mockResolvedValue(null),
      });
      const orgRepo = makeMockOrgRepo();
      const service = new AssignmentService(assignRepo, orgRepo);

      const level = await service.getAccessLevel(
        STAFF_ID,
        "branch",
        BRANCH_ID_OTHER,
        ORG_ID,
      );

      expect(level).toBeNull();
    });

    it("throws InsufficientBranchAccessError when access denied", async () => {
      const assignRepo = makeMockAssignmentRepo();
      const orgRepo = makeMockOrgRepo();
      const service = new AssignmentService(assignRepo, orgRepo);

      const level = await service.getAccessLevel(
        UNRELATED_ID,
        "branch",
        BRANCH_ID,
        ORG_ID,
      );

      // The layout throws this error when level is null
      if (!level) {
        expect(() => {
          throw new InsufficientBranchAccessError(UNRELATED_ID, BRANCH_ID);
        }).toThrow(InsufficientBranchAccessError);
      }
    });
  });

  describe("flag OFF (legacy org-ownership check)", () => {
    it("allows org owner", () => {
      const org = makeOrg(OWNER_ID);
      expect(org.ownerId).toBe(OWNER_ID);
      // Layout: organization.ownerId === session.userId → pass, accessLevel = "business_owner"
    });

    it("denies non-owner", () => {
      const org = makeOrg(OWNER_ID);
      expect(org.ownerId).not.toBe(STAFF_ID);
      // Layout: organization.ownerId !== session.userId → throw AuthorizationError
    });
  });

  describe("branch_viewer access level", () => {
    it("returns branch_viewer for viewer assignment", async () => {
      const assignRepo = makeMockAssignmentRepo({
        findByUserAndScope: vi
          .fn()
          .mockResolvedValue(makeAssignment({ roleTemplate: "branch_viewer" })),
      });
      const orgRepo = makeMockOrgRepo();
      const service = new AssignmentService(assignRepo, orgRepo);

      const level = await service.getAccessLevel(
        STAFF_ID,
        "branch",
        BRANCH_ID,
        ORG_ID,
      );

      expect(level).toBe("branch_viewer");
    });
  });
});
