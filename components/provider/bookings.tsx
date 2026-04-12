"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Eye, MessageCircle, Clock, DollarSign, CheckCircle2, Package, Activity, Users } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { apiClient } from "@/lib/api";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { List, Calendar as CalendarIcon, LayoutGrid } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

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
  preferred_time?: string;
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
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const bookingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach((booking) => {
      const date = booking.booking_date; // Backend returns YYYY-MM-DD
      counts[date] = (counts[date] || 0) + 1;
    });
    return counts;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (!selectedDate) return bookings;
    // Format selected date to YYYY-MM-DD in local timezone
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return bookings.filter((b) => b.booking_date === dateStr);
  }, [bookings, selectedDate]);

  const fetchBookings = async () => {
    try {
      const response = await apiClient.get<BookingData[]>("/api/v1/bookings/provider");
      setBookings(response.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get<BookingStats>("/api/v1/bookings/provider/statistics/summary");
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
      await apiClient.post(`/api/v1/bookings/provider/${bookingId}/confirm`, {
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
      await apiClient.post(`/api/v1/bookings/provider/${bookingId}/reject`, {
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
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: "bg-amber-50", text: "text-amber-600", label: "Awaiting Action" },
      in_progress: { bg: "bg-indigo-50", text: "text-indigo-600", label: "Payment Pending" },
      confirmed: { bg: "bg-[#668c65]/10", text: "text-[#668c65]", label: "Secured" },
      completed: { bg: "bg-slate-50", text: "text-slate-500", label: "Realized" },
      cancelled: { bg: "bg-rose-50", text: "text-rose-600", label: "Retracted" },
      rejected: { bg: "bg-rose-50", text: "text-rose-600", label: "Declined" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge
        variant="outline"
        className={cn(
          "px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border-none shadow-none",
          config.bg,
          config.text
        )}
      >
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-4xl font-serif italic text-slate-900 tracking-tight">Orders & Bookings</h2>
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8 bg-[#668c65]/60" />
          <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.4em]">Review and manage your customer orders</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div />
        <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-100 shadow-sm">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "h-9 px-6 rounded-xl transition-all duration-300 font-bold text-[10px] uppercase",
              viewMode === "list" ? "bg-white text-[#668c65] shadow-sm hover:bg-white" : "text-slate-400 hover:text-slate-600 hover:bg-transparent"
            )}
            onClick={() => setViewMode("list")}
          >
            <List className="h-3.5 w-3.5 mr-2" />
            List View
          </Button>
          <Button
            variant={viewMode === "calendar" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "h-9 px-6 rounded-xl transition-all duration-300 font-bold text-[10px] uppercase",
              viewMode === "calendar" ? "bg-white text-[#668c65] shadow-sm hover:bg-white" : "text-slate-400 hover:text-slate-600 hover:bg-transparent"
            )}
            onClick={() => setViewMode("calendar")}
          >
            <CalendarIcon className="h-3.5 w-3.5 mr-2" />
            Calendar View
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Pending Requests", value: stats.pending.toString(), icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
            { label: "In Progress", value: stats.in_progress.toString(), icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Confirmed", value: stats.confirmed.toString(), icon: CheckCircle2, color: "text-[#668c65]", bg: "bg-[#668c65]/5" },
            { label: "Completed", value: stats.completed.toString(), icon: DollarSign, color: "text-[#668c65]", bg: "bg-[#668c65]/5" },
          ].map((stat, i) => (
            <Card key={i} className="border-slate-100 shadow-none rounded-[2rem] overflow-hidden bg-white group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <CardTitle className="text-3xl font-serif italic text-slate-900">{stat.value}</CardTitle>
                  </div>
                  <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", stat.bg)}>
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Conditional View */}
      {viewMode === "calendar" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 border-slate-100 bg-white shadow-none rounded-[2rem] overflow-hidden">
            <CardContent className="p-8 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full"
                components={{
                  DayButton: (props) => {
                    const date = props.day.date;
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const dateStr = `${year}-${month}-${day}`;
                    const count = bookingCounts[dateStr] || 0;
                    return (
                      <CalendarDayButton {...props} className={cn(
                        props.className,
                        "relative rounded-xl hover:bg-slate-50 transition-colors",
                        props.modifiers?.selected && "bg-[#668c65] text-white hover:bg-[#5a7b59]"
                      )}>
                        {props.day.date.getDate()}
                        {count > 0 && (
                          <span className={cn(
                            "absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black",
                            props.modifiers?.selected ? "bg-white text-[#668c65]" : "bg-[#668c65] text-white ring-2 ring-white"
                          )}>
                            {count}
                          </span>
                        )}
                      </CalendarDayButton>
                    );
                  },
                }}
              />
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif italic text-slate-900">
                {selectedDate
                  ? `Bookings for ${selectedDate.toLocaleDateString()}`
                  : "Upcoming Bookings"}
              </h3>
              {selectedDate && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedDate(undefined)}>
                  Clear selection
                </Button>
              )}
            </div>

            {(selectedDate ? filteredBookings : bookings).length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  No bookings found for this day.
                </CardContent>
              </Card>
            ) : (
              (selectedDate ? filteredBookings : bookings).map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  handleConfirm={handleConfirm}
                  handleReject={handleReject}
                  actionLoading={actionLoading}
                  getStatusBadge={getStatusBadge}
                />
              ))
            )}
          </div>
        </div>
      ) : (
        /* Bookings List */
        bookings.length === 0 ? (
          <Card className="border-slate-100 bg-white shadow-none rounded-[2rem] overflow-hidden">
            <CardContent className="p-20 text-center">
              <Package className="h-16 w-16 text-slate-100 mx-auto mb-6" />
              <h3 className="text-2xl font-serif italic text-slate-900 mb-2">No bookings yet</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waiting for your first order</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6 pb-12">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                handleConfirm={handleConfirm}
                handleReject={handleReject}
                actionLoading={actionLoading}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}

function BookingCard({
  booking,
  handleConfirm,
  handleReject,
  actionLoading,
  getStatusBadge
}: {
  booking: BookingData;
  handleConfirm: (id: string) => Promise<void>;
  handleReject: (id: string) => Promise<void>;
  actionLoading: string | null;
  getStatusBadge: (status: string) => JSX.Element;
}) {
  return (
    <Card className="border-slate-100 shadow-none rounded-[2rem] overflow-hidden bg-white group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Service Image / Avatar */}
          <div className="relative w-full md:w-48 h-48 rounded-[1.5rem] overflow-hidden flex-shrink-0 bg-slate-50 group-hover:shadow-lg transition-all duration-500">
            {booking.service_image ? (
              <Image
                src={booking.service_image as string}
                alt={booking.service_name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#668c65] font-black text-xl mb-3 border border-slate-100">
                  {booking.customer_name.substring(0, 2).toUpperCase()}
                </div>
              </div>
            )}
            <div className="absolute top-4 right-4 animate-in fade-in duration-700">
              {getStatusBadge(booking.status)}
            </div>
          </div>

          {/* Booking Details */}
          <div className="flex-1 space-y-8">
            <div className="flex items-start justify-between border-b border-slate-50 pb-6">
              <div>
                <h3 className="text-3xl font-serif italic text-slate-900 tracking-tight leading-none mb-3">
                  {booking.customer_name}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.2em]">{booking.service_name}</p>
                  {booking.package_name && (
                    <>
                      <span className="text-slate-300 font-bold">•</span>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{booking.package_name}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-serif italic text-slate-900">{booking.total_amount.toLocaleString()} <span className="text-[10px] font-black uppercase not-italic text-slate-400 ml-1">RWF</span></p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Amount</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Booking Date</p>
                <div className="flex items-center gap-4">
                  {/* Visual Calendar Block */}
                  <div className="flex flex-col w-12 h-14 rounded-xl overflow-hidden border border-slate-100 bg-white shadow-sm flex-shrink-0">
                    <div className="bg-[#668c65] py-1 text-center">
                      <span className="text-[7px] font-black text-white uppercase tracking-tighter">
                        {new Date(booking.booking_date + 'T00:00:00').toLocaleString('en-US', { month: 'short' }).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-lg font-serif italic font-bold text-slate-900 leading-none">
                        {new Date(booking.booking_date + 'T00:00:00').getDate()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">{new Date(booking.booking_date + 'T00:00:00').getFullYear()}</span>
                    <span className="text-[9px] font-black text-[#668c65] uppercase tracking-widest leading-none">Event Date</span>
                  </div>
                </div>
              </div>
              {booking.preferred_time && (
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Time</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Clock className="h-3.5 w-3.5 text-[#668c65]" />
                    <span>{booking.preferred_time}</span>
                  </div>
                </div>
              )}
              {booking.event_location && (
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Location</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <CheckCircle className="h-3.5 w-3.5 text-[#668c65]" />
                    <span className="truncate">{booking.event_location}</span>
                  </div>
                </div>
              )}
              {booking.guest_count && (
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Guest Count</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Users className="h-3.5 w-3.5 text-[#668c65]" />
                    <span>{booking.guest_count} Guest(s)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Engagement Details and Actions */}
            <div className="flex flex-col lg:flex-row items-end justify-between gap-6 pt-2">
              <div className="flex-1 w-full lg:w-auto">
                {booking.special_requests ? (
                  <div className="bg-[#668c65]/5 p-6 rounded-[1.5rem] border border-[#668c65]/10 relative overflow-hidden group/note">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/note:rotate-12 transition-transform">
                      <MessageCircle className="w-12 h-12 text-[#668c65]" />
                    </div>
                    <p className="text-[8px] font-black text-[#668c65] uppercase tracking-widest mb-2">Customer Request</p>
                    <p className="text-xs text-slate-600 leading-relaxed font-light italic">"{booking.special_requests}"</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 text-slate-400">
                    <div className="h-[1px] w-8 bg-slate-100" />
                    <p className="text-[8px] font-black uppercase tracking-widest">No Special Requests</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 flex-shrink-0">
                {booking.status === "pending" && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl h-12 px-6 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-all font-bold text-[10px] uppercase"
                      onClick={() => handleReject(booking.id)}
                      disabled={actionLoading === booking.id}
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-xl h-12 px-8 bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-200 transition-all font-bold text-[10px] uppercase"
                      onClick={() => handleConfirm(booking.id)}
                      disabled={actionLoading === booking.id}
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-2" />
                      Accept Request
                    </Button>
                  </>
                )}
                {(booking.status === "in_progress" || booking.status === "confirmed") && (
                  <Button variant="outline" size="sm" className="rounded-xl h-12 px-8 border-slate-100 hover:bg-slate-50 transition-all font-bold text-[10px] uppercase text-slate-600">
                    <MessageCircle className="h-3.5 w-3.5 mr-2" />
                    Contact Customer
                  </Button>
                )}
                {booking.status === "completed" && (
                  <Button variant="outline" size="sm" className="rounded-xl h-12 px-8 border-slate-100 hover:bg-slate-50 transition-all font-bold text-[10px] uppercase text-slate-600">
                    <Eye className="h-3.5 w-3.5 mr-2" />
                    See Details
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
