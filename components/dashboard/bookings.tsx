"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Star, Calendar, MapPin, Users, Loader2, AlertCircle, Eye, HandCoins, ExternalLink, ShieldCheck, Clock, CheckCircle } from "lucide-react";
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
  pending: "bg-amber-100 text-amber-900 border-amber-200",
  in_progress: "bg-blue-100 text-blue-900 border-blue-200",
  confirmed: "bg-sage-100 text-sage-900 border-sage-200",
  completed: "bg-slate-100 text-slate-900 border-slate-200",
  cancelled: "bg-red-100 text-red-900 border-red-200",
  rejected: "bg-rose-100 text-rose-900 border-rose-200",
};

const statusLabels: Record<string, string> = {
  pending: "Pending Approval",
  in_progress: "Actively Planning",
  confirmed: "Secured Booking",
  completed: "Archived Event",
  cancelled: "Voided Request",
  rejected: "Resource Unavailable",
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-sage-600/30" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-none shadow-sm rounded-[2.5rem] bg-rose-50/30 overflow-hidden">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-rose-100">
            <AlertCircle className="h-8 w-8 text-rose-500" />
          </div>
          <h3 className="text-xl font-serif italic text-slate-800 mb-2">Systems Interrupted</h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">We encountered an issue retrieving your bespoke booking portfolio. Please try again shortly.</p>
        </CardContent>
      </Card>
    );
  }

  const bookings = bookingsData || [];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h2 className="text-3xl font-serif italic text-slate-800">Your Booking Portfolio</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-2">Curated selections and active commitments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-50 rounded-full border border-slate-100 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-sage-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{bookings.length} Total Curations</span>
          </div>
        </div>
      </div>

      {bookings.length === 0 ? (
        <Card className="border-none shadow-[0_15px_40px_rgba(0,0,0,0.02)] rounded-[3rem] overflow-hidden bg-white py-10">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-slate-100">
              <Calendar className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-serif italic text-slate-800 mb-4">A Blank Canvas Awaits</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-10 leading-relaxed font-medium">
              Transform your vision into reality by securing world-class services for your celebration.
            </p>
            <Button className="h-14 px-10 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white shadow-xl shadow-sage-600/20 font-bold uppercase tracking-widest text-xs transition-all active:scale-95">
              Explore the Marketplace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8">
          {bookings.map((booking) => (
            <Card key={booking.id} className="group border-none shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden bg-white transition-all duration-500 border border-transparent hover:border-sage-50">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row h-full">
                  {/* Service Image Section */}
                  <div className="w-full md:w-64 lg:w-72 bg-slate-50 flex items-center justify-center relative overflow-hidden shrink-0 aspect-[4/3] md:aspect-auto">
                    {booking.service_image ? (
                      <img
                        src={booking.service_image}
                        alt={booking.service_name || "Service"}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#f8fafc] flex items-center justify-center">
                        <Calendar className="h-12 w-12 text-slate-200 group-hover:scale-110 transition-transform duration-700" />
                      </div>
                    )}
                    <div className="absolute top-6 left-6 z-10">
                      <Badge className={`${statusColors[booking.status] || "bg-slate-100 text-slate-800 border-slate-200"} px-4 py-1.5 rounded-full shadow-lg text-[9px] font-bold uppercase tracking-widest border`}>
                        {statusLabels[booking.status] || booking.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-8">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sage-600">Bespoke Collection</span>
                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-[10px] font-bold text-slate-400">BK-{booking.id.substring(0, 8).toUpperCase()}</span>
                          </div>
                          <h3 className="text-2xl font-serif italic text-slate-800 leading-tight mb-2 group-hover:text-sage-700 transition-colors">
                            {booking.service_name || "Bespoke Service Booking"}
                          </h3>
                          {booking.business_name && (
                            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 flex items-center gap-2">
                              <span>Provider</span>
                              <div className="w-4 h-[1px] bg-slate-200" />
                              <span className="text-slate-800">{booking.business_name}</span>
                            </p>
                          )}
                        </div>
                        {booking.provider_confirmed && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-sage-50 border border-sage-100 rounded-full">
                            <ShieldCheck className="h-3.5 w-3.5 text-sage-600" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-sage-700">Secured</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                        <div className="flex items-center gap-5 group/item">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 transition-all group-hover/item:bg-white group-hover/item:shadow-lg group-hover/item:border-sage-100">
                            <Calendar className="h-5 w-5 text-slate-400 group-hover/item:text-sage-600 transition-colors" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Occasion Date</span>
                            <span className="text-sm font-bold text-slate-800">{format(new Date(booking.booking_date), "MMMM dd, yyyy")}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-5 group/item">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 transition-all group-hover/item:bg-white group-hover/item:shadow-lg group-hover/item:border-sage-100">
                            <MapPin className="h-5 w-5 text-slate-400 group-hover/item:text-sage-600 transition-colors" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Strategic Venue</span>
                            <span className="text-sm font-bold text-slate-800 truncate max-w-[150px]">{booking.event_location || "Bespoke Location"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-slate-100 mt-auto gap-6 sm:gap-2">
                      <div className="flex flex-col items-center sm:items-start order-2 sm:order-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Portfolio Investment</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold tracking-tighter text-slate-800">RWF {booking.total_amount.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
                        <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-lg hover:text-sage-600 border border-slate-100 transition-all text-slate-400">
                          <MessageCircle className="h-5 w-5" />
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="h-14 px-8 border-slate-100 hover:border-sage-200 hover:bg-sage-50/30 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-600 transition-all active:scale-95 flex-1 sm:flex-initial">
                              <Eye className="h-4 w-4 mr-2" />
                              View Curation
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-[3rem]">
                            <DialogHeader className="p-10 bg-[#668c65] text-white relative">
                              <div className="absolute top-0 right-0 p-10 opacity-10">
                                <Calendar className="h-32 w-32" />
                              </div>
                              <div className="flex items-center gap-3 mb-4">
                                <Badge className={`${statusColors[booking.status] || "bg-slate-700"} px-4 py-1 shadow-lg text-[9px] font-bold uppercase tracking-widest border-none`}>
                                  {statusLabels[booking.status]}
                                </Badge>
                                <span className="text-[10px] font-bold text-slate-500 tracking-widest">BK-{booking.id.toUpperCase()}</span>
                              </div>
                              <DialogTitle className="text-3xl font-serif italic text-white leading-tight">
                                {booking.service_name || "Service Details"}
                              </DialogTitle>
                              <DialogDescription className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
                                Holistic Booking Overview
                              </DialogDescription>
                            </DialogHeader>

                            <ScrollArea className="max-h-[60vh]">
                              <div className="p-10 space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                  <div className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-sage-600 px-1">Tactical Timeline</h4>
                                    <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100/50 space-y-5">
                                      <div className="flex flex-col">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Strategic Date</span>
                                        <span className="font-bold text-slate-800">{format(new Date(booking.booking_date), "EEEE, MMMM dd, yyyy")}</span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Primary Location</span>
                                        <span className="font-bold text-slate-800">{booking.event_location || "Bespoke Selection"}</span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Expected Attendance</span>
                                        <span className="font-bold text-slate-800">{booking.guest_count} Elite Guests</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-1">Financial Portfolio</h4>
                                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                                      <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Baseline Rate</span>
                                        <span className="font-bold text-slate-600">{booking.booking_amount.toLocaleString()} RWF</span>
                                      </div>
                                      <Separator className="bg-slate-100" />
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-800">Total Yield</span>
                                        <span className="text-xl font-bold text-sage-700 tracking-tighter">{booking.total_amount.toLocaleString()} RWF</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-6">
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-sage-600 px-1">Strategic Communication</h4>
                                  <div className="bg-sage-800 rounded-[2rem] p-8 space-y-6 text-white shadow-2xl shadow-sage-900/40">
                                    <div className="flex items-start gap-4">
                                      <div className="p-2 bg-white/10 rounded-xl">
                                        <Star className="h-4 w-4 text-sage-400" />
                                      </div>
                                      <div>
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Owner Directives</span>
                                        <p className="text-xs mt-2 italic text-slate-200 leading-relaxed font-medium">"{booking.special_requests || "No custom modernizations requested."}"</p>
                                      </div>
                                    </div>
                                    {booking.provider_notes && (
                                      <div className="pt-6 border-t border-white/10 flex items-start gap-4">
                                        <div className="p-2 bg-sage-500/20 rounded-xl">
                                          <CheckCircle className="h-4 w-4 text-sage-300" />
                                        </div>
                                        <div>
                                          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-sage-400">Provider Acknowledgement</span>
                                          <p className="text-xs mt-2 text-sage-50 leading-relaxed font-medium">{booking.provider_notes}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </ScrollArea>

                            <DialogFooter className="p-10 pt-4 bg-slate-50/50 flex flex-col sm:flex-row gap-4 border-t border-slate-100">
                              <Button variant="ghost" className="rounded-xl h-14 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                                Archive Documentation
                              </Button>
                              <div className="flex-1" />
                              {booking.status === "pending" && (
                                <Button variant="ghost" className="rounded-xl h-14 px-8 text-[10px] font-bold uppercase tracking-widest text-rose-400 hover:text-rose-600 hover:bg-rose-50 border-rose-100 transition-all">
                                  Rescind Request
                                </Button>
                              )}
                              <Button className="rounded-xl h-14 px-10 bg-[#668c65] hover:bg-sage-700 text-white text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-sage-200">
                                Dismiss View
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {booking.provider_confirmed && booking.status !== "completed" && (
                          <Button className="h-14 px-10 bg-sage-600 hover:bg-sage-700 text-white shadow-xl shadow-sage-600/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 group/pay flex-1 sm:flex-initial">
                            <HandCoins className="h-4 w-4 mr-2 group-hover/pay:-rotate-12 transition-transform" />
                            Finalize Investment
                          </Button>
                        )}

                        {!booking.provider_confirmed && booking.status === "pending" && (
                          <div className="flex items-center gap-3 px-6 h-14 rounded-2xl bg-amber-50/50 border border-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-widest flex-1 sm:flex-initial">
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            Awaiting Manifest
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


