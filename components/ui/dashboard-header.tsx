"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Globe,
  LogOut,
  Menu,
  Settings,
  User,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/hooks/useTranslation";

interface DashboardHeaderProps {
  user: {
    full_name: string;
    role: string;
    profile_image_url?: string;
  };
  onLogout: () => void;
  onToggleSidebar?: () => void;
  onToggleMobileMenu?: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
}

export function DashboardHeader({
  user,
  onLogout,
  onToggleSidebar,
  onToggleMobileMenu,
  title,
  subtitle
}: DashboardHeaderProps) {
  const initials = user.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : "U";

  const { language, setLanguage } = useTranslation();

  const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/70 backdrop-blur-2xl w-full" role="banner">
      <div className="px-6 py-4 h-20 flex items-center justify-between gap-6">
        {/* Left Side: Toggle buttons and Editorial Title */}
        <div className="flex items-center gap-6 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {onToggleMobileMenu && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleMobileMenu}
                className="md:hidden flex-shrink-0 h-10 w-10 rounded-full hover:bg-[#608d64]/5 text-slate-400"
                aria-label="Toggle mobile menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            {onToggleSidebar && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSidebar}
                className="hidden md:flex flex-shrink-0 h-10 w-10 rounded-full hover:bg-[#608d64]/5 text-slate-400 hover:text-[#608d64] transition-all"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>

          <div className="min-w-0 flex flex-col justify-center border-l border-slate-100 pl-6">
            {title && (
              <div className="text-xl md:text-2xl font-serif italic text-slate-900 truncate leading-tight tracking-tight">
                {title}
              </div>
            )}
            {subtitle && (
              <div className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.3em] truncate leading-tight mt-1">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Global Tools & User Sanctuary */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {/* Language Selector - Redesigned */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-slate-50 text-slate-400 group" title="Switch Language">
                <Globe className="h-5 w-5 group-hover:text-[#608d64] transition-colors" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-slate-100 bg-white/95 backdrop-blur-xl">
              <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Narrative</DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1 bg-slate-50" />
              <div className="grid grid-cols-1 gap-1">
                {LANGUAGES.map(lang => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`rounded-xl px-3 py-2 text-sm transition-all focus:bg-[#608d64]/5 focus:text-[#608d64] cursor-pointer ${language === lang.code ? 'bg-[#608d64]/10 text-[#608d64] font-bold' : 'text-slate-600'
                      }`}
                  >
                    <span className="mr-3 text-base">{lang.flag}</span>
                    <span className="tracking-tight">{lang.name}</span>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications - Redesigned */}
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-slate-50 text-slate-400 group relative" title="Notifications">
            <Bell className="h-5 w-5 group-hover:text-[#608d64] transition-colors" />
            <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#608d64] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#608d64]"></span>
            </span>
          </Button>

          <div className="h-6 w-[1px] bg-slate-100 hidden sm:block mx-1" />

          {/* User Sanctuary Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-12 p-1.5 pl-3 gap-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                <div className="text-right hidden sm:block min-w-0">
                  <p className="text-sm font-bold text-slate-900 leading-none truncate">{user.full_name}</p>
                  <p className="text-[9px] text-[#608d64] font-black uppercase tracking-[0.25em] mt-1.5">{user.role}</p>
                </div>
                <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-slate-100">
                  <AvatarImage src={user.profile_image_url} alt={user.full_name} />
                  <AvatarFallback className="text-xs bg-[#608d64]/10 text-[#608d64] font-black">{initials}</AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-slate-300 hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-2xl border-slate-100 bg-white/95 backdrop-blur-xl">
              <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Your Sanctuary</DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1 bg-slate-50" />
              <DropdownMenuItem className="rounded-xl px-3 py-2.5 text-sm text-slate-600 focus:bg-[#608d64]/5 focus:text-[#608d64] transition-all cursor-pointer">
                <User className="mr-3 h-4 w-4 text-slate-400" />
                <span className="font-medium tracking-tight">Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl px-3 py-2.5 text-sm text-slate-600 focus:bg-[#608d64]/5 focus:text-[#608d64] transition-all cursor-pointer">
                <Settings className="mr-3 h-4 w-4 text-slate-400" />
                <span className="font-medium tracking-tight">Preferences</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-slate-50" />
              <DropdownMenuItem
                variant="destructive"
                onClick={onLogout}
                className="rounded-xl px-3 py-2.5 text-sm focus:bg-red-50 focus:text-red-500 transition-all cursor-pointer"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span className="font-bold tracking-tight">Logout of Collective</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
