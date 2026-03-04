"use client";

import { Home, Briefcase, Info, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { TranslatedText } from "@/components/translated-text";

export function PublicBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

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

  const handleNavClick = (path: string) => {
    router.push(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#fdfcfb]/80 backdrop-blur-xl border-t border-slate-100 md:hidden safe-area-bottom shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-4 h-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1.5 transition-all duration-500 relative",
                isActive
                  ? "text-[#668c65]"
                  : "text-slate-800 hover:text-slate-900"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-500",
                isActive ? "bg-[#668c65]/10 shadow-[0_0_15px_-3px_rgba(13,148,136,0.3)]" : ""
              )}>
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
              </div>
              <span className={cn(
                "text-[8px] font-black uppercase tracking-[0.2em]",
                isActive ? "opacity-100" : "opacity-60"
              )}>
                <TranslatedText text={item.label} />
              </span>
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
