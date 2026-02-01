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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden safe-area-bottom shadow-lg">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
              <span className="text-xs font-medium">
                <TranslatedText text={item.label} />
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
