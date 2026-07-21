"use client";

import { useAuth } from "@/contexts/auth-context";

export function useRBAC(
  moduleName: string
) {
  const { permissions } = useAuth();

  const module =
    moduleName
      .toLowerCase()
      .replace(/\s+/g, "_");

  return {
    canView:
      permissions.includes(
        `${module}:read`
      ),

    canCreate:
      permissions.includes(
        `${module}:create`
      ),

    canEdit:
      permissions.includes(
        `${module}:update`
      ),

    canDelete:
      permissions.includes(
        `${module}:delete`
      ),

    canApprove:
      permissions.includes(
        `${module}:approve`
      ),

    canExport:
      permissions.includes(
        `${module}:export`
      ),
  };
}