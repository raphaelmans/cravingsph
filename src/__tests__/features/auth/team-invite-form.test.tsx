import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — must be before component imports
// ---------------------------------------------------------------------------

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

let mockSessionData: { email: string; userId: string; role: string } | null =
  null;
let mockSessionLoading = false;

vi.mock("@/features/auth/hooks/use-auth", () => ({
  useSession: () => ({
    data: mockSessionData,
    isLoading: mockSessionLoading,
  }),
}));

let mockInviteData: Record<string, unknown> | null = null;
let mockInviteLoading = false;
let mockInviteError: Error | null = null;

let mockAcceptPending = false;
const mockMutateAsync = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: mockInviteData,
    isLoading: mockInviteLoading,
    error: mockInviteError,
  }),
  useMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: mockAcceptPending,
  }),
}));

vi.mock("@/trpc/client", () => ({
  useTRPC: () => ({
    teamAccess: {
      invite: {
        validate: {
          queryOptions: () => ({
            queryKey: ["teamAccess", "invite", "validate"],
          }),
        },
        accept: {
          mutationOptions: () => ({}),
        },
      },
    },
  }),
}));

// Mock AuthSurface to simplify rendering
vi.mock("@/components/brand/auth-surface", () => ({
  AuthSurface: ({
    children,
    title,
    description,
    eyebrow,
    footer,
  }: {
    children: React.ReactNode;
    title: React.ReactNode;
    description?: React.ReactNode;
    eyebrow?: string;
    footer?: React.ReactNode;
  }) => (
    <div data-testid="auth-surface">
      {eyebrow && <span data-testid="eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {children}
      {footer && <div data-testid="footer">{footer}</div>}
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Import component under test (after mocks)
// ---------------------------------------------------------------------------

import { TeamInviteForm } from "@/features/auth/components/team-invite-form";

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const validInvite = {
  id: "invite-1",
  organizationId: "org-1",
  invitedBy: "owner-1",
  email: "team@example.com",
  token: "abc123",
  roleTemplate: "branch_manager",
  scopeType: "branch",
  scopeId: "branch-1",
  status: "pending",
  expiresAt: new Date(Date.now() + 86400000).toISOString(),
  createdAt: new Date().toISOString(),
  organizationName: "Juan's Food Corp",
  scopeName: "Jollibee Makati",
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("TeamInviteForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionData = null;
    mockSessionLoading = false;
    mockInviteData = null;
    mockInviteLoading = false;
    mockInviteError = null;
    mockAcceptPending = false;
  });

  it("shows 'Invitation required' when no token provided", () => {
    render(<TeamInviteForm />);

    expect(screen.getByText("Invitation required")).toBeTruthy();
    expect(
      screen.getByText(
        /Ask the organization owner to send you a fresh invitation/,
      ),
    ).toBeTruthy();
  });

  it("shows loading state while validating token", () => {
    mockInviteLoading = true;

    render(<TeamInviteForm token="some-token" />);

    expect(screen.getByText("Checking your invitation")).toBeTruthy();
  });

  it("shows loading state while checking session", () => {
    mockSessionLoading = true;

    render(<TeamInviteForm token="some-token" />);

    expect(screen.getByText("Checking your invitation")).toBeTruthy();
  });

  it("shows error for expired token", () => {
    mockInviteError = new Error("Team invite has expired");

    render(<TeamInviteForm token="expired-token" />);

    expect(screen.getByText("Invalid invitation")).toBeTruthy();
    expect(screen.getByText(/invitation has expired/i)).toBeTruthy();
  });

  it("shows error for already accepted token", () => {
    mockInviteError = new Error("Team invite has already been accepted");

    render(<TeamInviteForm token="accepted-token" />);

    expect(screen.getByText(/already been accepted/i)).toBeTruthy();
  });

  it("shows error for revoked token", () => {
    mockInviteError = new Error("Team invite is not pending (revoked)");

    render(<TeamInviteForm token="revoked-token" />);

    expect(screen.getByText(/revoked/i)).toBeTruthy();
  });

  describe("unauthenticated user with valid invite", () => {
    beforeEach(() => {
      mockInviteData = validInvite;
      mockSessionData = null;
    });

    it("shows invite details", () => {
      render(<TeamInviteForm token="abc123" />);

      expect(screen.getByText("You've been invited")).toBeTruthy();
      expect(screen.getByText("Juan's Food Corp")).toBeTruthy();
      expect(screen.getByText("Branch Manager")).toBeTruthy();
      expect(screen.getByText(/Jollibee Makati/)).toBeTruthy();
      expect(screen.getByText("team@example.com")).toBeTruthy();
    });

    it("shows sign up and sign in buttons", () => {
      render(<TeamInviteForm token="abc123" />);

      expect(screen.getByText("Sign up to accept")).toBeTruthy();
      expect(screen.getByText("Sign in to accept")).toBeTruthy();
    });

    it("sign up link includes redirect back to invite page", () => {
      render(<TeamInviteForm token="abc123" />);

      const signUpLink = screen.getByText("Sign up to accept").closest("a");
      expect(signUpLink).toBeTruthy();
      expect(signUpLink?.getAttribute("href")).toContain("/register");
      expect(signUpLink?.getAttribute("href")).toContain("redirect=");
    });

    it("sign in link includes redirect back to invite page", () => {
      render(<TeamInviteForm token="abc123" />);

      const signInLink = screen.getByText("Sign in to accept").closest("a");
      expect(signInLink).toBeTruthy();
      expect(signInLink?.getAttribute("href")).toContain("/login");
      expect(signInLink?.getAttribute("href")).toContain("redirect=");
    });
  });

  describe("authenticated user with valid invite", () => {
    beforeEach(() => {
      mockInviteData = validInvite;
      mockSessionData = {
        email: "team@example.com",
        userId: "user-1",
        role: "authenticated",
      };
    });

    it("shows accept button", () => {
      render(<TeamInviteForm token="abc123" />);

      expect(screen.getByText("Accept invitation")).toBeTruthy();
    });

    it("shows signed-in email", () => {
      render(<TeamInviteForm token="abc123" />);

      expect(screen.getByText(/Signed in as team@example.com/)).toBeTruthy();
    });

    it("does not show sign up/sign in buttons", () => {
      render(<TeamInviteForm token="abc123" />);

      expect(screen.queryByText("Sign up to accept")).toBeNull();
      expect(screen.queryByText("Sign in to accept")).toBeNull();
    });

    it("shows loading state during acceptance", () => {
      mockAcceptPending = true;

      render(<TeamInviteForm token="abc123" />);

      expect(screen.getByText("Accepting...")).toBeTruthy();
    });
  });

  describe("business scope invite", () => {
    it("shows Business-wide access label", () => {
      mockInviteData = {
        ...validInvite,
        roleTemplate: "business_manager",
        scopeType: "business",
        scopeName: "Business-wide access",
      };

      render(<TeamInviteForm token="abc123" />);

      expect(screen.getByText("Business Manager")).toBeTruthy();
      expect(screen.getByText("Business-wide access")).toBeTruthy();
    });
  });
});
