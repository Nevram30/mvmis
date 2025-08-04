"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { type UserRole } from "@prisma/client";
import SidebarNavigation from "./sidebar-navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export default function DashboardLayout({ 
  children, 
  allowedRoles, 
  redirectTo = "/auth/login" 
}: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push(redirectTo);
      return;
    }

    if (!allowedRoles.includes(session.user.role)) {
      // Redirect to appropriate page based on user role
      switch (session.user.role) {
        case "ADMIN":
          router.push("/admin");
          break;
        case "MANAGER":
          router.push("/manager");
          break;
        case "SECRETARY":
          router.push("/secretary");
          break;
        case "MECHANIC":
          router.push("/mechanic");
          break;
        case "PROPRIETOR":
          router.push("/proprietor");
          break;
        default:
          router.push("/");
      }
      return;
    }
  }, [session, status, router, allowedRoles, redirectTo]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session || !allowedRoles.includes(session.user.role)) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <SidebarNavigation role={session.user.role} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
