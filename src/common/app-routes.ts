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

  // Protected customer (auth optional, redirect to login if needed)
  orders: {
    base: "/orders",
    options: { type: "protected" as const },
  },
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
  magicLink: {
    base: "/magic-link",
    options: { type: "guest" as const },
  },
  postLogin: {
    base: "/post-login",
    options: { type: "guest" as const },
  },

  // Owner portal
  organization: {
    base: "/organization",
    options: { type: "organization" as const },
    getStarted: "/organization/get-started",
    onboarding: "/organization/onboarding",
    restaurants: "/organization/restaurants",
    payments: "/organization/payments",
    team: "/organization/team",
    verify: "/organization/verify",
    settings: "/organization/settings",
  },
  ownerAccount: {
    base: "/account/profile",
    options: { type: "organization" as const },
  },

  // Admin portal
  admin: {
    base: "/admin",
    options: { type: "admin" as const },
    verification: "/admin/verification",
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
];

const guestBases = [
  appRoutes.login.base,
  appRoutes.register.base,
  appRoutes.magicLink.base,
  appRoutes.postLogin.base,
];

const protectedBases = [
  appRoutes.orders.base,
  appRoutes.saved.base,
  appRoutes.customerAccount.base,
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

export function getRouteType(pathname: string): RouteType {
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
