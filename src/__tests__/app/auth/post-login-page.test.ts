import { appRoutes } from "@/common/app-routes";

const mockRedirect = vi.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});

const mockGetServerSession = vi.fn();
const mockOrganizationRepository = {
  findByOwnerId: vi.fn(),
};
const mockAssignmentService = {
  findActiveByUser: vi.fn(),
};
const mockBranchRepository = {
  findById: vi.fn(),
};

vi.mock("next/navigation", () => ({
  redirect: (path: string) => mockRedirect(path),
}));

vi.mock("@/shared/infra/supabase/session", () => ({
  getServerSession: () => mockGetServerSession(),
}));

vi.mock("@/modules/organization/factories/organization.factory", () => ({
  makeOrganizationRepository: () => mockOrganizationRepository,
}));

vi.mock("@/modules/team-access/factories/team-access.factory", () => ({
  makeAssignmentService: () => mockAssignmentService,
}));

vi.mock("@/modules/branch/factories/branch.factory", () => ({
  makeBranchRepository: () => mockBranchRepository,
}));

const { mockFlags } = vi.hoisted(() => ({
  mockFlags: {
    branchOpsPortal: true,
  },
}));

vi.mock("@/shared/infra/feature-flags", () => ({
  flags: mockFlags,
}));

import PostLoginPage from "@/app/(auth)/post-login/page";

describe("PostLoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFlags.branchOpsPortal = true;
    mockGetServerSession.mockResolvedValue({
      userId: "staff-1",
      email: "staff@example.com",
      role: "member",
      portalPreference: "customer",
    });
    mockOrganizationRepository.findByOwnerId.mockResolvedValue(null);
    mockAssignmentService.findActiveByUser.mockResolvedValue([
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
    ]);
    mockBranchRepository.findById.mockResolvedValue({
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
    });
  });

  it("honors an explicit safe redirect query before smart routing", async () => {
    await expect(
      PostLoginPage({
        searchParams: Promise.resolve({
          redirect: appRoutes.orders.base,
        }),
      }),
    ).rejects.toThrow(`NEXT_REDIRECT:${appRoutes.orders.base}`);

    expect(mockOrganizationRepository.findByOwnerId).not.toHaveBeenCalled();
    expect(mockAssignmentService.findActiveByUser).not.toHaveBeenCalled();
  });

  it("routes a single-branch staff user to their branch portal when no explicit redirect is present", async () => {
    await expect(
      PostLoginPage({
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow(
      `NEXT_REDIRECT:${appRoutes.branchPortal.byPortalSlug("jollibee-makati")}`,
    );
  });

  it("redirects unauthenticated users back to login", async () => {
    mockGetServerSession.mockResolvedValue(null);

    await expect(
      PostLoginPage({
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow(`NEXT_REDIRECT:${appRoutes.login.base}`);
  });
});
