import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — must be before component imports
// ---------------------------------------------------------------------------

const mockUsePathname = vi.fn(() => "/organization");
const mockUseRouter = vi.fn(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => mockUseRouter(),
}));

const mockUseSession = vi.fn(() => ({
  data: { email: "owner@test.com", userId: "u1", role: "owner" },
}));
const mockUseLogout = vi.fn(() => ({
  mutate: vi.fn(),
  isPending: false,
}));

vi.mock("@/features/auth/hooks/use-auth", () => ({
  useSession: () => mockUseSession(),
  useLogout: () => mockUseLogout(),
}));

const mockUseOrganization = vi.fn(() => ({
  data: { id: "org-1", name: "My Food Corp" },
  isLoading: false,
}));

vi.mock("@/features/owner/hooks/use-owner-sidebar-data", () => ({
  useOrganization: () => mockUseOrganization(),
}));

// Mock SidebarProvider to avoid context issues in tests
vi.mock("@/components/ui/sidebar", async () => {
  const actual = await vi.importActual<
    typeof import("@/components/ui/sidebar")
  >("@/components/ui/sidebar");
  return {
    ...actual,
    Sidebar: ({ children }: { children: React.ReactNode }) => (
      <aside data-testid="sidebar">{children}</aside>
    ),
    SidebarContent: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    SidebarFooter: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    SidebarHeader: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="sidebar-header">{children}</div>
    ),
    SidebarGroup: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    SidebarGroupContent: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    SidebarMenu: ({ children }: { children: React.ReactNode }) => (
      <ul>{children}</ul>
    ),
    SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
      <li>{children}</li>
    ),
    SidebarMenuButton: ({
      children,
      asChild,
      ...props
    }: {
      children: React.ReactNode;
      asChild?: boolean;
      isActive?: boolean;
      tooltip?: string;
    }) => (asChild ? children : <button {...props}>{children}</button>),
    SidebarRail: () => null,
    SidebarSeparator: () => <hr />,
  };
});

import { OwnerSidebarV2 } from "@/app/(owner)/sidebar-v2";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("OwnerSidebarV2", () => {
  it("renders five group labels", () => {
    render(<OwnerSidebarV2 showBranchOps={false} showTeamAccess={false} />);

    expect(screen.getByText("Setup")).toBeTruthy();
    expect(screen.getByText("Overview")).toBeTruthy();
    expect(screen.getByText("Restaurants")).toBeTruthy();
    expect(screen.getByText("Branch Operations")).toBeTruthy();
    expect(screen.getByText("Team Access")).toBeTruthy();
    expect(screen.getByText("Account")).toBeTruthy();
  });

  it("renders core nav links with correct hrefs", () => {
    render(<OwnerSidebarV2 showBranchOps={false} showTeamAccess={false} />);

    const links = screen.getAllByRole("link");
    const hrefs = links.map((link) => link.getAttribute("href"));

    expect(hrefs).toContain("/organization/get-started");
    expect(hrefs).toContain("/organization");
    expect(hrefs).toContain("/organization/restaurants");
    expect(hrefs).toContain("/account/profile");
  });

  it("shows 'Coming soon' for Branch Operations when flag is off", () => {
    render(<OwnerSidebarV2 showBranchOps={false} showTeamAccess={false} />);

    const comingSoon = screen.getAllByText("Coming soon");
    expect(comingSoon.length).toBe(2);
  });

  it("shows 'Coming soon' for Team Access when flag is off", () => {
    render(<OwnerSidebarV2 showBranchOps={true} showTeamAccess={false} />);

    const comingSoon = screen.getAllByText("Coming soon");
    expect(comingSoon.length).toBe(1);
  });

  it("shows Branch Operations link when branchOps flag is on", () => {
    render(<OwnerSidebarV2 showBranchOps={true} showTeamAccess={false} />);

    expect(screen.getByText("All Branches")).toBeTruthy();
    const link = screen.getByText("All Branches").closest("a");
    expect(link?.getAttribute("href")).toBe("/branch");
  });

  it("shows Team Access Members link when teamAccess flag is on", () => {
    render(<OwnerSidebarV2 showBranchOps={false} showTeamAccess={true} />);

    expect(screen.getByText("Members")).toBeTruthy();
    const link = screen.getByText("Members").closest("a");
    expect(link?.getAttribute("href")).toBe("/organization/team");
  });

  it("renders both flag-gated sections when both flags are on", () => {
    render(<OwnerSidebarV2 showBranchOps={true} showTeamAccess={true} />);

    expect(screen.getByText("All Branches")).toBeTruthy();
    expect(screen.getByText("Members")).toBeTruthy();
    expect(screen.queryByText("Coming soon")).toBeNull();
  });

  it("renders organization name in the header", () => {
    render(<OwnerSidebarV2 showBranchOps={false} showTeamAccess={false} />);

    expect(screen.getByText("My Food Corp")).toBeTruthy();
  });

  it("renders user email in the footer", () => {
    render(<OwnerSidebarV2 showBranchOps={false} showTeamAccess={false} />);

    expect(screen.getByText("owner@test.com")).toBeTruthy();
  });
});
