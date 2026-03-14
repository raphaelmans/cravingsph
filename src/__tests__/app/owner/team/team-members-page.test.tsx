import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — must be before component imports
// ---------------------------------------------------------------------------

const mockUsePathname = vi.fn(() => "/organization/team");
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: vi.fn() }),
}));

const mockOrganization = {
  id: "org-1",
  name: "My Food Corp",
  ownerId: "owner-1",
};
vi.mock("@/features/owner/hooks/use-owner-sidebar-data", () => ({
  useOrganization: () => ({
    data: mockOrganization,
    isLoading: false,
  }),
}));

const mockMembers = [
  {
    id: "m-1",
    userId: "owner-1",
    email: "owner@example.com",
    displayName: "The Owner",
    status: "active",
    organizationId: "org-1",
    joinedAt: "2026-01-01T00:00:00Z",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    assignments: [
      {
        id: "a-1",
        membershipId: "m-1",
        roleTemplate: "business_owner",
        scopeType: "business",
        scopeId: "org-1",
        scopeName: "Business-wide access",
        status: "active",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
    ],
  },
  {
    id: "m-2",
    userId: "staff-1",
    email: "staff@example.com",
    displayName: null,
    status: "active",
    organizationId: "org-1",
    joinedAt: "2026-02-01T00:00:00Z",
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: "2026-02-01T00:00:00Z",
    assignments: [
      {
        id: "a-2",
        membershipId: "m-2",
        roleTemplate: "branch_staff",
        scopeType: "branch",
        scopeId: "b-1",
        scopeName: "Jollibee Makati",
        status: "active",
        createdAt: "2026-02-01T00:00:00Z",
        updatedAt: "2026-02-01T00:00:00Z",
      },
    ],
  },
  {
    id: "m-3",
    userId: "revoked-1",
    email: "revoked@example.com",
    displayName: null,
    status: "revoked",
    organizationId: "org-1",
    joinedAt: "2026-01-15T00:00:00Z",
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
    assignments: [],
  },
];

let mockMembersData = mockMembers;
let mockMembersLoading = false;

vi.mock("@/features/team-access/hooks/use-team-access", () => ({
  useTeamMembers: () => ({
    data: mockMembersData,
    isLoading: mockMembersLoading,
  }),
  useCreateInvite: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useRevokeMember: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

// Mock sidebar to avoid SidebarProvider requirement
vi.mock("@/components/ui/sidebar", async () => {
  const actual = await vi.importActual<
    typeof import("@/components/ui/sidebar")
  >("@/components/ui/sidebar");
  return {
    ...actual,
    SidebarTrigger: () => <button type="button">Toggle</button>,
  };
});

// Minimal tRPC mock for invite dialog
vi.mock("@/trpc/client", () => ({
  useTRPC: () => ({
    restaurant: {
      listByOrganization: {
        queryOptions: () => ({
          queryKey: ["restaurant", "listByOrganization"],
          queryFn: () => [],
          enabled: false,
        }),
      },
    },
    branch: {
      listByRestaurant: {
        queryOptions: () => ({
          queryKey: ["branch", "listByRestaurant"],
          queryFn: () => [],
          enabled: false,
        }),
      },
    },
  }),
}));

vi.mock("@/trpc/query-client", () => ({
  getQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

// Mock @tanstack/react-query to provide minimal context
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>(
    "@tanstack/react-query",
  );
  return {
    ...actual,
    useQuery: (opts: { queryFn?: () => unknown }) => ({
      data: opts.queryFn ? opts.queryFn() : undefined,
      isLoading: false,
    }),
    useMutation: () => ({
      mutate: vi.fn(),
      isPending: false,
    }),
  };
});

import TeamMembersPage from "@/app/(owner)/organization/team/page";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("TeamMembersPage", () => {
  beforeEach(() => {
    mockMembersData = mockMembers;
    mockMembersLoading = false;
  });

  it("renders the page header with title and eyebrow", () => {
    render(<TeamMembersPage />);

    expect(screen.getByText("Team Members")).toBeTruthy();
    // "Team Access" appears in both breadcrumb and eyebrow
    expect(screen.getAllByText("Team Access").length).toBeGreaterThanOrEqual(1);
  });

  it("renders breadcrumbs with Dashboard link", () => {
    render(<TeamMembersPage />);

    expect(screen.getByText("Dashboard")).toBeTruthy();
  });

  it("shows Invite Member button", () => {
    render(<TeamMembersPage />);

    expect(screen.getByText("Invite Member")).toBeTruthy();
  });

  it("shows View Invites button linking to invites page", () => {
    render(<TeamMembersPage />);

    const link = screen.getByText("View Invites").closest("a");
    expect(link?.getAttribute("href")).toBe("/organization/team/invites");
  });

  it("renders active members only (excludes revoked)", () => {
    render(<TeamMembersPage />);

    // Owner and staff are active, revoked member should not appear
    expect(screen.getByText("The Owner")).toBeTruthy();
    expect(screen.getByText("staff@example.com")).toBeTruthy();
    expect(screen.queryByText("revoked@example.com")).toBeNull();
  });

  it("shows member count for active members", () => {
    render(<TeamMembersPage />);

    expect(screen.getByText("(2)")).toBeTruthy();
  });

  it("renders role and scope info for members", () => {
    render(<TeamMembersPage />);

    // Role labels and scope names are inside badge spans with icons
    // Use flexible text matching
    const container = document.body;
    expect(container.textContent).toContain("Business Owner");
    expect(container.textContent).toContain("Business-wide access");
    expect(container.textContent).toContain("Branch Staff");
    expect(container.textContent).toContain("Jollibee Makati");
  });

  it("shows loading skeletons when loading", () => {
    mockMembersLoading = true;
    render(<TeamMembersPage />);

    // Should not show member names
    expect(screen.queryByText("The Owner")).toBeNull();
    expect(screen.queryByText("staff@example.com")).toBeNull();
  });

  it("shows empty state when no members", () => {
    mockMembersData = [];
    render(<TeamMembersPage />);

    expect(
      screen.getByText("No team members yet. Invite someone to get started."),
    ).toBeTruthy();
  });
});
