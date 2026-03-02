"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Eye, MessageCircle, Clock, DollarSign, CheckCircle2, Package } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { apiClient } from "@/lib/api";

interface BookingData {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_full_name?: string;
  customer_username?: string;
  customer_profile_image?: string;
  service_name: string;
  service_description?: string;
  service_image?: string;
  booking_date: string;
  status: "pending" | "in_progress" | "confirmed" | "completed" | "cancelled" | "rejected";
  booking_amount: number;
  total_amount: number;
  package_name?: string;
  event_location?: string;
  guest_count?: number;
  special_requests?: string;
  provider_notes?: string;
  provider_confirmed: boolean;
  created_at: string;
}

interface BookingStats {
  total: number;
  pending: number;
  in_progress: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  rejected: number;
  total_revenue: number;
}

export function ProviderBookings() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      console.log("Fetching provider bookings...");
      const response = await apiClient.get("/api/v1/bookings/provider/bookings");
      console.log("Bookings response:", response);
      setBookings(response.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    }
  };

  const fetchStats = async () => {
    try {
      console.log("Fetching provider statistics...");
      const response = await apiClient.get("/api/v1/bookings/provider/bookings/statistics/summary");
      console.log("Stats response:", response);
      setStats(response.data || null);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBookings(), fetchStats()]);
      setLoading(false);
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirm = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      await apiClient.post(`/api/v1/bookings/provider/bookings/${bookingId}/confirm`, {
        provider_notes: "Booking confirmed. Looking forward to serving you!",
      });

      toast.success("Booking confirmed successfully!");
      await fetchBookings();
      await fetchStats();
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast.error("Failed to confirm booking");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      await apiClient.post(`/api/v1/bookings/provider/bookings/${bookingId}/reject`, {
        rejection_reason: "Unfortunately, we are not available on this date.",
      });

      toast.success("Booking rejected");
      await fetchBookings();
      await fetchStats();
    } catch (error) {
      console.error("Error rejecting booking:", error);
      toast.error("Failed to reject booking");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "outline" as const, label: "Pending" },
      in_progress: { variant: "secondary" as const, label: "Awaiting Payment" },
      confirmed: { variant: "default" as const, label: "Confirmed" },
      completed: { variant: "default" as const, label: "Completed" },
      cancelled: { variant: "destructive" as const, label: "Cancelled" },
      rejected: { variant: "destructive" as const, label: "Rejected" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Booking Requests</h2>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{stats.in_progress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                  <p className="text-2xl font-bold">{stats.confirmed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground">Booking requests will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Service Image */}
                  {booking.service_image && (
                    <div className="relative w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={booking.service_image}
                        alt={booking.service_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Booking Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">{booking.customer_name}</h3>
                          {getStatusBadge(booking.status)}
                          {booking.provider_confirmed && (
                            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                              Provider Confirmed
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{booking.service_name}</p>
                        {booking.package_name && (
                          <p className="text-sm text-muted-foreground">Package: {booking.package_name}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Wedding Date</p>
                        <p className="font-medium">{new Date(booking.booking_date).toLocaleDateString()}</p>
                      </div>
                      {booking.event_location && (
                        <div>
                          <p className="text-muted-foreground">Location</p>
                          <p className="font-medium">{booking.event_location}</p>
                        </div>
                      )}
                      {booking.guest_count && (
                        <div>
                          <p className="text-muted-foreground">Guest Count</p>
                          <p className="font-medium">{booking.guest_count}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-medium text-lg">{booking.total_amount.toLocaleString()} RWF</p>
                      </div>
                    </div>

                    {/* Contact Info for confirmed bookings */}
                    {(booking.status === "in_progress" || booking.status === "confirmed" || booking.status === "completed") && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Customer Contact</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <p className="text-muted-foreground">Email: {booking.customer_email}</p>
                          <p className="text-muted-foreground">Phone: {booking.customer_phone}</p>
                        </div>
                      </div>
                    )}

                    {booking.special_requests && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Special Requests</p>
                        <p className="text-sm text-muted-foreground">{booking.special_requests}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 flex-shrink-0">
                    {booking.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(booking.id)}
                          disabled={actionLoading === booking.id}
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleConfirm(booking.id)}
                          disabled={actionLoading === booking.id}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                      </>
                    )}
                    {(booking.status === "in_progress" || booking.status === "confirmed") && (
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    )}
                    {booking.status === "completed" && (
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
