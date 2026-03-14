import type { Context } from "@/shared/infra/trpc/context";

const mockResolveOwnerConsoleAccess = vi.fn();
const mockOrganizationUpdate = vi.fn();

vi.mock("@/modules/team-access/factories/team-access.factory", () => ({
  makeResolveOwnerConsoleAccessUseCase: () => ({
    execute: mockResolveOwnerConsoleAccess,
  }),
}));

vi.mock("@/modules/organization/factories/organization.factory", () => ({
  makeOrganizationService: () => ({
    getByOwnerId: vi.fn(),
    create: vi.fn(),
    update: mockOrganizationUpdate,
  }),
}));

import { TRPCError } from "@trpc/server";
import { organizationRouter } from "@/modules/organization/organization.router";

const ORGANIZATION = {
  id: "org-1",
  ownerId: "owner-1",
  name: "Test Org",
  slug: "test-org",
  description: null,
  logoUrl: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeContext(overrides: Partial<Context> = {}): Context {
  return {
    requestId: "req-1",
    session: {
      userId: "user-1",
      email: "user@example.com",
      role: "member",
      portalPreference: "owner",
    },
    userId: "user-1",
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
    origin: "http://localhost:3443",
    log: {
      level: "info",
      fatal: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
      trace: vi.fn(),
      silent: vi.fn(),
      msgPrefix: "",
    } as unknown as Context["log"],
    ...overrides,
  };
}

describe("organizationRouter", () => {
  beforeEach(() => {
    mockResolveOwnerConsoleAccess.mockReset();
    mockOrganizationUpdate.mockReset();
  });

  it("returns the scoped organization for business-scoped owner-console users", async () => {
    mockResolveOwnerConsoleAccess.mockResolvedValue({
      organization: ORGANIZATION,
      accessLevel: "business_manager",
    });

    const caller = organizationRouter.createCaller(makeContext());

    await expect(caller.mine()).resolves.toEqual(ORGANIZATION);
  });

  it("rejects organization updates for non-owner business roles", async () => {
    mockResolveOwnerConsoleAccess.mockResolvedValue({
      organization: ORGANIZATION,
      accessLevel: "business_manager",
    });

    const caller = organizationRouter.createCaller(makeContext());

    await expect(
      caller.update({
        name: "Updated Org",
        description: "Updated description",
      }),
    ).rejects.toThrow(TRPCError);
    expect(mockOrganizationUpdate).not.toHaveBeenCalled();
  });

  it("allows organization updates for business_owner access", async () => {
    mockResolveOwnerConsoleAccess.mockResolvedValue({
      organization: ORGANIZATION,
      accessLevel: "business_owner",
    });
    mockOrganizationUpdate.mockResolvedValue({
      ...ORGANIZATION,
      name: "Updated Org",
    });

    const caller = organizationRouter.createCaller(makeContext());

    await expect(
      caller.update({
        name: "Updated Org",
        description: "Updated description",
      }),
    ).resolves.toMatchObject({
      id: ORGANIZATION.id,
      name: "Updated Org",
    });

    expect(mockOrganizationUpdate).toHaveBeenCalledWith(ORGANIZATION.id, {
      name: "Updated Org",
      description: "Updated description",
    });
  });
});
