"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";

type UserType = {
  employeeId: string;
  employeeName: string;
  email: string;
  role: string;
  permissions: string[];
};

type UserContextType = {
  currentUser: UserType;

  isLoaded: boolean;

  setCurrentUser:
    React.Dispatch<
      React.SetStateAction<UserType>
    >;
};

const UserContext =
  createContext<UserContextType>({
    currentUser: {
      employeeId: "",
      employeeName: "",
      email: "",
      role: "",
      permissions: [],
    },

    isLoaded: false,

    setCurrentUser: () => {},
  });

export function UserProvider({
  children,
}: {
  children: ReactNode;
}) {

const [
  currentUser,
  setCurrentUser,
] = useState<UserType>({
  employeeId: "",
  employeeName: "",
  email: "",
  role: "",
  permissions: [],
});

const [
  isLoaded,
  setIsLoaded,
] = useState(false);

useEffect(() => {

  const storedUser =
    localStorage.getItem("user");

  if (storedUser) {

    try {

      const parsedUser =
        JSON.parse(storedUser);

      setCurrentUser({
        employeeId:
          parsedUser.employee_id ||
          parsedUser.employeeId ||
          parsedUser.id ||
          "",

        employeeName:
          parsedUser.full_name ||
          parsedUser.employeeName ||
          "",

        email:
          parsedUser.email ||
          "",

        role:
          parsedUser.roles?.[0] ||
          parsedUser.role ||
          "",

        permissions:
         parsedUser.permissions || [],
      });

    } catch (error) {

      console.error(
        "User Restore Error",
        error
      );

    }

  }

  setIsLoaded(true);

}, []);


  return (
    <UserContext.Provider
      value={{
        currentUser,
        isLoaded,
        setCurrentUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}