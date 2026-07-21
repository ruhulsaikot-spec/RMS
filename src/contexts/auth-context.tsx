"use client";

import {
  createContext,
  useContext,
  ReactNode,
} from "react";

import { useUser } from "@/contexts/user-context";

type AuthContextType = {
  role: string;
  setRole: (
    role: string
  ) => void;

  permissions: string[];
};

const AuthContext =
  createContext<AuthContextType>({
    role: "",
    setRole: () => {},
    permissions: [],
  });

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {

  const {
    currentUser,
  } = useUser();

  return (
    <AuthContext.Provider
      value={{
        role: currentUser.role,
        setRole: () => {},
        permissions:
          currentUser.permissions || [],
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}