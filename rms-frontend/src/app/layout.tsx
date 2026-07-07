import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { RBACProvider } from "@/contexts/rbac-context";
import { UserProvider } from "@/contexts/user-context";
import { UserManagementProvider } from "@/contexts/user-management-context";
import RouteGuard from "@/components/auth/route-guard";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "RMS - Reimbursement Management System",
  description: "Enterprise Reimbursement Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} h-full antialiased`}
    >
      <body
        className={`${plusJakarta.className} min-h-full flex flex-col`}
        >

          <RBACProvider>

          <UserManagementProvider>

          <UserProvider>

            <AuthProvider>

              <RouteGuard>
          

              {children}

              <Toaster
                position="top-center"
                richColors
                toastOptions={{
                  className:
                    "bg-[#102E67] text-white border border-cyan-500/20 shadow-2xl",
                }}
              />

            </RouteGuard>

          </AuthProvider>

          </UserProvider>

          </UserManagementProvider>

        </RBACProvider>
    </body>
    </html>
  );
}