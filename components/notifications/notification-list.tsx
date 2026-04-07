"use client";

import { useState } from "react";
import { Bell, Check, CheckCheck, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationItem } from "./notification-item";
import { Separator } from "@/components/ui/separator";

interface NotificationListProps {
  onClose?: () => void;
}

export function NotificationList({ onClose }: NotificationListProps) {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  
  const {
    notifications: allNotifications,
    isLoading: isLoadingAll,
    markAllAsRead,
    isMarkingAllAsRead,
    refetch: refetchAll,
  } = useNotifications(false, 50);

  const {
    notifications: unreadNotifications,
    isLoading: isLoadingUnread,
    refetch: refetchUnread,
  } = useNotifications(true, 50);

  const notifications = activeTab === "all" ? allNotifications : unreadNotifications;
  const isLoading = activeTab === "all" ? isLoadingAll : isLoadingUnread;

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleRefresh = () => {
    if (activeTab === "all") {
      refetchAll();
    } else {
      refetchUnread();
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            {unreadNotifications.length > 0 && (
              <Badge 
                variant="destructive" 
                className="ml-1 px-2 py-0.5 text-xs font-bold"
              >
                {unreadNotifications.length} new
              </Badge>
            )}
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "unread")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">
              All
              {allNotifications.length > 0 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({allNotifications.length})
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadNotifications.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                  {unreadNotifications.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-b bg-slate-50">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-8 text-xs"
            >
              Refresh
            </Button>
            {activeTab === "all" && unreadNotifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAllAsRead}
                className="h-8 text-xs"
              >
                {isMarkingAllAsRead ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <CheckCheck className="h-3 w-3 mr-1" />
                )}
                Mark all as read
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Notification List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="rounded-full bg-slate-100 p-4 mb-3">
              <Bell className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-900 mb-1">
              No notifications
            </p>
            <p className="text-xs text-slate-500">
              {activeTab === "unread"
                ? "You're all caught up!"
                : "You'll see notifications here when you have them"}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification, index) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                showDivider={index < notifications.length - 1}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
