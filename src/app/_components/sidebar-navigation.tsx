"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { type UserRole } from "@prisma/client";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

interface SidebarNavigationProps {
  role: UserRole;
}

// Icon components
const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const CogIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ChartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const DocumentIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClipboardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);


const CreditCardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const getNavigationItems = (role: UserRole, pathname: string): NavigationItem[] => {
  const baseItems: NavigationItem[] = [];

  switch (role) {
    case "ADMIN":
      return [
        { name: "Dashboard", href: "/admin", icon: HomeIcon, current: pathname === "/admin" },
        { name: "User Management", href: "/admin/users", icon: UsersIcon, current: pathname === "/admin/users" },
        { name: "System Settings", href: "/admin/settings", icon: CogIcon, current: pathname === "/admin/settings" },
        { name: "Reports", href: "/admin/reports", icon: ChartIcon, current: pathname === "/admin/reports" },
        { name: "Audit Logs", href: "/admin/logs", icon: DocumentIcon, current: pathname === "/admin/logs" },
      ];

    case "MANAGER":
      return [
        { name: "Dashboard", href: "/manager", icon: HomeIcon, current: pathname === "/manager" },
        { name: "Operations", href: "/manager/operations", icon: CogIcon, current: pathname === "/manager/operations" },
        { name: "Staff Oversight", href: "/manager/staff", icon: UsersIcon, current: pathname === "/manager/staff" },
        { name: "Performance", href: "/manager/performance", icon: ChartIcon, current: pathname === "/manager/performance" },
        { name: "Scheduling", href: "/manager/scheduling", icon: CalendarIcon, current: pathname === "/manager/scheduling" },
        { name: "Quality Control", href: "/manager/quality", icon: CheckCircleIcon, current: pathname === "/manager/quality" },
      ];

    case "SECRETARY":
      return [
        { name: "Dashboard", href: "/secretary", icon: HomeIcon, current: pathname === "/secretary" },
        { name: "Documents", href: "/secretary/documents", icon: DocumentIcon, current: pathname === "/secretary/documents" },
        { name: "Appointments", href: "/secretary/appointments", icon: CalendarIcon, current: pathname === "/secretary/appointments" },
        { name: "Customer Records", href: "/secretary/customers", icon: UsersIcon, current: pathname === "/secretary/customers" },
        { name: "Tasks", href: "/secretary/tasks", icon: ClipboardIcon, current: pathname === "/secretary/tasks" },
      ];

    case "MECHANIC":
      return [
        { name: "Dashboard", href: "/mechanic", icon: HomeIcon, current: pathname === "/mechanic" },
        { name: "Work Orders", href: "/mechanic/work-orders", icon: ClipboardIcon, current: pathname === "/mechanic/work-orders" },
        { name: "Inspections", href: "/mechanic/inspections", icon: CheckCircleIcon, current: pathname === "/mechanic/inspections" },
        { name: "Parts Inventory", href: "/mechanic/inventory", icon: CubeIcon, current: pathname === "/mechanic/inventory" },
        { name: "My Schedule", href: "/mechanic/schedule", icon: CalendarIcon, current: pathname === "/mechanic/schedule" },
      ];

    case "PROPRIETOR":
      return [
        { name: "Dashboard", href: "/proprietor", icon: HomeIcon, current: pathname === "/proprietor" },
        { name: "Analytics", href: "/proprietor/analytics", icon: ChartIcon, current: pathname === "/proprietor/analytics" },
        { name: "Finances", href: "/proprietor/finances", icon: CreditCardIcon, current: pathname === "/proprietor/finances" },
        { name: "Staff Management", href: "/proprietor/staff", icon: UsersIcon, current: pathname === "/proprietor/staff" },
        { name: "Business Reports", href: "/proprietor/reports", icon: DocumentIcon, current: pathname === "/proprietor/reports" },
      ];

    default:
      return baseItems;
  }
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function SidebarNavigation({ role }: SidebarNavigationProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const navigation = getNavigationItems(role, pathname);

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "ADMIN": return "text-indigo-600";
      case "MANAGER": return "text-purple-600";
      case "SECRETARY": return "text-blue-600";
      case "MECHANIC": return "text-orange-600";
      case "PROPRIETOR": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const getRoleBgColor = (role: UserRole) => {
    switch (role) {
      case "ADMIN": return "bg-indigo-50";
      case "MANAGER": return "bg-purple-50";
      case "SECRETARY": return "bg-blue-50";
      case "MECHANIC": return "bg-orange-50";
      case "PROPRIETOR": return "bg-green-50";
      default: return "bg-gray-50";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="flex flex-col w-64 bg-white shadow-lg">
        {/* Logo/Header */}
        <div className="flex items-center justify-center h-16 px-4 bg-gray-900">
          <h1 className="text-xl font-bold text-white">MVMIS</h1>
        </div>

        {/* User Info */}
        <div className={`px-4 py-4 border-b ${getRoleBgColor(role)}`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {session?.user?.name?.charAt(0) ?? 'U'}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
              <p className={`text-xs font-semibold ${getRoleColor(role)}`}>{role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={classNames(
                item.current
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
              )}
            >
              <item.icon
                className={classNames(
                  item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                  'mr-3 flex-shrink-0 h-5 w-5'
                )}
              />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="flex-shrink-0 px-2 py-4 border-t">
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
          >
            <svg
              className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
