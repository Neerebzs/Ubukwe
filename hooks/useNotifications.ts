'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI, Notification } from '@/lib/api/notifications';
import { toast } from 'sonner';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (unreadOnly?: boolean) => [...notificationKeys.all, 'list', { unreadOnly }] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

export const useNotifications = (unreadOnly: boolean = false, limit: number = 50) => {
  const queryClient = useQueryClient();

  // Get notifications
  const { data: notifications = [], isLoading, error, refetch } = useQuery({
    queryKey: notificationKeys.list(unreadOnly),
    queryFn: async () => {
      try {
        console.log('🔔 useNotifications: Fetching notifications...');
        const result = await notificationsAPI.getNotifications(unreadOnly, limit);
        console.log('🔔 useNotifications: Received notifications:', result);
        return result;
      } catch (err) {
        console.error('❌ useNotifications: Error fetching notifications:', err);
        throw err;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  // Get unread count
  const { data: unreadCount = 0, refetch: refetchUnreadCount } = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      try {
        console.log('🔔 useNotifications: Fetching unread count...');
        const result = await notificationsAPI.getUnreadCount();
        console.log('🔔 useNotifications: Received unread count:', result);
        return result;
      } catch (err) {
        console.error('❌ useNotifications: Error fetching unread count:', err);
        return 0;
      }
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsAPI.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: () => {
      toast.error('Failed to mark notification as read');
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
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
