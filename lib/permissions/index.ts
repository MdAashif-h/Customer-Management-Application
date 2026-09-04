export type Role = "ADMIN" | "MANAGER" | "USER";

export type Permission = "customers.read" | "customers.create" | "customers.update" | "customers.delete" | "users.read" | "users.update" | "roles.manage" | "settings.manage";
const rolePermissions: Record<Role, Permission[]> = {
  ADMIN: ["customers.read", "customers.create", "customers.update", "customers.delete", "users.read", "users.update", "roles.manage", "settings.manage"],
  MANAGER: ["customers.read", "customers.create", "customers.update"],
  USER: ["customers.read", "customers.create", "customers.update"],
};
export function hasPermission(role: string, permission: Permission) { return rolePermissions[role as Role]?.includes(permission) ?? false; }
export function permissionsFor(role: Role) { return rolePermissions[role]; }