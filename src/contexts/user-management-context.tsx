"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
} from "react";

export type UserAccount = {
  id: number;
  employeeId: string;
  employeeName: string;
  email: string;
  role: string;
  password: string;
  status: string;
};

type UserManagementContextType = {
  users: UserAccount[];

  setUsers: React.Dispatch<
    React.SetStateAction<UserAccount[]>
  >;
};

const UserManagementContext =
  createContext<UserManagementContextType>({
    users: [],
    setUsers: () => {},
  });

export function UserManagementProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [users, setUsers] = useState<UserAccount[]>([
    {
      id: 1,
      employeeId: "EMP-001",
      employeeName: "System Administrator",
      email: "admin@rms.com",
      role: "System Administrator",
      password: "Password@123",
      status: "Active",
    },
    {
      id: 2,
      employeeId: "EMP-002",
      employeeName: "John Smith",
      email: "john.smith@rms.com",
      role: "Finance Manager",
      password: "Password@123",
      status: "Active",
    },
    {
      id: 3,
      employeeId: "EMP-003",
      employeeName: "Sarah Ahmed",
      email: "sarah.ahmed@rms.com",
      role: "Employee",
      password: "Password@123",
      status: "Inactive",
    },
  ]);

  return (
    <UserManagementContext.Provider
      value={{
        users,
        setUsers,
      }}
    >
      {children}
    </UserManagementContext.Provider>
  );
}

export function useUserManagement() {
  return useContext(
    UserManagementContext
  );
}