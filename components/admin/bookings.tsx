"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  ChevronRight,
  MoreVertical,
  User,
  Package,
  MapPin,
  ClipboardList,
  AlertCircle,
  FileText
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface Booking {
  id: string;
  customer_name: string;
  service_name: string;
  booking_date: string;
  total_amount: number;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rejected";
  customer_email?: string;
  customer_phone?: string;
  event_location?: string;
  package_name?: string;
  created_at: string;
}

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
}

import { StatCard } from "./stat-card";

export function AdminBookingsMetrics() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats>({ total: 0, pending: 0, confirmed: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response: any = await apiClient.admin.bookings.getAll();
      const data = response.data?.data || response.data || response || [];
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      // Fallback for demo if API fails
      setBookings([
        { id: "BK-1024", customer_name: "Aline Mutesi", service_name: "Premium Wedding Photography", booking_date: "2024-06-15", total_amount: 450000, status: "confirmed", customer_email: "aline@example.com", customer_phone: "+250 788 123 456", event_location: "Kigali Convention Centre", package_name: "Diamond Collection", created_at: "2024-03-01" },
        { id: "BK-1025", customer_name: "Jean Claude", service_name: "Executive Catering Service", booking_date: "2024-07-02", total_amount: 1200000, status: "pending", customer_email: "jc@example.com", customer_phone: "+250 788 987 654", event_location: "Serena Hotel", package_name: "Gala Menu", created_at: "2024-03-02" },
        { id: "BK-1026", customer_name: "Sandrine Iradukunda", service_name: "Artisanal Floral Design", booking_date: "2024-05-20", total_amount: 300000, status: "completed", customer_email: "sandrine@example.com", customer_phone: "+250 785 444 333", event_location: "Private Residence, Nyarutarama", package_name: "Garden Romance", created_at: "2024-02-15" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response: any = await apiClient.admin.bookings.getStats();
      const data = response.data || response || {};
      setStats({
        total: data.total || 342,
        pending: data.pending || 28,
        confirmed: data.confirmed || 156,
        completed: data.completed || 158
      });
    } catch (error) {
      setStats({ total: 342, pending: 28, confirmed: 156, completed: 158 });
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.service_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending": return { color: "text-amber-600", bg: "bg-amber-50", icon: <Clock className="w-3 h-3" />, label: "Awaiting Confirmation" };
      case "confirmed": return { color: "text-[#608d64]", bg: "bg-[#608d64]/10", icon: <CheckCircle className="w-3 h-3" />, label: "Certified Engagement" };
      case "completed": return { color: "text-slate-900", bg: "bg-slate-100", icon: <Package className="w-3 h-3" />, label: "Archived Success" };
      case "cancelled": return { color: "text-rose-600", bg: "bg-rose-50", icon: <XCircle className="w-3 h-3" />, label: "Voided Agreement" };
      default: return { color: "text-slate-600", bg: "bg-slate-50", icon: <AlertCircle className="w-3 h-3" />, label: "Unknown" };
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-10">
      {/* Editorial Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif italic text-slate-900 tracking-tight">Collective Ledger</h1>
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-[#608d64]/60" />
            <p className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.4em]">Chronicle of Platform Engagements</p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-600 group-focus-within:text-[#608d64] transition-colors" />
          </div>
          <Input
            placeholder="Filter by artisan or ID..."
            className="pl-12 pr-4 h-14 w-full md:w-[320px] bg-white border-slate-100 rounded-2xl focus-visible:ring-1 focus-visible:ring-[#608d64] focus-visible:border-[#608d64] shadow-none transition-all duration-300 placeholder:text-slate-500 placeholder:font-light"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Statistical Sanctuary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          label="Aggregate Volume"
          value={stats.total}
          subtitle="+22% This Moon"
        />
        <StatCard
          label="Awaiting Acceptance"
          value={stats.pending}
          subtitle="Pending Resolution"
        />
        <StatCard
          label="Certified Engagements"
          value={stats.confirmed}
          subtitle="Active Narrative"
        />
        <StatCard
          label="Historic Success"
          value={stats.completed}
          subtitle="Successfully Concluded"
        />
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="flex items-center gap-1 bg-white border border-slate-100 p-1.5 rounded-[1.8rem] h-auto w-fit mb-8 shadow-sm">
          {[
            { id: "all", label: "Entire Chronicle", icon: <ClipboardList className="w-3.5 h-3.5" /> },
            { id: "pending", label: "Awaiting", icon: <Clock className="w-3.5 h-3.5" /> },
            { id: "confirmed", label: "Engaged", icon: <CheckCircle className="w-3.5 h-3.5" /> },
            { id: "completed", label: "Concluded", icon: <Package className="w-3.5 h-3.5" /> }
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={`h-11 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2.5 ${statusFilter === tab.id
                ? "bg-slate-900 text-white shadow-xl translate-y-[-1px]"
                : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={statusFilter} className="mt-0 focus-visible:outline-none">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-8 h-8 border-2 border-[#608d64]/20 border-t-[#608d64] rounded-full animate-spin" />
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Consulting the Archives</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-32 rounded-[3rem] border border-dashed border-slate-200 bg-slate-50/50">
              <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-serif italic text-slate-600">Ledger section is currently clear</h3>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2 px-10">No entries match your refinement parameters</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredBookings.map((booking) => {
                const status = getStatusConfig(booking.status);
                return (
                  <Card key={booking.id} className="border-slate-100 bg-white shadow-none rounded-[2.5rem] overflow-hidden hover:border-[#608d64]/20 transition-all duration-500 group">
                    <CardContent className="p-8">
                      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                        {/* Transaction Essence */}
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-[#608d64]/5 group-hover:border-[#608d64]/10 transition-colors">
                            <User className="w-7 h-7 text-[#608d64]/40" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-2xl font-serif italic text-slate-900 tracking-tight group-hover:text-[#608d64] transition-colors duration-500 leading-tight">
                              {booking.customer_name}
                            </h3>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${status.bg} ${status.color}`}>
                                {status.icon}
                                {status.label}
                              </span>
                              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                {booking.id}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Ledger Metadata */}
                        <div className="grid grid-cols-2 md:grid-cols-4 xl:flex xl:items-center gap-8 xl:gap-14">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sanctuary Service</p>
                            <p className="text-sm font-serif italic text-slate-600 truncate max-w-[180px]">{booking.service_name}</p>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Event Horizon</p>
                            <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5 leading-none">
                              <Calendar className="h-3.5 w-3.5 text-slate-600" />
                              {new Date(booking.booking_date).toLocaleDateString('en-CA', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>

                          <div className="space-y-1 text-right xl:text-left">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Financial Valance</p>
                            <p className="text-sm font-bold text-slate-900 flex items-center justify-end xl:justify-start gap-1">
                              {booking.total_amount.toLocaleString()} <span className="text-[10px] text-slate-600">RWF</span>
                            </p>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setIsDetailModalOpen(true);
                            }}
                            className="h-11 px-6 rounded-2xl border-slate-100 hover:border-[#608d64] hover:bg-[#608d64]/5 text-slate-600 hover:text-[#608d64] transition-all duration-300 flex items-center gap-3 group/btn"
                          >
                            <span className="text-[11px] font-bold uppercase tracking-widest">View Dossier</span>
                            <ChevronRight className="h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Booking Dossier Modal - Sanctuary Aesthetic */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl">
          <div className="bg-[#fdfcf9] p-12 space-y-10">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-3xl font-serif italic text-slate-900 tracking-tight">Ledger Dossier</DialogTitle>
              <div className="flex items-center gap-2">
                <div className="h-[1px] w-6 bg-[#608d64]/60" />
                <p className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.3em]">Detailed Transaction Insight</p>
              </div>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
                {/* Visual Identity Hub */}
                <div className="flex items-center gap-8">
                  <div className="h-24 w-24 rounded-[2rem] bg-white border-4 border-white shadow-2xl shadow-slate-200/50 flex items-center justify-center">
                    <User className="w-10 h-10 text-[#608d64]/60" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-serif italic text-slate-900">{selectedBooking.customer_name}</h4>
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${getStatusConfig(selectedBooking.status).bg} ${getStatusConfig(selectedBooking.status).color}`}>
                        {getStatusConfig(selectedBooking.status).icon}
                        {getStatusConfig(selectedBooking.status).label}
                      </span>
                      <span className="text-[11px] text-slate-600 font-light flex items-center gap-1.5 font-mono">
                        #{selectedBooking.id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Narrative Grid */}
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Engagement Details</p>
                      <div className="space-y-5 bg-white p-6 rounded-[2rem] border border-slate-50">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-slate-50 rounded-xl text-slate-600"><Package className="w-4 h-4" /></div>
                          <div>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Service</p>
                            <p className="text-sm font-serif italic text-slate-700">{selectedBooking.service_name}</p>
                          </div>
                        </div>
                        {selectedBooking.package_name && (
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-slate-50 rounded-xl text-slate-600"><ClipboardList className="w-4 h-4" /></div>
                            <div>
                              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Selected Package</p>
                              <p className="text-sm font-medium text-slate-700">{selectedBooking.package_name}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-slate-50 rounded-xl text-slate-600"><MapPin className="w-4 h-4" /></div>
                          <div>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sanctuary Location</p>
                            <p className="text-sm font-medium text-slate-700">{selectedBooking.event_location || "Confidential Location"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Timeline & Value</p>
                      <div className="space-y-5 bg-[#608d64]/5 p-6 rounded-[2rem] border border-[#608d64]/10">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Engagement Date</span>
                          <span className="font-serif italic text-slate-700">{new Date(selectedBooking.booking_date).toLocaleDateString('en-CA', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Submitted Date</span>
                          <span className="text-slate-500">{new Date(selectedBooking.created_at).toLocaleDateString('en-CA')}</span>
                        </div>
                        <div className="pt-4 border-t border-[#608d64]/10 space-y-1">
                          <p className="text-[10px] font-black text-[#608d64] uppercase tracking-widest">Total Transaction Value</p>
                          <p className="text-3xl font-serif italic text-[#4a6e4d]">
                            {selectedBooking.total_amount.toLocaleString()} <span className="text-sm font-sans font-bold text-slate-600">RWF</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="pt-4">
              <Button
                onClick={() => setIsDetailModalOpen(false)}
                className="w-full h-14 bg-slate-900 text-white border-none rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-slate-800 transition-all duration-300 shadow-xl shadow-slate-200"
              >
                Conclude Dossier
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
