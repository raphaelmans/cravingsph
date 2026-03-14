import { publicProcedure, router } from "@/shared/infra/trpc/trpc";
import { flags } from "./index";

export const flagsRouter = router({
  /**
   * Returns all feature flag values.
   * Public procedure — clients use this to gate UI features.
   */
  getAll: publicProcedure.query(() => flags),
});
