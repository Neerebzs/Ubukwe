"use client";

import { Home, Calendar, Search, MessageCircle, User, DollarSign, BookOpen } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  userRole?: "customer" | "provider" | "admin";
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function MobileBottomNav({ userRole = "customer", activeTab, onTabChange }: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Customer navigation items
  const customerNavItems = [
    { id: "overview", label: "Home", icon: Home, path: "/customer/dashboard?tab=overview" },
    { id: "planning", label: "Tasks", icon: Calendar, path: "/customer/dashboard?tab=planning" },
    { id: "vendors", label: "Vendors", icon: Search, path: "/customer/dashboard?tab=vendors" },
    { id: "budget", label: "Budget", icon: DollarSign, path: "/customer/dashboard?tab=budget" },
    { id: "messages", label: "Messages", icon: MessageCircle, path: "/customer/dashboard?tab=messages" },
  ];

  // Provider navigation items
  const providerNavItems = [
    { id: "overview", label: "Home", icon: Home, path: "/provider/dashboard?tab=overview" },
    { id: "bookings", label: "Bookings", icon: BookOpen, path: "/provider/dashboard?tab=bookings" },
    { id: "services", label: "Services", icon: Search, path: "/provider/dashboard?tab=services" },
    { id: "earnings", label: "Earnings", icon: DollarSign, path: "/provider/dashboard?tab=earnings" },
    { id: "profile", label: "Profile", icon: User, path: "/provider/dashboard?tab=profile" },
  ];

  // Admin navigation items
  const adminNavItems = [
    { id: "overview", label: "Home", icon: Home, path: "/admin/dashboard?tab=overview" },
    { id: "users", label: "Users", icon: User, path: "/admin/dashboard?tab=users" },
    { id: "providers", label: "Onboarding", icon: Search, path: "/admin/dashboard?tab=providers" },
    { id: "services", label: "Services", icon: BookOpen, path: "/admin/dashboard?tab=services" },
    { id: "analytics", label: "Analytics", icon: DollarSign, path: "/admin/dashboard?tab=analytics" },
  ];

  const navItems = 
    userRole === "provider" ? providerNavItems :
    userRole === "admin" ? adminNavItems :
    customerNavItems;

  const handleNavClick = (item: typeof navItems[0]) => {
    if (onTabChange) {
      onTabChange(item.id);
    } else {
      router.push(item.path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab ? activeTab === item.id : pathname.includes(item.id);
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
