"use client";

import { Bell, Menu, Search, MoreVertical, ArrowLeft, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { NotificationBell } from "@/components/notifications/notification-bell";
import Link from "next/link";

interface MobileAppBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onMenuClick?: () => void;
  user?: {
    full_name?: string;
    email: string;
    profile_image_url?: string;
    role?: string;
  };
  onLogout?: () => void;
  notificationCount?: number;
}

export function MobileAppBar({
  title,
  subtitle,
  showBack = false,
  onBack,
  onMenuClick,
  user,
  onLogout,
  notificationCount = 0,
}: MobileAppBarProps) {
  
  const getProfilePath = () => {
    if (user?.role === 'admin') return '/admin/dashboard?tab=profile';
    if (user?.role === 'service_provider') return '/provider/dashboard?tab=profile';
    if (user?.role === 'event_owner') return '/customer/dashboard?tab=profile';
    return '/customer/dashboard?tab=profile';
  };

  const getPreferencesPath = () => {
    if (user?.role === 'admin') return '/admin/dashboard?tab=preferences';
    if (user?.role === 'service_provider') return '/provider/dashboard?tab=preferences';
    if (user?.role === 'event_owner') return '/customer/dashboard?tab=preferences';
    return '/customer/dashboard?tab=preferences';
  };
  
  return (
    <header className="sticky top-0 z-40 w-full bg-[#fdfcfb] border-b border-slate-100 md:hidden shadow-sm">
      <div className="flex items-center justify-between h-20 px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {showBack ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2 -ml-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            onMenuClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMenuClick}
                className="p-2 -ml-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )
          )}

          <div className="flex-1 min-w-0 border-l border-slate-100 pl-4">
            <h1 className="text-xl font-serif italic text-slate-900 tracking-tight truncate">{title}</h1>
            {subtitle && (
              <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.2em] truncate mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <NotificationBell variant="mobile" />

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profile_image_url} alt={user.full_name || user.email} />
                    <AvatarFallback className="text-xs">
                      {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-2xl border-slate-100 bg-white/95 backdrop-blur-xl">
                <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Your Sanctuary</DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1 bg-slate-50" />
                <DropdownMenuItem 
                  asChild
                  className="rounded-xl px-3 py-2.5 text-sm text-slate-600 focus:bg-[#668c65]/5 focus:text-[#668c65] transition-all cursor-pointer"
                >
                  <Link href={getProfilePath()}>
                    <User className="mr-3 h-4 w-4 text-slate-400" />
                    <span className="font-medium tracking-tight">Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  asChild
                  className="rounded-xl px-3 py-2.5 text-sm text-slate-600 focus:bg-[#668c65]/5 focus:text-[#668c65] transition-all cursor-pointer"
                >
                  <Link href={getPreferencesPath()}>
                    <Settings className="mr-3 h-4 w-4 text-slate-400" />
                    <span className="font-medium tracking-tight">Preferences</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-slate-50" />
                {onLogout && (
                  <DropdownMenuItem
                    onClick={onLogout}
                    className="text-red-500 rounded-xl px-3 py-2.5 text-sm focus:bg-red-50 focus:text-red-600 transition-all cursor-pointer"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-bold tracking-tight">Logout of Collective</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
