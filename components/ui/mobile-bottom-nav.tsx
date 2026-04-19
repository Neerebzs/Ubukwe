"use client";

import { Home, Calendar, Search, MessageCircle, User, DollarSign, BookOpen, Sparkles, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  userRole?: "customer" | "provider" | "admin";
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  isOnboardingApproved?: boolean;
}

export function MobileBottomNav({ userRole = "customer", activeTab, onTabChange, isOnboardingApproved = true }: MobileBottomNavProps) {
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

  // Provider navigation items — when onboarding is not approved, only show
  // overview and onboarding so the provider can complete registration.
  const providerNavItems = isOnboardingApproved
    ? [
        { id: "overview", label: "Home", icon: Home, path: "/provider/dashboard?tab=overview" },
        { id: "bookings", label: "Bookings", icon: BookOpen, path: "/provider/dashboard?tab=bookings" },
        { id: "services", label: "Services", icon: Search, path: "/provider/dashboard?tab=services" },
        { id: "earnings", label: "Earnings", icon: DollarSign, path: "/provider/dashboard?tab=earnings" },
        { id: "profile", label: "Profile", icon: User, path: "/provider/dashboard?tab=profile" },
      ]
    : [
        { id: "overview", label: "Home", icon: Home, path: "/provider/dashboard?tab=overview" },
        { id: "onboarding", label: "Onboarding", icon: User, path: "/provider/dashboard?tab=onboarding" },
      ];

  // Admin navigation items
  const adminNavItems = [
    { id: "overview", label: "Home", icon: Home, path: "/admin/dashboard?tab=overview" },
    { id: "users", label: "Users", icon: User, path: "/admin/dashboard?tab=users" },
    { id: "services", label: "Services", icon: BookOpen, path: "/admin/dashboard?tab=services" },
    { id: "events", label: "Events", icon: Calendar, path: "/admin/dashboard?tab=events" },
    { id: "system", label: "System", icon: Settings, path: "/admin/dashboard?tab=system" },
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
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg bg-white/95 backdrop-blur-2xl border border-white/20 rounded-full md:hidden shadow-[0_20px_50px_rgba(0,0,0,0.12)] px-2 py-2 flex items-center justify-around h-16">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab ? activeTab === item.id : pathname.includes(item.id);

        return (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={cn(
              "flex flex-col items-center justify-center transition-all duration-500 relative flex-1 h-full",
              isActive
                ? "text-[#668c65]"
                : "text-slate-400 hover:text-slate-600"
            )}
            aria-label={item.label}
          >
            <div className={cn(
              "p-2.5 rounded-full transition-all duration-500 flex items-center justify-center",
              isActive ? "bg-[#668c65]/10" : ""
            )}>
              <Icon className={cn("h-6 w-6", isActive && "stroke-[2.2px]")} />
            </div>
            {isActive && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#668c65] rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
