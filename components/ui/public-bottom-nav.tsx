"use client";

import { Home, Briefcase, Info, User, Calendar } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { TranslatedText } from "@/components/translated-text";
import { useAuth } from "@/hooks/useAuth";
import { useMobileMenu } from "@/contexts/mobile-menu-context";

export function PublicBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { openMenu } = useMobileMenu();

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      path: "/"
    },
    {
      id: "services",
      label: "Services",
      icon: Briefcase,
      path: "/services"
    },
    {
      id: "events",
      label: "Events",
      icon: Calendar,
      path: "/events"
    },
    {
      id: "about",
      label: "About",
      icon: Info,
      path: "/about"
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      path: "/auth/signin"
    },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.id === "profile" && isAuthenticated) {
      openMenu();
      return;
    }
    router.push(item.path);
  };

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-white/90 backdrop-blur-2xl border border-white/20 rounded-full md:hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] px-2 py-2 flex items-center justify-around h-16">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;

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
