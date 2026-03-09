import { makeAdminService } from "@/modules/admin/factories/admin.factory";
import { adminProcedure, router } from "@/shared/infra/trpc/trpc";

export const adminRouter = router({
  getDashboardOverview: adminProcedure.query(async () => {
    const adminService = makeAdminService();
    return adminService.getDashboardOverview();
  }),
});
