import {
  CreateAssignmentSchema,
  CreateMembershipSchema,
  CreateTeamInviteSchema,
  ROLE_SCOPE_MAP,
  RoleTemplateSchema,
  ScopeTypeSchema,
} from "@/modules/team-access/dtos/team-access.dto";

describe("RoleTemplateSchema", () => {
  it("accepts all valid role templates", () => {
    const valid = [
      "business_owner",
      "business_manager",
      "business_viewer",
      "branch_manager",
      "branch_staff",
      "branch_viewer",
    ];
    for (const role of valid) {
      expect(RoleTemplateSchema.safeParse(role).success).toBe(true);
    }
  });

  it("rejects invalid role templates", () => {
    expect(RoleTemplateSchema.safeParse("admin").success).toBe(false);
    expect(RoleTemplateSchema.safeParse("").success).toBe(false);
  });
});

describe("ScopeTypeSchema", () => {
  it("accepts business and branch", () => {
    expect(ScopeTypeSchema.safeParse("business").success).toBe(true);
    expect(ScopeTypeSchema.safeParse("branch").success).toBe(true);
  });

  it("rejects invalid scope types", () => {
    expect(ScopeTypeSchema.safeParse("restaurant").success).toBe(false);
  });
});

describe("ROLE_SCOPE_MAP", () => {
  it("maps business roles to business scope", () => {
    expect(ROLE_SCOPE_MAP.business_owner).toBe("business");
    expect(ROLE_SCOPE_MAP.business_manager).toBe("business");
    expect(ROLE_SCOPE_MAP.business_viewer).toBe("business");
  });

  it("maps branch roles to branch scope", () => {
    expect(ROLE_SCOPE_MAP.branch_manager).toBe("branch");
    expect(ROLE_SCOPE_MAP.branch_staff).toBe("branch");
    expect(ROLE_SCOPE_MAP.branch_viewer).toBe("branch");
  });
});

describe("CreateMembershipSchema", () => {
  it("accepts valid input", () => {
    const result = CreateMembershipSchema.safeParse({
      userId: "550e8400-e29b-41d4-a716-446655440000",
      organizationId: "550e8400-e29b-41d4-a716-446655440001",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-UUID userId", () => {
    const result = CreateMembershipSchema.safeParse({
      userId: "not-a-uuid",
      organizationId: "550e8400-e29b-41d4-a716-446655440001",
    });
    expect(result.success).toBe(false);
  });
});

describe("CreateAssignmentSchema", () => {
  it("accepts valid branch assignment", () => {
    const result = CreateAssignmentSchema.safeParse({
      membershipId: "550e8400-e29b-41d4-a716-446655440000",
      roleTemplate: "branch_staff",
      scopeType: "branch",
      scopeId: "550e8400-e29b-41d4-a716-446655440001",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid role template", () => {
    const result = CreateAssignmentSchema.safeParse({
      membershipId: "550e8400-e29b-41d4-a716-446655440000",
      roleTemplate: "super_admin",
      scopeType: "branch",
      scopeId: "550e8400-e29b-41d4-a716-446655440001",
    });
    expect(result.success).toBe(false);
  });
});

describe("CreateTeamInviteSchema", () => {
  it("accepts valid invite input", () => {
    const result = CreateTeamInviteSchema.safeParse({
      organizationId: "550e8400-e29b-41d4-a716-446655440000",
      email: "staff@example.com",
      roleTemplate: "branch_staff",
      scopeType: "branch",
      scopeId: "550e8400-e29b-41d4-a716-446655440001",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = CreateTeamInviteSchema.safeParse({
      organizationId: "550e8400-e29b-41d4-a716-446655440000",
      email: "not-an-email",
      roleTemplate: "branch_staff",
      scopeType: "branch",
      scopeId: "550e8400-e29b-41d4-a716-446655440001",
    });
    expect(result.success).toBe(false);
  });
});
