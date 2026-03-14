import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — must be before component imports
// ---------------------------------------------------------------------------

vi.mock("next/navigation", () => ({
  usePathname: () => "/organization/team/invites",
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

const mockInvites = [
  {
    id: "inv-1",
    organizationId: "org-1",
    invitedBy: "owner-1",
    email: "pending@example.com",
    token: "abc123",
    roleTemplate: "branch_staff",
    scopeType: "branch",
    scopeId: "b-1",
    scopeName: "Jollibee Makati",
    status: "pending",
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: "2026-03-10T00:00:00Z",
  },
  {
    id: "inv-2",
    organizationId: "org-1",
    invitedBy: "owner-1",
    email: "accepted@example.com",
    token: "def456",
    roleTemplate: "business_manager",
    scopeType: "business",
    scopeId: "org-1",
    scopeName: "Business-wide access",
    status: "accepted",
    expiresAt: "2026-03-15T00:00:00Z",
    createdAt: "2026-03-08T00:00:00Z",
  },
  {
    id: "inv-3",
    organizationId: "org-1",
    invitedBy: "owner-1",
    email: "revoked@example.com",
    token: "ghi789",
    roleTemplate: "branch_viewer",
    scopeType: "branch",
    scopeId: "b-2",
    scopeName: "Jollibee BGC",
    status: "revoked",
    expiresAt: "2026-03-12T00:00:00Z",
    createdAt: "2026-03-05T00:00:00Z",
  },
];

let mockInvitesData = mockInvites;
let mockInvitesLoading = false;

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

vi.mock("@/features/team-access/hooks/use-team-access", () => ({
  useTeamInvites: () => ({
    data: mockInvitesData,
    isLoading: mockInvitesLoading,
  }),
  useRevokeInvite: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

import TeamInvitesPage from "@/app/(owner)/organization/team/invites/page";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("TeamInvitesPage", () => {
  beforeEach(() => {
    mockInvitesData = mockInvites;
    mockInvitesLoading = false;
  });

  it("renders the page header with title and eyebrow", () => {
    render(<TeamInvitesPage />);

    expect(screen.getByText("Invitations")).toBeTruthy();
    // "Team Access" appears in breadcrumb and eyebrow
    expect(screen.getAllByText("Team Access").length).toBeGreaterThanOrEqual(1);
  });

  it("renders breadcrumbs linking back to team page", () => {
    render(<TeamInvitesPage />);

    const teamLink = screen.getAllByText("Team Access")[0]?.closest("a");
    expect(teamLink?.getAttribute("href")).toBe("/organization/team");
  });

  it("shows Back to Members button", () => {
    render(<TeamInvitesPage />);

    const backLink = screen.getByText("Back to Members").closest("a");
    expect(backLink?.getAttribute("href")).toBe("/organization/team");
  });

  it("renders all invites with status badges", () => {
    render(<TeamInvitesPage />);

    expect(screen.getByText("pending@example.com")).toBeTruthy();
    expect(screen.getByText("accepted@example.com")).toBeTruthy();
    expect(screen.getByText("revoked@example.com")).toBeTruthy();
  });

  it("shows invite count", () => {
    render(<TeamInvitesPage />);

    expect(screen.getByText("(3)")).toBeTruthy();
  });

  it("renders role and scope info for invites", () => {
    render(<TeamInvitesPage />);

    // Role labels and scope names are inside spans with icons
    const container = document.body;
    expect(container.textContent).toContain("Branch Staff");
    expect(container.textContent).toContain("Jollibee Makati");
    expect(container.textContent).toContain("Business Manager");
    expect(container.textContent).toContain("Business-wide access");
  });

  it("shows loading skeletons when loading", () => {
    mockInvitesLoading = true;
    render(<TeamInvitesPage />);

    expect(screen.queryByText("pending@example.com")).toBeNull();
  });

  it("shows empty state when no invites", () => {
    mockInvitesData = [];
    render(<TeamInvitesPage />);

    expect(screen.getByText("No invitations sent yet.")).toBeTruthy();
  });

  it("sorts pending invites first", () => {
    render(<TeamInvitesPage />);

    const emails = screen
      .getAllByText(/@example\.com/)
      .map((el) => el.textContent);
    // Pending should be first
    expect(emails[0]).toBe("pending@example.com");
  });
});
