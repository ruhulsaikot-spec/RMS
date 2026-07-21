"use client";

import { ReactNode } from "react";

import { useAuth } from "@/contexts/auth-context";

type ActionGuardProps = {
  permission: string;
  children: ReactNode;
};

export default function ActionGuard({
  permission,
  children,
}: ActionGuardProps) {
  const { permissions } = useAuth();

  const allowed =
    permissions.includes(
      permission
    );

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}