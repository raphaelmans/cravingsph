import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — must be before component imports
// ---------------------------------------------------------------------------

const mockUsePathname = vi.fn(() => "/branch/jollibee-makati");
const mockUseParams = vi.fn(() => ({ portalSlug: "jollibee-makati" }));
const mockUseRouter = vi.fn(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useParams: () => mockUseParams(),
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

const mockUseAccessibleBranches = vi.fn(() => ({
  data: [
    {
      id: "b1",
      name: "Makati Branch",
      portalSlug: "jollibee-makati",
      restaurantId: "r1",
      restaurantName: "Jollibee",
    },
  ],
}));

vi.mock("@/features/branch-portal/hooks/use-branch-portal-data", () => ({
  useAccessibleBranches: () => mockUseAccessibleBranches(),
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

import { BranchPortalSidebar } from "@/app/(branch)/branch-portal-sidebar";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("BranchPortalSidebar", () => {
  it("renders all five nav items with correct hrefs", () => {
    render(<BranchPortalSidebar />);

    const links = screen.getAllByRole("link");
    const hrefs = links.map((link) => link.getAttribute("href"));

    expect(hrefs).toContain("/branch/jollibee-makati");
    expect(hrefs).toContain("/branch/jollibee-makati/orders");
    expect(hrefs).toContain("/branch/jollibee-makati/menu");
    expect(hrefs).toContain("/branch/jollibee-makati/tables");
    expect(hrefs).toContain("/branch/jollibee-makati/settings");
  });

  it("renders the current branch name in the header", () => {
    render(<BranchPortalSidebar />);

    expect(screen.getByText("Makati Branch")).toBeTruthy();
    expect(screen.getByText("Jollibee")).toBeTruthy();
  });

  it("renders Owner Console link in the sidebar", () => {
    render(<BranchPortalSidebar />);

    const ownerLink = screen.getByText("Owner Console").closest("a");
    expect(ownerLink?.getAttribute("href")).toBe("/organization");
  });

  it("shows branch switcher when user has multiple branches", () => {
    mockUseAccessibleBranches.mockReturnValue({
      data: [
        {
          id: "b1",
          name: "Makati Branch",
          portalSlug: "jollibee-makati",
          restaurantId: "r1",
          restaurantName: "Jollibee",
        },
        {
          id: "b2",
          name: "BGC Branch",
          portalSlug: "jollibee-bgc",
          restaurantId: "r1",
          restaurantName: "Jollibee",
        },
      ],
    });

    render(<BranchPortalSidebar />);

    // The branch switcher renders a trigger button in the header
    const header = screen.getByTestId("sidebar-header");
    const switcherButton = header.querySelector("button");
    expect(switcherButton).not.toBeNull();
  });

  it("does not show branch switcher with a single branch", () => {
    mockUseAccessibleBranches.mockReturnValue({
      data: [
        {
          id: "b1",
          name: "Makati Branch",
          portalSlug: "jollibee-makati",
          restaurantId: "r1",
          restaurantName: "Jollibee",
        },
      ],
    });

    render(<BranchPortalSidebar />);

    // Single branch: no button in header (just a div)
    const header = screen.getByTestId("sidebar-header");
    const switcherButton = header.querySelector("button");
    expect(switcherButton).toBeNull();
  });

  it("renders user email in the footer", () => {
    render(<BranchPortalSidebar />);

    expect(screen.getByText("owner@test.com")).toBeTruthy();
  });
});
