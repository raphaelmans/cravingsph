import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

const mockRestaurants = [
  { id: "r-1", name: "Jollibee", slug: "jollibee" },
  { id: "r-2", name: "Chowking", slug: "chowking" },
];
const mockUseRestaurants = vi.fn(() => ({
  data: mockRestaurants,
}));

vi.mock("@/features/owner/hooks/use-owner-sidebar-data", () => ({
  useOrganization: () => mockUseOrganization(),
  useRestaurants: () => mockUseRestaurants(),
}));

const mockSelectRestaurant = vi.fn();
const mockClearSelection = vi.fn();
let mockSelectedRestaurantId: string | null = null;

vi.mock("@/features/owner/stores/workspace.store", () => ({
  useSelectedRestaurantId: () => mockSelectedRestaurantId,
  useWorkspaceActions: () => ({
    selectRestaurant: mockSelectRestaurant,
    clearSelection: mockClearSelection,
  }),
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
      size?: string;
      className?: string;
    }) => (asChild ? children : <button {...props}>{children}</button>),
    SidebarRail: () => null,
    SidebarSeparator: () => <hr />,
  };
});

// Mock DropdownMenu to render inline (avoids Radix portal issues in JSDOM)
vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({
    children,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content" role="menu">
      {children}
    </div>
  ),
  DropdownMenuItem: ({
    children,
    onSelect,
  }: {
    children: React.ReactNode;
    onSelect?: () => void;
    variant?: string;
    disabled?: boolean;
    asChild?: boolean;
  }) => (
    // biome-ignore lint/a11y/useFocusableInteractive: test mock
    // biome-ignore lint/a11y/useKeyWithClickEvents: test mock
    <div role="menuitem" onClick={onSelect}>
      {children}
    </div>
  ),
  DropdownMenuSeparator: () => <hr />,
}));

import { OwnerSidebarV2 } from "@/app/(owner)/sidebar-v2";

// ---------------------------------------------------------------------------
// Default props helper
// ---------------------------------------------------------------------------

const defaultProps = {
  showBranchOps: false,
  showTeamAccess: false,
  showWorkspaceSwitcher: false,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("OwnerSidebarV2", () => {
  it("renders five group labels", () => {
    render(<OwnerSidebarV2 {...defaultProps} />);

    expect(screen.getByText("Setup")).toBeTruthy();
    expect(screen.getByText("Overview")).toBeTruthy();
    expect(screen.getByText("Restaurants")).toBeTruthy();
    expect(screen.getByText("Branch Operations")).toBeTruthy();
    expect(screen.getByText("Team Access")).toBeTruthy();
    expect(screen.getByText("Account")).toBeTruthy();
  });

  it("renders core nav links with correct hrefs", () => {
    render(<OwnerSidebarV2 {...defaultProps} />);

    const links = screen.getAllByRole("link");
    const hrefs = links.map((link) => link.getAttribute("href"));

    expect(hrefs).toContain("/organization/get-started");
    expect(hrefs).toContain("/organization");
    expect(hrefs).toContain("/organization/restaurants");
    expect(hrefs).toContain("/account/profile");
  });

  it("shows 'Coming soon' for Branch Operations when flag is off", () => {
    render(<OwnerSidebarV2 {...defaultProps} />);

    const comingSoon = screen.getAllByText("Coming soon");
    expect(comingSoon.length).toBe(2);
  });

  it("shows 'Coming soon' for Team Access when flag is off", () => {
    render(<OwnerSidebarV2 {...defaultProps} showBranchOps={true} />);

    const comingSoon = screen.getAllByText("Coming soon");
    expect(comingSoon.length).toBe(1);
  });

  it("shows Branch Operations link when branchOps flag is on", () => {
    render(<OwnerSidebarV2 {...defaultProps} showBranchOps={true} />);

    expect(screen.getByText("All Branches")).toBeTruthy();
    const link = screen.getByText("All Branches").closest("a");
    expect(link?.getAttribute("href")).toBe("/branch");
  });

  it("shows Team Access Members link when teamAccess flag is on", () => {
    render(<OwnerSidebarV2 {...defaultProps} showTeamAccess={true} />);

    expect(screen.getByText("Members")).toBeTruthy();
    const link = screen.getByText("Members").closest("a");
    expect(link?.getAttribute("href")).toBe("/organization/team");
  });

  it("renders both flag-gated sections when both flags are on", () => {
    render(
      <OwnerSidebarV2
        {...defaultProps}
        showBranchOps={true}
        showTeamAccess={true}
      />,
    );

    expect(screen.getByText("All Branches")).toBeTruthy();
    expect(screen.getByText("Members")).toBeTruthy();
    expect(screen.queryByText("Coming soon")).toBeNull();
  });

  it("renders organization name in the header when switcher is off", () => {
    render(<OwnerSidebarV2 {...defaultProps} />);

    expect(screen.getByText("My Food Corp")).toBeTruthy();
  });

  it("renders user email in the footer", () => {
    render(<OwnerSidebarV2 {...defaultProps} />);

    expect(screen.getByText("owner@test.com")).toBeTruthy();
  });
});

describe("WorkspaceSwitcher", () => {
  beforeEach(() => {
    mockSelectedRestaurantId = null;
    mockSelectRestaurant.mockClear();
    mockClearSelection.mockClear();
  });

  it("shows static org name header when switcher flag is off", () => {
    render(<OwnerSidebarV2 {...defaultProps} showWorkspaceSwitcher={false} />);

    const header = screen.getByTestId("sidebar-header");
    // Static header has no dropdown trigger
    expect(within(header).queryByTestId("dropdown-trigger")).toBeNull();
    expect(within(header).getByText("My Food Corp")).toBeTruthy();
  });

  it("shows dropdown trigger with org name when switcher flag is on", () => {
    render(<OwnerSidebarV2 {...defaultProps} showWorkspaceSwitcher={true} />);

    const header = screen.getByTestId("sidebar-header");
    expect(within(header).getByTestId("dropdown-trigger")).toBeTruthy();
    expect(within(header).getByText("My Food Corp")).toBeTruthy();
  });

  it("renders all restaurants plus 'All Restaurants' option", () => {
    render(<OwnerSidebarV2 {...defaultProps} showWorkspaceSwitcher={true} />);

    const header = screen.getByTestId("sidebar-header");
    const menuItems = within(header).getAllByRole("menuitem");
    const menuTexts = menuItems.map((item) => item.textContent?.trim());

    expect(menuTexts).toContain("All Restaurants");
    expect(menuTexts).toContain("Jollibee");
    expect(menuTexts).toContain("Chowking");
  });

  it("calls selectRestaurant when a restaurant is chosen", () => {
    render(<OwnerSidebarV2 {...defaultProps} showWorkspaceSwitcher={true} />);

    const header = screen.getByTestId("sidebar-header");
    const menuItems = within(header).getAllByRole("menuitem");
    const jollibeeItem = menuItems.find((item) =>
      item.textContent?.includes("Jollibee"),
    );
    expect(jollibeeItem).toBeTruthy();
    if (jollibeeItem) fireEvent.click(jollibeeItem);

    expect(mockSelectRestaurant).toHaveBeenCalledWith("r-1");
  });

  it("calls clearSelection when 'All Restaurants' is chosen", () => {
    mockSelectedRestaurantId = "r-1";
    render(<OwnerSidebarV2 {...defaultProps} showWorkspaceSwitcher={true} />);

    const header = screen.getByTestId("sidebar-header");
    const menuItems = within(header).getAllByRole("menuitem");
    const allItem = menuItems.find((item) =>
      item.textContent?.includes("All Restaurants"),
    );
    expect(allItem).toBeTruthy();
    if (allItem) fireEvent.click(allItem);

    expect(mockClearSelection).toHaveBeenCalled();
  });

  it("shows selected restaurant name in the trigger when filtered", () => {
    mockSelectedRestaurantId = "r-2";
    render(<OwnerSidebarV2 {...defaultProps} showWorkspaceSwitcher={true} />);

    const header = screen.getByTestId("sidebar-header");
    const trigger = within(header).getByTestId("dropdown-trigger");
    expect(within(trigger).getByText("Chowking")).toBeTruthy();
  });
});
