import { adminRouter } from "@/modules/admin/admin.router";
import { authRouter } from "@/modules/auth/auth.router";
import { branchRouter } from "@/modules/branch/branch.router";
import { discoveryRouter } from "@/modules/discovery/discovery.router";
import { healthRouter } from "@/modules/health/health.router";
import { invitationRouter } from "@/modules/invitation/invitation.router";
import { menuRouter } from "@/modules/menu/menu.router";
import { orderRouter } from "@/modules/order/order.router";
import { organizationRouter } from "@/modules/organization/organization.router";
import { paymentConfigRouter } from "@/modules/payment-config/payment-config.router";
import { profileRouter } from "@/modules/profile/profile.router";
import { restaurantRouter } from "@/modules/restaurant/restaurant.router";
import { reviewRouter } from "@/modules/review/review.router";
import { savedRestaurantRouter } from "@/modules/saved-restaurant/saved-restaurant.router";
import { tableRouter } from "@/modules/table/table.router";
import { verificationRouter } from "@/modules/verification/verification.router";
import { router } from "./trpc";

/**
 * Root router combining all module routers.
 */
export const appRouter = router({
  admin: adminRouter,
  discovery: discoveryRouter,
  health: healthRouter,
  invitation: invitationRouter,
  auth: authRouter,
  profile: profileRouter,
  organization: organizationRouter,
  restaurant: restaurantRouter,
  savedRestaurant: savedRestaurantRouter,
  branch: branchRouter,
  menu: menuRouter,
  order: orderRouter,
  paymentConfig: paymentConfigRouter,
  review: reviewRouter,
  table: tableRouter,
  verification: verificationRouter,
});

/**
 * Type export for client-side usage.
 * This is used to infer the types for the tRPC client.
 */
export type AppRouter = typeof appRouter;
