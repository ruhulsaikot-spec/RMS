"use client";

import {
  useEffect,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import { useUser } from "@/contexts/user-context";

export default function RouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {

  const router =
    useRouter();

  const pathname =
    usePathname();

  const {
    currentUser,
    isLoaded,
  } = useUser();

  useEffect(() => {

    if (!isLoaded) {
      return;
    }

    const publicRoutes = [
      "/",
    ];

    const isPublic =
      publicRoutes.includes(
        pathname
      );

    if (
      !isPublic &&
      !currentUser.employeeId
    ) {

      router.replace("/");

    }

  }, [
    pathname,
    currentUser,
    isLoaded,
    router,
  ]);

  if (!isLoaded) {

    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );

  }

  const publicRoutes = [
    "/",
  ];

  const isPublic =
    publicRoutes.includes(
      pathname
    );

  if (
    !isPublic &&
    !currentUser.employeeId
  ) {

    return null;

  }

  return <>{children}</>;
}