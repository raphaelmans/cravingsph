import { makeAdminService } from "@/modules/admin/factories/admin.factory";
import { adminProcedure, router } from "@/shared/infra/trpc/trpc";
import {
  GetAdminRestaurantSchema,
  GetAdminVerificationRequestSchema,
  UpdateAdminRestaurantSchema,
  UpdateAdminVerificationStatusSchema,
} from "./dtos/admin.dto";

export const adminRouter = router({
  getDashboardOverview: adminProcedure.query(async () => {
    const adminService = makeAdminService();
    return adminService.getDashboardOverview();
  }),
  getUsers: adminProcedure.query(async () => {
    const adminService = makeAdminService();
    return adminService.getUsers();
  }),
  getRestaurants: adminProcedure.query(async () => {
    const adminService = makeAdminService();
    return adminService.getRestaurants();
  }),
  getRestaurant: adminProcedure
    .input(GetAdminRestaurantSchema)
    .query(async ({ input }) => {
      const adminService = makeAdminService();
      return adminService.getRestaurant(input.id);
    }),
  updateRestaurant: adminProcedure
    .input(UpdateAdminRestaurantSchema)
    .mutation(async ({ input }) => {
      const adminService = makeAdminService();
      const { id, ...data } = input;
      return adminService.updateRestaurant(id, data);
    }),
  getVerificationQueue: adminProcedure.query(async () => {
    const adminService = makeAdminService();
    return adminService.getVerificationQueue();
  }),
  getVerificationRequest: adminProcedure
    .input(GetAdminVerificationRequestSchema)
    .query(async ({ input }) => {
      const adminService = makeAdminService();
      return adminService.getVerificationRequest(input.requestId);
    }),
  updateVerificationStatus: adminProcedure
    .input(UpdateAdminVerificationStatusSchema)
    .mutation(async ({ input }) => {
      const adminService = makeAdminService();
      return adminService.updateVerificationStatus(
        input.requestId,
        input.status,
      );
    }),
});
