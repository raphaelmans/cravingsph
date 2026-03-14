import type { RoleTemplate } from "./dtos/team-access.dto";

export type BusinessRoleTemplate = Extract<
  RoleTemplate,
  "business_owner" | "business_manager" | "business_viewer"
>;

export function isBusinessRole(
  role: RoleTemplate | null,
): role is BusinessRoleTemplate {
  return (
    role === "business_owner" ||
    role === "business_manager" ||
    role === "business_viewer"
  );
}

export function canAccessOwnerConsole(role: RoleTemplate | null): boolean {
  return isBusinessRole(role);
}

export function canManageRestaurants(role: RoleTemplate | null): boolean {
  return role === "business_owner" || role === "business_manager";
}

export function canViewTeam(role: RoleTemplate | null): boolean {
  return isBusinessRole(role);
}

export function canManageTeam(role: RoleTemplate | null): boolean {
  return role === "business_owner";
}
