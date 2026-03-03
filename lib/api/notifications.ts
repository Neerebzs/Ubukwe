/**
 * Notifications API Client
 */

import { apiClient, API_ENDPOINTS } from '../api';

export interface Notification {
  id: string;
  notification_type: 'booking_created' | 'booking_confirmed' | 'booking_cancelled' | 'booking_completed' | 'payment_received' | 'payment_failed' | 'review_received' | 'verification_approved' | 'verification_rejected' | 'message';
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  related_booking_id: string | null;
  related_payment_id: string | null;
  related_review_id: string | null;
  extra_data: string | null;
}

export interface NotificationResponse {
  status: string;
  message: string;
  data: Notification[];
}

export interface UnreadCountResponse {
  status: string;
  message: string;
  data: {
    unread_count: number;
  };
}

const NOTIFICATIONS_BASE = `/api/v1/notifications`;

export const notificationsAPI = {
  /**
   * Get all notifications for current user
   */
  async getNotifications(unreadOnly: boolean = false, limit: number = 50): Promise<Notification[]> {
    const response = await apiClient.get<NotificationResponse>(
      `${NOTIFICATIONS_BASE}?unread_only=${unreadOnly}&limit=${limit}`
    );
    return response.data.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<UnreadCountResponse>(
      `${NOTIFICATIONS_BASE}/unread-count`
    );
    return response.data.data.unread_count;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.put(`${NOTIFICATIONS_BASE}/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.put(`${NOTIFICATIONS_BASE}/mark-all-read`);
  },
};
