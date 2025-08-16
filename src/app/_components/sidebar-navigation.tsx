"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { type UserRole } from "@prisma/client";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";
import {
  Home,
  Users,
  Settings,
  BarChart3,
  FileText,
  Calendar,
  ClipboardList,
  CheckCircle,
  Package,
  CreditCard,
  LogOut,
  UserCheck,
  TrendingUp
} from "lucide-react";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

interface SidebarNavigationProps {
  role: UserRole;
}

const getNavigationItems = (role: UserRole, pathname: string): NavigationItem[] => {
  switch (role) {
    case "ADMIN":
      return [
        { name: "Dashboard", href: "/admin", icon: Home, current: pathname === "/admin" },
        { name: "User Management", href: "/admin/users", icon: Users, current: pathname === "/admin/users" },
        { name: "System Settings", href: "/admin/settings", icon: Settings, current: pathname === "/admin/settings" },
        { name: "Reports", href: "/admin/reports", icon: BarChart3, current: pathname === "/admin/reports" },
        { name: "Audit Logs", href: "/admin/logs", icon: FileText, current: pathname === "/admin/logs" },
      ];

    case "MANAGER":
      return [
        { name: "Dashboard", href: "/manager", icon: Home, current: pathname === "/manager" },
        { name: "Operations", href: "/manager/operations", icon: Settings, current: pathname === "/manager/operations" },
        { name: "Staff Oversight", href: "/manager/staff", icon: UserCheck, current: pathname === "/manager/staff" },
        { name: "Performance", href: "/manager/performance", icon: BarChart3, current: pathname === "/manager/performance" },
        { name: "Scheduling", href: "/manager/scheduling", icon: Calendar, current: pathname === "/manager/scheduling" },
        { name: "Quality Control", href: "/manager/quality", icon: CheckCircle, current: pathname === "/manager/quality" },
      ];

    case "SECRETARY":
      return [
        { name: "Dashboard", href: "/secretary", icon: Home, current: pathname === "/secretary" },
        { name: "Record Vehicle", href: "/secretary/record-vehicle", icon: FileText, current: pathname === "/secretary/record-vehicle" },
        { name: "Record Sales", href: "/secretary/record-sales", icon: FileText, current: pathname === "/secretary/record-sales" },
      ];

    case "MECHANIC":
      return [
        { name: "Dashboard", href: "/mechanic", icon: Home, current: pathname === "/mechanic" },
        { name: "Work Orders", href: "/mechanic/work-orders", icon: ClipboardList, current: pathname === "/mechanic/work-orders" },
        { name: "Inspections", href: "/mechanic/inspections", icon: CheckCircle, current: pathname === "/mechanic/inspections" },
        { name: "Parts Inventory", href: "/mechanic/inventory", icon: Package, current: pathname === "/mechanic/inventory" },
        { name: "My Schedule", href: "/mechanic/schedule", icon: Calendar, current: pathname === "/mechanic/schedule" },
      ];

    case "PROPRIETOR":
      return [
        { name: "Dashboard", href: "/proprietor", icon: Home, current: pathname === "/proprietor" },
        { name: "Analytics", href: "/proprietor/analytics", icon: TrendingUp, current: pathname === "/proprietor/analytics" },
        { name: "Finances", href: "/proprietor/finances", icon: CreditCard, current: pathname === "/proprietor/finances" },
        { name: "Staff Management", href: "/proprietor/staff", icon: Users, current: pathname === "/proprietor/staff" },
        { name: "Business Reports", href: "/proprietor/reports", icon: FileText, current: pathname === "/proprietor/reports" },
      ];

    default:
      return [];
  }
};

const getRoleBadgeVariant = (role: UserRole) => {
  switch (role) {
    case "ADMIN": return "default";
    case "MANAGER": return "secondary";
    case "SECRETARY": return "outline";
    case "MECHANIC": return "destructive";
    case "PROPRIETOR": return "default";
    default: return "secondary";
  }
};

export default function SidebarNavigation({ role }: SidebarNavigationProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const navigation = getNavigationItems(role, pathname);

  return (
    <div className="flex flex-col w-64 border-r bg-card">
      {/* Logo/Header */}
      <div className="flex items-center justify-center h-16 px-4 border-b bg-primary">
        <h1 className="text-xl font-bold text-primary-foreground">MVMIS</h1>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-muted">
              {session?.user?.name?.charAt(0) ?? 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {session?.user?.name}
            </p>
            <Badge variant={getRoleBadgeVariant(role)} className="text-xs mt-1">
              {role}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={item.current ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-10 px-3",
                  item.current && "bg-secondary text-secondary-foreground"
                )}
              >
                <Icon className="mr-3 h-4 w-4" />
                <span className="text-sm">{item.name}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="flex-shrink-0 px-3 py-4 border-t">
        <Button
          variant="ghost"
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full justify-start h-10 px-3 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="text-sm">Sign Out</span>
        </Button>
      </div>
    </div>
  );
}
