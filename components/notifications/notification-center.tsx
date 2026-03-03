"use client";

import { useState } from "react";
import { Bell, CheckCheck, Filter, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationItem } from "./notification-item";
import { Badge } from "@/components/ui/badge";

export function NotificationCenter() {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const {
    notifications: allNotifications,
    isLoading: isLoadingAll,
    markAllAsRead,
    isMarkingAllAsRead,
    refetch: refetchAll,
  } = useNotifications(false, 100);

  const {
    notifications: unreadNotifications,
    isLoading: isLoadingUnread,
    refetch: refetchUnread,
  } = useNotifications(true, 100);

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Notifications</h1>
        <p className="text-slate-600">
          Stay updated with your bookings, payments, and important updates
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Notifications</CardDescription>
            <CardTitle className="text-3xl">{allNotifications.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Unread</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {unreadNotifications.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Read</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {allNotifications.length - unreadNotifications.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-slate-600" />
              <CardTitle>All Notifications</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
              {unreadNotifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAllAsRead}
                >
                  {isMarkingAllAsRead ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCheck className="h-4 w-4 mr-2" />
                  )}
                  Mark all as read
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "unread")}>
            <div className="px-6 pt-2 border-b">
              <TabsList>
                <TabsTrigger value="all" className="relative">
                  All
                  {allNotifications.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                      {allNotifications.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="unread" className="relative">
                  Unread
                  {unreadNotifications.length > 0 && (
                    <Badge variant="default" className="ml-2 h-5 px-1.5">
                      {unreadNotifications.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="m-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-slate-100 p-6 mb-4">
                    <Bell className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No notifications yet
                  </h3>
                  <p className="text-sm text-slate-500 max-w-sm">
                    You'll see notifications here when you have bookings, payments, or other important updates
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="unread" className="m-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-green-100 p-6 mb-4">
                    <CheckCheck className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    You're all caught up!
                  </h3>
                  <p className="text-sm text-slate-500 max-w-sm">
                    No unread notifications. Check back later for updates
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
