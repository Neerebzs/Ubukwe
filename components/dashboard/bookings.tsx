"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Star, Calendar, MapPin, Users, Loader2, AlertCircle, Eye, HandCoins, ExternalLink, ShieldCheck, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Booking {
  id: string;
  service_id: string;
  provider_id: string;
  booking_date: string;
  status: string;
  booking_amount: number;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_location?: string;
  guest_count?: number;
  special_requests?: string;
  provider_notes?: string;
  created_at: string;
  provider_confirmed: boolean;
  // Service details
  service_name?: string;
  service_description?: string;
  business_name?: string;
  service_image?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  rejected: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

export function Bookings() {
  const { data: bookingsData, isLoading, error } = useQuery({
    queryKey: ["customer-bookings"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/bookings/bookings");
      return response.data as Booking[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load bookings</p>
        </CardContent>
      </Card>
    );
  }

  const bookings = bookingsData || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Bookings</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{bookings.length} Total</Badge>
        </div>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground mb-4">
              Start booking wedding services to see them here
            </p>
            <Button>Browse Services</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="group transition-all duration-300 hover:shadow-md hover:border-primary/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row h-full">
                  {/* Service Image */}
                  <div className="w-full md:w-48 bg-gray-100 flex items-center justify-center relative overflow-hidden shrink-0 min-h-[160px]">
                    {booking.service_image ? (
                      <img
                        src={booking.service_image}
                        alt={booking.service_name || "Service"}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-teal-500/5 group-hover:from-primary/10 group-hover:to-teal-500/10 transition-colors" />
                        <Calendar className="h-10 w-10 text-primary/30 group-hover:scale-110 transition-transform duration-500" />
                      </>
                    )}
                    <div className="absolute top-2 left-2 z-10">
                      <Badge className={`${statusColors[booking.status] || "bg-gray-100"} border-none shadow-sm`}>
                        {statusLabels[booking.status] || booking.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {booking.service_name || "Service Booking"}
                          </h3>
                          {booking.business_name && (
                            <p className="text-sm text-muted-foreground font-medium mb-2">
                              by {booking.business_name}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                            <span>BK-{booking.id.substring(0, 8).toUpperCase()}</span>
                            <span>•</span>
                            <span className="text-primary">{format(new Date(booking.booking_date), "MMMM dd, yyyy")}</span>
                          </div>
                        </div>
                        {booking.provider_confirmed && (
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 animate-pulse">
                            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                            Confirmed
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                            <MapPin className="h-4 w-4 text-gray-400" />
                          </div>
                          <span className="truncate">{booking.event_location || "Location not specified"}</span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                            <Users className="h-4 w-4 text-gray-400" />
                          </div>
                          <span>{booking.guest_count || 0} Estimated Guests</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Amount</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-extrabold text-[#1a1c21]">{booking.total_amount.toLocaleString()}</span>
                          <span className="text-xs font-bold text-gray-500">RWF</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Interactive Message Button */}
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full transition-colors h-10 w-10">
                          <MessageCircle className="h-5 w-5" />
                        </Button>

                        {/* Details Modal */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-10 px-4 border-gray-200 hover:border-primary hover:text-primary transition-all">
                              <Eye className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                Booking Details
                                <Badge className={statusColors[booking.status]}>
                                  {statusLabels[booking.status]}
                                </Badge>
                              </DialogTitle>
                              <DialogDescription className="text-muted-foreground">
                                Request ID: BK-{booking.id.toUpperCase()}
                              </DialogDescription>
                            </DialogHeader>

                            <ScrollArea className="max-h-[60vh] pr-4">
                              <div className="space-y-6 py-4">
                                <div className="grid grid-cols-2 gap-8">
                                  <div className="space-y-4">
                                    <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500">Event Info</h4>
                                    <div className="space-y-3">
                                      <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Date</span>
                                        <span className="font-medium">{format(new Date(booking.booking_date), "EEEE, MMMM dd, yyyy")}</span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Location</span>
                                        <span className="font-medium">{booking.event_location || "TBD"}</span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Guest Count</span>
                                        <span className="font-medium">{booking.guest_count} guests</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500">Financial Summary</h4>
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Service Amount</span>
                                        <span className="font-medium">{booking.booking_amount.toLocaleString()} RWF</span>
                                      </div>
                                      <Separator />
                                      <div className="flex justify-between items-center text-base">
                                        <span className="font-bold">Total Amount</span>
                                        <span className="font-bold text-primary">{booking.total_amount.toLocaleString()} RWF</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                  <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500">Communications</h4>
                                  <div className="p-4 bg-gray-50 rounded-xl space-y-4 border border-gray-100">
                                    <div>
                                      <span className="text-xs font-bold text-gray-400 uppercase">Your Special Requests</span>
                                      <p className="text-sm mt-1 whitespace-pre-wrap">{booking.special_requests || "No special requests provided."}</p>
                                    </div>
                                    {booking.provider_notes && (
                                      <div className="pt-3 border-t border-gray-200">
                                        <span className="text-xs font-bold text-blue-400 uppercase">Provider Notes</span>
                                        <p className="text-sm mt-1 whitespace-pre-wrap text-blue-700">{booking.provider_notes}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </ScrollArea>

                            <DialogFooter className="gap-2 sm:gap-0">
                              <Button variant="ghost" onClick={() => { }}>
                                Download Invoice
                              </Button>
                              {booking.status === "pending" && (
                                <Button variant="destructive">Cancel Request</Button>
                              )}
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* Prominent Payment Button */}
                        {booking.provider_confirmed && booking.status !== "completed" && (
                          <Button className="h-10 px-6 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95 group/pay">
                            <HandCoins className="h-4 w-4 mr-2 group-hover/pay:-rotate-12 transition-transform" />
                            Pay Now
                          </Button>
                        )}

                        {!booking.provider_confirmed && booking.status === "pending" && (
                          <div className="flex items-center gap-2 px-3 h-10 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 text-xs font-medium">
                            <Clock className="h-3.5 w-3.5 animate-spin-slow" />
                            Awaiting Availability
                          </div>
                        )}
                      </div>
                    </div>
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

