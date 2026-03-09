import { makeAdminService } from "@/modules/admin/factories/admin.factory";
import { adminProcedure, router } from "@/shared/infra/trpc/trpc";
import {
  GetAdminVerificationRequestSchema,
  UpdateAdminVerificationStatusSchema,
} from "./dtos/admin.dto";

export const adminRouter = router({
  getDashboardOverview: adminProcedure.query(async () => {
    const adminService = makeAdminService();
    return adminService.getDashboardOverview();
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
