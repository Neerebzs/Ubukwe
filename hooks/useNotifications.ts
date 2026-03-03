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
    queryFn: () => notificationsAPI.getNotifications(unreadOnly, limit),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  // Get unread count
  const { data: unreadCount = 0, refetch: refetchUnreadCount } = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsAPI.getUnreadCount(),
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
