import { appRoutes } from "@/common/app-routes";
import type { IBranchRepository } from "@/modules/branch/repositories/branch.repository";
import type { IOrganizationRepository } from "@/modules/organization/repositories/organization.repository";
import type { IAssignmentService } from "@/modules/team-access/services/assignment.service";
import type { BranchRecord } from "@/shared/infra/db/schema";

const { mockFlags } = vi.hoisted(() => ({
  mockFlags: {
    branchOpsPortal: true,
  },
}));

vi.mock("@/shared/infra/feature-flags", () => ({
  flags: mockFlags,
}));

import { SmartRedirectUseCase } from "@/modules/branch/use-cases/smart-redirect.use-case";

function makeBranchRecord(overrides: Partial<BranchRecord> = {}): BranchRecord {
  return {
    id: "branch-1",
    restaurantId: "restaurant-1",
    name: "Makati Branch",
    slug: "makati",
    portalSlug: "jollibee-makati",
    address: null,
    street: null,
    barangay: null,
    province: null,
    city: "Makati",
    phone: null,
    coverUrl: null,
    isOrderingEnabled: true,
    autoAcceptOrders: false,
    paymentCountdownMinutes: 15,
    latitude: null,
    longitude: null,
    amenities: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeOrganizationRepository({
  hasOwnedOrganization = false,
}: {
  hasOwnedOrganization?: boolean;
} = {}): IOrganizationRepository {
  return {
    findById: vi.fn(),
    findByOwnerId: vi.fn().mockResolvedValue(
      hasOwnedOrganization
        ? {
            id: "org-1",
            ownerId: "user-1",
            name: "Test Org",
            slug: "test-org",
            description: null,
            logoUrl: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        : null,
    ),
    findBySlug: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
}

function makeAssignmentService(
  assignments: Awaited<ReturnType<IAssignmentService["findActiveByUser"]>> = [],
): IAssignmentService {
  return {
    create: vi.fn(),
    revoke: vi.fn(),
    hasAccess: vi.fn(),
    getAccessLevel: vi.fn(),
    findActiveByUser: vi.fn().mockResolvedValue(assignments),
  };
}

function makeBranchRepository(
  branch: BranchRecord | null = makeBranchRecord(),
): IBranchRepository {
  return {
    findById: vi.fn().mockResolvedValue(branch),
    findBySlug: vi.fn(),
    findByPortalSlug: vi.fn(),
    findByRestaurantId: vi.fn(),
    findAccessibleByOwner: vi.fn(),
    findAccessibleByOrganizationId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findOperatingHours: vi.fn(),
    upsertOperatingHours: vi.fn(),
    findActiveTablesWithSessions: vi.fn(),
  };
}

describe("SmartRedirectUseCase", () => {
  beforeEach(() => {
    mockFlags.branchOpsPortal = true;
  });

  it("keeps org owners on the owner console", async () => {
    const useCase = new SmartRedirectUseCase(
      makeOrganizationRepository({ hasOwnedOrganization: true }),
      makeAssignmentService(),
      makeBranchRepository(),
    );

    await expect(
      useCase.execute({
        userId: "owner-1",
        portalPreference: "owner",
      }),
    ).resolves.toBe(appRoutes.organization.base);
  });

  it("routes a single branch assignee directly to the branch portal", async () => {
    const useCase = new SmartRedirectUseCase(
      makeOrganizationRepository(),
      makeAssignmentService([
        {
          id: "assign-1",
          membershipId: "mem-1",
          roleTemplate: "branch_staff",
          scopeType: "branch",
          scopeId: "branch-1",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
      makeBranchRepository(),
    );

    await expect(
      useCase.execute({
        userId: "staff-1",
        portalPreference: "customer",
      }),
    ).resolves.toBe(appRoutes.branchPortal.byPortalSlug("jollibee-makati"));
  });

  it("falls back to legacy behavior for business-scoped assignees", async () => {
    const useCase = new SmartRedirectUseCase(
      makeOrganizationRepository(),
      makeAssignmentService([
        {
          id: "assign-1",
          membershipId: "mem-1",
          roleTemplate: "business_manager",
          scopeType: "business",
          scopeId: "org-1",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
      makeBranchRepository(),
    );

    await expect(
      useCase.execute({
        userId: "manager-1",
        portalPreference: "customer",
      }),
    ).resolves.toBe(appRoutes.index.base);
  });

  it("preserves legacy owner onboarding behavior when the portal flag is off", async () => {
    mockFlags.branchOpsPortal = false;

    const useCase = new SmartRedirectUseCase(
      makeOrganizationRepository(),
      makeAssignmentService([
        {
          id: "assign-1",
          membershipId: "mem-1",
          roleTemplate: "branch_staff",
          scopeType: "branch",
          scopeId: "branch-1",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
      makeBranchRepository(),
    );

    await expect(
      useCase.execute({
        userId: "pending-owner-1",
        portalPreference: "owner",
      }),
    ).resolves.toBe(appRoutes.organization.getStarted);
  });
});
