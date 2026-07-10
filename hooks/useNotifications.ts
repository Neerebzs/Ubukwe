'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI, Notification } from '@/lib/api/notifications';
import { queryKeys, realtimeQueryOptions, invalidateNotifications } from '@/lib/cache';
import { toast } from 'sonner';

// Re-export for any component that imported keys directly from this file
export const notificationKeys = queryKeys.notifications;

export const useNotifications = (unreadOnly: boolean = false, limit: number = 50) => {
  const queryClient = useQueryClient();

  // ── Notification list ────────────────────────────────────────────────────
  // Real-time: staleTime 0 + 60 s poll. Users must always see fresh data.
  const { data: notifications = [], isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.notifications.list(unreadOnly),
    queryFn: () => notificationsAPI.getNotifications(unreadOnly, limit),
    ...realtimeQueryOptions,
  });

  // ── Unread badge count ───────────────────────────────────────────────────
  // Separate query so the badge can update independently of the full list.
  const { data: unreadCount = 0, refetch: refetchUnreadCount } = useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => notificationsAPI.getUnreadCount(),
    ...realtimeQueryOptions,
  });

  // ── Mark single notification as read ────────────────────────────────────
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsAPI.markAsRead(notificationId),
    onSuccess: () => {
      // Invalidate both the list and the unread count badge
      invalidateNotifications(queryClient);
    },
    onError: () => {
      toast.error('Failed to mark notification as read');
    },
  });

  // ── Mark all notifications as read ──────────────────────────────────────
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsAPI.markAllAsRead(),
    onSuccess: () => {
      invalidateNotifications(queryClient);
      toast.success('All notifications marked as read');
    },
    onError: () => {
      toast.error('Failed to mark all notifications as read');
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    refetchUnreadCount,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};
