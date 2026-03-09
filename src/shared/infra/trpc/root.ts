import { adminRouter } from "@/modules/admin/admin.router";
import { authRouter } from "@/modules/auth/auth.router";
import { branchRouter } from "@/modules/branch/branch.router";
import { healthRouter } from "@/modules/health/health.router";
import { menuRouter } from "@/modules/menu/menu.router";
import { organizationRouter } from "@/modules/organization/organization.router";
import { profileRouter } from "@/modules/profile/profile.router";
import { restaurantRouter } from "@/modules/restaurant/restaurant.router";
import { router } from "./trpc";

/**
 * Root router combining all module routers.
 */
export const appRouter = router({
  admin: adminRouter,
  health: healthRouter,
  auth: authRouter,
  profile: profileRouter,
  organization: organizationRouter,
  restaurant: restaurantRouter,
  branch: branchRouter,
  menu: menuRouter,
});

/**
 * Type export for client-side usage.
 * This is used to infer the types for the tRPC client.
 */
export type AppRouter = typeof appRouter;
