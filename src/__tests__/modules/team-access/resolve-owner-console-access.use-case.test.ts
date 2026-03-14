import type { IOrganizationRepository } from "@/modules/organization/repositories/organization.repository";
import type { IAssignmentService } from "@/modules/team-access/services/assignment.service";
import { ResolveOwnerConsoleAccessUseCase } from "@/modules/team-access/use-cases/resolve-owner-console-access.use-case";
import type {
  OrganizationRecord,
  ScopedAssignmentRecord,
} from "@/shared/infra/db/schema";
import { AuthorizationError } from "@/shared/kernel/errors";

const OWNER_ID = "owner-1";
const USER_ID = "user-1";
const ORG_ID = "org-1";
const ORG_ID_2 = "org-2";

function makeOrganization(
  overrides: Partial<OrganizationRecord> = {},
): OrganizationRecord {
  return {
    id: ORG_ID,
    ownerId: OWNER_ID,
    name: "Test Org",
    slug: "test-org",
    description: null,
    logoUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeAssignment(
  overrides: Partial<ScopedAssignmentRecord> = {},
): ScopedAssignmentRecord {
  return {
    id: "assign-1",
    membershipId: "membership-1",
    roleTemplate: "business_manager",
    scopeType: "business",
    scopeId: ORG_ID,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeOrganizationRepository(
  overrides: Partial<IOrganizationRepository> = {},
): IOrganizationRepository {
  return {
    findById: vi.fn().mockImplementation(async (id: string) => {
      if (id === ORG_ID) {
        return makeOrganization();
      }

      if (id === ORG_ID_2) {
        return makeOrganization({
          id: ORG_ID_2,
          ownerId: "owner-2",
          slug: "test-org-2",
        });
      }

      return null;
    }),
    findByOwnerId: vi.fn().mockResolvedValue(null),
    findBySlug: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    update: vi.fn(),
    ...overrides,
  };
}

function makeAssignmentService(
  overrides: Partial<IAssignmentService> = {},
): IAssignmentService {
  return {
    create: vi.fn(),
    revoke: vi.fn(),
    hasAccess: vi.fn(),
    getAccessLevel: vi.fn().mockResolvedValue(null),
    findActiveByUser: vi.fn().mockResolvedValue([]),
    ...overrides,
  } as IAssignmentService;
}

describe("ResolveOwnerConsoleAccessUseCase", () => {
  it("prefers the owned organization and returns business_owner access", async () => {
    const organizationRepository = makeOrganizationRepository({
      findByOwnerId: vi.fn().mockResolvedValue(makeOrganization()),
    });
    const assignmentService = makeAssignmentService();
    const useCase = new ResolveOwnerConsoleAccessUseCase(
      organizationRepository,
      assignmentService,
    );

    const result = await useCase.execute({ userId: OWNER_ID });

    expect(result).toMatchObject({
      accessLevel: "business_owner",
      organization: { id: ORG_ID },
    });
    expect(assignmentService.findActiveByUser).not.toHaveBeenCalled();
  });

  it("returns a business-scoped assignment when the user is not the owner", async () => {
    const organizationRepository = makeOrganizationRepository();
    const assignmentService = makeAssignmentService({
      findActiveByUser: vi
        .fn()
        .mockResolvedValue([
          makeAssignment({ roleTemplate: "business_viewer" }),
        ]),
      getAccessLevel: vi.fn().mockResolvedValue("business_viewer"),
    });
    const useCase = new ResolveOwnerConsoleAccessUseCase(
      organizationRepository,
      assignmentService,
    );

    const result = await useCase.execute({ userId: USER_ID });

    expect(result).toMatchObject({
      accessLevel: "business_viewer",
      organization: { id: ORG_ID },
    });
  });

  it("returns null when the user only has branch-scoped assignments", async () => {
    const organizationRepository = makeOrganizationRepository();
    const assignmentService = makeAssignmentService({
      findActiveByUser: vi.fn().mockResolvedValue([
        makeAssignment({
          roleTemplate: "branch_manager",
          scopeType: "branch",
          scopeId: "branch-1",
        }),
      ]),
    });
    const useCase = new ResolveOwnerConsoleAccessUseCase(
      organizationRepository,
      assignmentService,
    );

    await expect(useCase.execute({ userId: USER_ID })).resolves.toBeNull();
  });

  it("fails closed when the user has business access to multiple organizations", async () => {
    const organizationRepository = makeOrganizationRepository();
    const assignmentService = makeAssignmentService({
      findActiveByUser: vi
        .fn()
        .mockResolvedValue([
          makeAssignment({ scopeId: ORG_ID }),
          makeAssignment({ id: "assign-2", scopeId: ORG_ID_2 }),
        ]),
    });
    const useCase = new ResolveOwnerConsoleAccessUseCase(
      organizationRepository,
      assignmentService,
    );

    await expect(useCase.execute({ userId: USER_ID })).rejects.toThrow(
      AuthorizationError,
    );
  });

  it("resolves a specific organization only when the user has business access to it", async () => {
    const organizationRepository = makeOrganizationRepository();
    const assignmentService = makeAssignmentService({
      getAccessLevel: vi
        .fn()
        .mockResolvedValueOnce("business_manager")
        .mockResolvedValueOnce(null),
    });
    const useCase = new ResolveOwnerConsoleAccessUseCase(
      organizationRepository,
      assignmentService,
    );

    const allowed = await useCase.execute({
      userId: USER_ID,
      organizationId: ORG_ID,
    });
    const denied = await useCase.execute({
      userId: USER_ID,
      organizationId: ORG_ID_2,
    });

    expect(allowed).toMatchObject({
      accessLevel: "business_manager",
      organization: { id: ORG_ID },
    });
    expect(denied).toBeNull();
  });
});
