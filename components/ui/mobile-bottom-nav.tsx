"use client";

import { Home, Calendar, Search, MessageCircle, User, DollarSign, BookOpen, Sparkles } from "lucide-react";
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
    { id: "ai-assistant", label: "AI", icon: Sparkles, path: "/customer/dashboard?tab=ai-assistant" },
    { id: "vendors", label: "Vendors", icon: Search, path: "/customer/dashboard?tab=vendors" },
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
    { id: "events", label: "Events", icon: Calendar, path: "/admin/dashboard?tab=events" },
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#fdfcfb]/80 backdrop-blur-xl border-t border-slate-100 md:hidden safe-area-bottom shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-5 h-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab ? activeTab === item.id : pathname.includes(item.id);

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1.5 transition-all duration-500 relative",
                isActive
                  ? "text-[#668c65]"
                  : "text-slate-800 hover:text-slate-900"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-500",
                isActive ? "bg-[#668c65]/10 shadow-[0_0_15px_-3px_rgba(102,140,101,0.3)]" : ""
              )}>
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
              </div>
              <span className={cn(
                "text-[8px] font-black uppercase tracking-[0.2em]",
                isActive ? "opacity-100" : "opacity-60"
              )}>{item.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#668c65] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
