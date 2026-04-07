"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationList } from "./notification-list";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationBellProps {
  variant?: "default" | "mobile";
}

export function NotificationBell({ variant = "default" }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, error } = useNotifications();

  // Debug logging
  console.log('🔔 NotificationBell render:', { unreadCount, error, isOpen });
  console.log('🔔 unreadCount type:', typeof unreadCount, 'value:', unreadCount);

  const hasUnread = unreadCount && unreadCount > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={variant === "mobile" ? "sm" : "icon"}
          className={`relative ${
            variant === "mobile"
              ? "p-2"
              : "h-10 w-10 rounded-full hover:bg-slate-50"
          }`}
          title={`Notifications${hasUnread ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className={`h-5 w-5 ${hasUnread ? 'text-slate-700' : 'text-slate-500'}`} />
          {hasUnread && (
            <>
              {/* Pulsing ring effect */}
              <span className="absolute top-0 right-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              {/* Badge with count */}
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold border-2 border-white shadow-lg">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[380px] p-0"
        align="end"
        sideOffset={8}
      >
        <NotificationList onClose={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
