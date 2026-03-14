import {
  MembershipAlreadyExistsError,
  MembershipNotFoundError,
} from "@/modules/team-access/errors/team-access.errors";
import type { IMembershipRepository } from "@/modules/team-access/repositories/membership.repository";
import { MembershipService } from "@/modules/team-access/services/membership.service";
import type { TeamMembershipRecord } from "@/shared/infra/db/schema";

function makeMockRepo(
  overrides: Partial<IMembershipRepository> = {},
): IMembershipRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByUserAndOrg: vi.fn().mockResolvedValue(null),
    findByOrg: vi.fn().mockResolvedValue([]),
    findByUser: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async (data) => ({
      id: "mem-1",
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    updateStatus: vi.fn().mockImplementation(async (id, status) => ({
      id,
      status,
      userId: "user-1",
      organizationId: "org-1",
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    ...overrides,
  };
}

const USER_ID = "user-1";
const ORG_ID = "org-1";

describe("MembershipService", () => {
  describe("create", () => {
    it("creates a membership when none exists", async () => {
      const repo = makeMockRepo();
      const service = new MembershipService(repo);

      const result = await service.create({
        userId: USER_ID,
        organizationId: ORG_ID,
      });

      expect(repo.findByUserAndOrg).toHaveBeenCalledWith(
        USER_ID,
        ORG_ID,
        undefined,
      );
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: USER_ID,
          organizationId: ORG_ID,
          status: "active",
        }),
        undefined,
      );
      expect(result.id).toBe("mem-1");
    });

    it("throws MembershipAlreadyExistsError when duplicate", async () => {
      const existing = {
        id: "mem-existing",
        userId: USER_ID,
        organizationId: ORG_ID,
        status: "active",
        joinedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as TeamMembershipRecord;

      const repo = makeMockRepo({
        findByUserAndOrg: vi.fn().mockResolvedValue(existing),
      });
      const service = new MembershipService(repo);

      await expect(
        service.create({ userId: USER_ID, organizationId: ORG_ID }),
      ).rejects.toThrow(MembershipAlreadyExistsError);
    });
  });

  describe("revoke", () => {
    it("sets membership status to revoked", async () => {
      const existing = {
        id: "mem-1",
        userId: USER_ID,
        organizationId: ORG_ID,
        status: "active",
        joinedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as TeamMembershipRecord;

      const repo = makeMockRepo({
        findById: vi.fn().mockResolvedValue(existing),
      });
      const service = new MembershipService(repo);

      await service.revoke("mem-1");

      expect(repo.updateStatus).toHaveBeenCalledWith(
        "mem-1",
        "revoked",
        undefined,
      );
    });

    it("throws MembershipNotFoundError for unknown id", async () => {
      const repo = makeMockRepo();
      const service = new MembershipService(repo);

      await expect(service.revoke("unknown")).rejects.toThrow(
        MembershipNotFoundError,
      );
    });
  });

  describe("findByUserAndOrg", () => {
    it("delegates to repository", async () => {
      const repo = makeMockRepo();
      const service = new MembershipService(repo);

      await service.findByUserAndOrg(USER_ID, ORG_ID);
      expect(repo.findByUserAndOrg).toHaveBeenCalledWith(
        USER_ID,
        ORG_ID,
        undefined,
      );
    });
  });

  describe("findByOrg", () => {
    it("delegates to repository", async () => {
      const repo = makeMockRepo();
      const service = new MembershipService(repo);

      await service.findByOrg(ORG_ID);
      expect(repo.findByOrg).toHaveBeenCalledWith(ORG_ID, undefined);
    });
  });
});
