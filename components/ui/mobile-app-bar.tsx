"use client";

import { Bell, Menu, Search, MoreVertical, ArrowLeft } from "lucide-react";
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
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 md:hidden">
      <div className="flex items-center justify-between h-14 px-4">
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
          
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative p-2">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {notificationCount > 9 ? "9+" : notificationCount}
              </Badge>
            )}
          </Button>

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
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.full_name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem>Notifications</DropdownMenuItem>
                <DropdownMenuItem>Help & Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                {onLogout && (
                  <DropdownMenuItem onClick={onLogout} className="text-red-600">
                    Logout
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
