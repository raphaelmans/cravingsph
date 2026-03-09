import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/shared/infra/trpc/root";

type RouterOutputs = inferRouterOutputs<AppRouter>;

/** The full management menu (array of categories with items). */
export type ManagementMenu = RouterOutputs["menu"]["getManagementMenu"];

/** A single category with its items (including unavailable). */
export type ManagementCategory = ManagementMenu[number];

/** A single menu item with variants and modifier groups (serialized from tRPC). */
export type ManagementMenuItem = ManagementCategory["items"][number];
