import { RoleName } from "@prisma/client";

export const ROLE_LABEL: Record<RoleName, string> = {
  ADMIN: "Admin",
  EDITOR: "Editor",
  VISUALIZADOR: "Visualizador",
};

export function canManageUsers(role: RoleName) {
  return role === "ADMIN";
}

export function canEditContent(role: RoleName) {
  return role === "ADMIN" || role === "EDITOR";
}

export function canViewAdmin(role: RoleName) {
  return role === "ADMIN" || role === "EDITOR" || role === "VISUALIZADOR";
}

export function requireRole(role: RoleName, allowedRoles: RoleName[]) {
  return allowedRoles.includes(role);
}
