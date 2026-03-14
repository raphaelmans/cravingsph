import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockUsePathname = vi.fn(() => "/branch/jollibee-makati");
const mockUseParams = vi.fn(() => ({ portalSlug: "jollibee-makati" }));

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useParams: () => mockUseParams(),
}));

import { BranchPortalBottomNav } from "@/app/(branch)/branch-portal-bottom-nav";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("BranchPortalBottomNav", () => {
  it("renders all five tab links with correct hrefs", () => {
    render(<BranchPortalBottomNav />);

    const nav = screen.getByRole("navigation", { name: "Branch navigation" });
    const links = nav.querySelectorAll("a");

    expect(links).toHaveLength(5);

    const hrefs = Array.from(links).map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/branch/jollibee-makati");
    expect(hrefs).toContain("/branch/jollibee-makati/orders");
    expect(hrefs).toContain("/branch/jollibee-makati/menu");
    expect(hrefs).toContain("/branch/jollibee-makati/tables");
    expect(hrefs).toContain("/branch/jollibee-makati/settings");
  });

  it("renders tab labels", () => {
    render(<BranchPortalBottomNav />);

    expect(screen.getByText("Overview")).toBeTruthy();
    expect(screen.getByText("Orders")).toBeTruthy();
    expect(screen.getByText("Menu")).toBeTruthy();
    expect(screen.getByText("Tables")).toBeTruthy();
    expect(screen.getByText("Settings")).toBeTruthy();
  });

  it("marks the Overview tab as active on the base branch portal route", () => {
    mockUsePathname.mockReturnValue("/branch/jollibee-makati");

    render(<BranchPortalBottomNav />);

    const overviewLink = screen.getByText("Overview").closest("a");
    expect(overviewLink?.getAttribute("aria-current")).toBe("page");

    const ordersLink = screen.getByText("Orders").closest("a");
    expect(ordersLink?.getAttribute("aria-current")).toBeNull();
  });

  it("marks the Orders tab as active on the orders route", () => {
    mockUsePathname.mockReturnValue("/branch/jollibee-makati/orders");

    render(<BranchPortalBottomNav />);

    const ordersLink = screen.getByText("Orders").closest("a");
    expect(ordersLink?.getAttribute("aria-current")).toBe("page");

    const overviewLink = screen.getByText("Overview").closest("a");
    expect(overviewLink?.getAttribute("aria-current")).toBeNull();
  });

  it("is hidden on desktop (md:hidden class)", () => {
    render(<BranchPortalBottomNav />);

    const nav = screen.getByRole("navigation", { name: "Branch navigation" });
    expect(nav.className).toContain("md:hidden");
  });
});
