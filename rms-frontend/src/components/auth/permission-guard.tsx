"use client";

import { ReactNode } from "react";

import { useAuth } from "@/contexts/auth-context";
import { useUser } from "@/contexts/user-context";

type PermissionGuardProps = {
  permission: string;
  children: ReactNode;
};

export default function PermissionGuard({
  permission,
  children,
}: PermissionGuardProps) {

  const { permissions } = useAuth();

  const { isLoaded } =
    useUser();

  if (!isLoaded) {

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-white/60">
          Loading...
        </div>
      </div>
    );

  }

  const allowed =
    permissions.includes(
      permission
    );

  if (!allowed) {

    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">

          <h2 className="mb-2 text-xl font-semibold text-red-300">
            Access Denied
          </h2>

          <p className="text-sm text-white/70">
            You do not have permission to access this page.
          </p>

        </div>
      </div>
    );

  }

  return <>{children}</>;
}