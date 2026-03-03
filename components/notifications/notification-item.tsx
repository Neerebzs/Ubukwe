"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Calendar,
  CheckCircle,
  XCircle,
  CreditCard,
  MessageCircle,
  Star,
  ShieldCheck,
  ShieldX,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Notification } from "@/lib/api/notifications";
import { useNotifications } from "@/hooks/useNotifications";
import { useRouter } from "next/navigation";

interface NotificationItemProps {
  notification: Notification;
  showDivider?: boolean;
}

const notificationIcons = {
  booking_created: Calendar,
  booking_confirmed: CheckCircle,
  booking_cancelled: XCircle,
  booking_completed: Package,
  payment_received: CreditCard,
  payment_failed: XCircle,
  review_received: Star,
  verification_approved: ShieldCheck,
  verification_rejected: ShieldX,
  message: MessageCircle,
};

const notificationColors = {
  booking_created: "text-blue-600 bg-blue-50",
  booking_confirmed: "text-green-600 bg-green-50",
  booking_cancelled: "text-red-600 bg-red-50",
  booking_completed: "text-purple-600 bg-purple-50",
  payment_received: "text-emerald-600 bg-emerald-50",
  payment_failed: "text-red-600 bg-red-50",
  review_received: "text-yellow-600 bg-yellow-50",
  verification_approved: "text-green-600 bg-green-50",
  verification_rejected: "text-red-600 bg-red-50",
  message: "text-blue-600 bg-blue-50",
};

export function NotificationItem({ notification, showDivider }: NotificationItemProps) {
  const { markAsRead } = useNotifications();
  const router = useRouter();

  const Icon = notificationIcons[notification.notification_type] || Calendar;
  const colorClass = notificationColors[notification.notification_type] || "text-slate-600 bg-slate-50";

  const handleClick = () => {
    // Mark as read if unread
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.related_booking_id) {
      // Navigate to bookings tab
      const userRole = localStorage.getItem('user');
      if (userRole) {
        const user = JSON.parse(userRole);
        if (user.role === 'service_provider') {
          router.push('/provider/dashboard?tab=bookings');
        } else if (user.role === 'event_owner') {
          router.push('/customer/dashboard?tab=bookings');
        } else if (user.role === 'admin') {
          router.push('/admin/dashboard?tab=bookings');
        }
      }
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
  });

  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-4 hover:bg-slate-50 cursor-pointer transition-colors",
        !notification.is_read && "bg-blue-50/30"
      )}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={cn("flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center", colorClass)}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4
              className={cn(
                "text-sm font-medium text-slate-900 line-clamp-1",
                !notification.is_read && "font-semibold"
              )}
            >
              {notification.title}
            </h4>
            {!notification.is_read && (
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-1.5" />
            )}
          </div>
          <p className="text-sm text-slate-600 line-clamp-2 mb-1">
            {notification.message}
          </p>
          <p className="text-xs text-slate-400">{timeAgo}</p>
        </div>
      </div>
    </div>
  );
}
