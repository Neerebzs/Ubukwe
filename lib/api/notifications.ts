/**
 * Notifications API Client
 */

import { apiClient, API_ENDPOINTS } from '../api';

export interface Notification {
  id: string;
  notification_type: 'booking_created' | 'booking_confirmed' | 'booking_cancelled' | 'booking_completed' | 'payment_received' | 'payment_failed' | 'review_received' | 'verification_approved' | 'verification_rejected' | 'event_submitted' | 'event_approved' | 'event_rejected' | 'message';
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  related_booking_id: string | null;
  related_payment_id: string | null;
  related_review_id: string | null;
  related_event_id: string | null;
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
    console.log('🔔 Fetching notifications:', { unreadOnly, limit });
    
    const response = await apiClient.get<NotificationResponse>(
      `${NOTIFICATIONS_BASE}?unread_only=${unreadOnly}&limit=${limit}`
    );
    
    console.log('🔔 Notifications response:', response);
    console.log('🔔 Response.data:', response.data);
    
    // Handle both wrapped and unwrapped responses
    if (Array.isArray(response.data)) {
      // Direct array response
      console.log('🔔 Returning direct array:', response.data);
      return response.data as Notification[];
    } else if (response.data && response.data.data) {
      // Wrapped response
      console.log('🔔 Returning wrapped data:', response.data.data);
      return response.data.data;
    } else {
      console.error('❌ Invalid response format:', response.data);
      throw new Error('Invalid response format from notifications API');
    }
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    console.log('🔔 Fetching unread count');
    
    try {
      const response = await apiClient.get<UnreadCountResponse>(
        `${NOTIFICATIONS_BASE}/unread-count`
      );
      
      console.log('🔔 Unread count full response:', response);
      console.log('🔔 Response.data:', response.data);
      
      // Handle multiple response formats
      if (typeof response.data === 'number') {
        // Direct number response
        console.log('🔔 Returning direct number:', response.data);
        return response.data;
      } else if (response.data && typeof response.data.unread_count === 'number') {
        // Flat response with unread_count
        console.log('🔔 Returning flat unread_count:', response.data.unread_count);
        return response.data.unread_count;
      } else if (response.data && response.data.data && typeof response.data.data.unread_count === 'number') {
        // Wrapped response
        console.log('🔔 Returning wrapped unread count:', response.data.data.unread_count);
        return response.data.data.unread_count;
      } else {
        console.error('❌ Invalid unread count response format:', response.data);
        console.error('❌ Response type:', typeof response.data);
        console.error('❌ Response keys:', response.data ? Object.keys(response.data) : 'null');
        // Return 0 instead of throwing to prevent breaking the UI
        return 0;
      }
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      return 0;
    }
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
