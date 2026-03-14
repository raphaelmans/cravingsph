export type RouteType =
  | "public"
  | "guest"
  | "protected"
  | "organization"
  | "admin";

type RouteOptions = {
  type: RouteType;
};

type RouteConfig = {
  base: string;
  options: RouteOptions;
};

const buildRedirectUrl = (base: string, path: string) => {
  const params = new URLSearchParams({ redirect: path });
  return `${base}?${params.toString()}`;
};

export const appRoutes = {
  // Public (customer)
  index: {
    base: "/",
    options: { type: "public" as const },
  },
  restaurant: {
    base: "/restaurant",
    options: { type: "public" as const },
    bySlug: (slug: string) => `/restaurant/${slug}`,
    order: (slug: string, orderId: string) =>
      `/restaurant/${slug}/order/${orderId}`,
  },
  search: {
    base: "/search",
    options: { type: "public" as const },
  },
  guides: {
    base: "/guides",
    options: { type: "public" as const },
    detail: (slug: string) => `/guides/${slug}` as const,
  },

  // Protected customer (auth optional, redirect to login if needed)
  orders: {
    base: "/orders",
    options: { type: "protected" as const },
  },
  /** @deprecated Hidden for MVP — page redirects to / */
  saved: {
    base: "/saved",
    options: { type: "protected" as const },
  },
  customerAccount: {
    base: "/account",
    options: { type: "protected" as const },
  },

  // Auth
  login: {
    base: "/login",
    options: { type: "guest" as const },
    from: (path: string) => buildRedirectUrl("/login", path),
  },
  register: {
    base: "/register",
    options: { type: "guest" as const },
  },
  registerOwner: {
    base: "/register/owner",
    options: { type: "guest" as const },
  },
  registerTeam: {
    base: "/register/team",
    options: { type: "public" as const },
  },
  magicLink: {
    base: "/magic-link",
    options: { type: "guest" as const },
  },
  postLogin: {
    base: "/post-login",
    options: { type: "protected" as const },
  },

  // Owner portal
  organization: {
    base: "/organization",
    options: { type: "organization" as const },
    getStarted: "/organization/get-started",
    onboarding: "/organization/onboarding",
    restaurants: "/organization/restaurants",
    /** @deprecated Hidden for MVP — page redirects to /organization */
    payments: "/organization/payments",
    team: "/organization/team",
    teamInvites: "/organization/team/invites",
    /** @deprecated Hidden for MVP — page redirects to /organization */
    verify: "/organization/verify",
    settings: "/organization/settings",
  },
  ownerAccount: {
    base: "/account/profile",
    options: { type: "organization" as const },
  },

  // Branch portal (ops)
  branchPortal: {
    base: "/branch",
    options: { type: "protected" as const },
    byPortalSlug: (portalSlug: string) => `/branch/${portalSlug}`,
    orders: (portalSlug: string) => `/branch/${portalSlug}/orders`,
    orderDetail: (portalSlug: string, orderId: string) =>
      `/branch/${portalSlug}/orders/${orderId}`,
    menu: (portalSlug: string) => `/branch/${portalSlug}/menu`,
    tables: (portalSlug: string) => `/branch/${portalSlug}/tables`,
    settings: (portalSlug: string) => `/branch/${portalSlug}/settings`,
  },

  // Admin portal
  admin: {
    base: "/admin",
    options: { type: "admin" as const },
    invitations: "/admin/invitations",
    /** @deprecated Hidden for MVP — page redirects to /admin */
    verification: "/admin/verification",
    /** @deprecated Hidden for MVP — page redirects to /admin */
    verificationRequest: (requestId: string) =>
      `/admin/verification/${requestId}`,
    restaurants: "/admin/restaurants",
    restaurant: (id: string) => `/admin/restaurants/${id}`,
    users: "/admin/users",
  },
} satisfies Record<string, RouteConfig | Record<string, unknown>>;

const exactOrChild = (path: string, base: string) =>
  path === base || path.startsWith(`${base}/`);

const publicBases = [
  appRoutes.index.base,
  appRoutes.restaurant.base,
  appRoutes.search.base,
  appRoutes.guides.base,
];

const guestBases = [
  appRoutes.login.base,
  appRoutes.register.base,
  appRoutes.magicLink.base,
];

const protectedBases = [
  appRoutes.orders.base,
  appRoutes.saved.base,
  appRoutes.customerAccount.base,
  appRoutes.postLogin.base,
  appRoutes.branchPortal.base,
];

const organizationBases = [
  appRoutes.organization.base,
  appRoutes.ownerAccount.base,
];

const adminBases = [appRoutes.admin.base];

export const routeGroups = {
  public: publicBases,
  guest: guestBases,
  protected: protectedBases,
  organization: organizationBases,
  admin: adminBases,
};

export const matchesRoute = (path: string, base: string) =>
  exactOrChild(path, base);

/**
 * Routes that override their parent route group's type.
 * e.g. /register/team is public (not guest) so both auth states can access it.
 */
const publicOverrides = [appRoutes.registerTeam.base];

export function getRouteType(pathname: string): RouteType {
  // Check specific overrides first (more specific than parent route groups)
  if (publicOverrides.some((route) => exactOrChild(pathname, route))) {
    return "public";
  }

  if (routeGroups.admin.some((route) => exactOrChild(pathname, route))) {
    return "admin";
  }

  if (routeGroups.organization.some((route) => exactOrChild(pathname, route))) {
    return "organization";
  }

  if (routeGroups.protected.some((route) => exactOrChild(pathname, route))) {
    return "protected";
  }

  if (routeGroups.guest.some((route) => exactOrChild(pathname, route))) {
    return "guest";
  }

  if (routeGroups.public.some((route) => exactOrChild(pathname, route))) {
    return "public";
  }

  return "public";
}

export const isProtectedRoute = (pathname: string) => {
  const type = getRouteType(pathname);
  return type === "protected" || type === "organization" || type === "admin";
};

export const isGuestRoute = (pathname: string) =>
  getRouteType(pathname) === "guest";
