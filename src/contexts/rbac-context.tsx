"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
} from "react";

import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/default-role-permissions";

type RBACContextType = {
  rolePermissions: typeof DEFAULT_ROLE_PERMISSIONS;

  setRolePermissions: React.Dispatch<
    React.SetStateAction<
      typeof DEFAULT_ROLE_PERMISSIONS
    >
  >;
};

const RBACContext =
  createContext<RBACContextType>({
    rolePermissions:
      DEFAULT_ROLE_PERMISSIONS,

    setRolePermissions: () => {},
  });

export function RBACProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    rolePermissions,
    setRolePermissions,
  ] = useState(
    DEFAULT_ROLE_PERMISSIONS
  );

  return (
    <RBACContext.Provider
      value={{
        rolePermissions,
        setRolePermissions,
      }}
    >
      {children}
    </RBACContext.Provider>
  );
}

export function useRBACContext() {
  return useContext(RBACContext);
}