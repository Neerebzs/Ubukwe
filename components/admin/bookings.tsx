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

  const TABS_CONFIG: Record<string, { label: string; title: string; description: string; icon: JSX.Element }> = {
    all: {
      label: "Entire Chronicle",
      title: "Comprehensive Ledger",
      description: "A complete historical record of all platform engagements and service interactions.",
      icon: <ClipboardList className="w-3.5 h-3.5" />
    },
    pending: {
      label: "Awaiting",
      title: "Awaiting Resolution",
      description: "Service requests currently pending artisan approval or client finalization.",
      icon: <Clock className="w-3.5 h-3.5" />
    },
    confirmed: {
      label: "Engaged",
      title: "Active Narratives",
      description: "Validated bookings currently in progress or scheduled for upcoming horizons.",
      icon: <CheckCircle className="w-3.5 h-3.5" />
    },
    completed: {
      label: "Concluded",
      title: "Archived Successes",
      description: "Successful engagements that have reached their natural conclusion and are now archived.",
      icon: <Package className="w-3.5 h-3.5" />
    }
  };

  const activeTabConfig = TABS_CONFIG[statusFilter] || TABS_CONFIG.all;


  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      console.log('📊 Fetching admin bookings...');
      const response: any = await apiClient.admin.bookings.getAll();
      console.log('📊 Admin bookings response:', response);
      
      // Handle different response formats
      let data = [];
      if (response.data?.bookings) {
        // Response format: { data: { bookings: [...] } }
        data = response.data.bookings;
      } else if (response.bookings) {
        // Response format: { bookings: [...] }
        data = response.bookings;
      } else if (response.data?.data) {
        // Response format: { data: { data: [...] } }
        data = response.data.data;
      } else if (response.data) {
        // Response format: { data: [...] }
        data = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        // Direct array response
        data = response;
      }
      
      console.log('📊 Processed bookings data:', data);
      setBookings(Array.isArray(data) ? data : []);
      
      if (data.length === 0) {
        toast.info('No bookings found');
      } else {
        toast.success(`Loaded ${data.length} booking(s)`);
      }
    } catch (error: any) {
      console.error("❌ Error fetching bookings:", error);
      toast.error(error.message || "Failed to fetch bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('📊 Fetching booking stats...');
      const response: any = await apiClient.admin.bookings.getStats();
      console.log('📊 Booking stats response:', response);
      
      // Handle different response formats
      let data: any = {};
      if (response.data?.data) {
        data = response.data.data;
      } else if (response.data) {
        data = response.data;
      } else {
        data = response;
      }
      
      console.log('📊 Processed stats data:', data);
      setStats({
        total: data.total || 0,
        pending: data.pending || 0,
        confirmed: data.confirmed || 0,
        completed: data.completed || 0
      });
    } catch (error: any) {
      console.error("❌ Error fetching stats:", error);
      toast.error(error.message || "Failed to fetch booking statistics");
      setStats({ total: 0, pending: 0, confirmed: 0, completed: 0 });
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
            <p className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.4em]">
              {activeTabConfig.title} — Chronicle of Platform Engagements
            </p>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <TabsList className="flex items-center gap-1.5 bg-white border border-slate-100 p-2 rounded-[2rem] h-auto w-fit shadow-sm">
            {Object.entries(TABS_CONFIG).map(([id, tab]) => (
              <TabsTrigger
                key={id}
                value={id}
                className={`h-12 px-8 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-700 flex items-center gap-3 relative overflow-hidden group 
                  ${statusFilter === id 
                    ? "!bg-[#1a1c1e] !text-white shadow-2xl translate-y-[-2px] ring-4 ring-slate-900/5 scale-105" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/80"}
                  `}
              >
                <div className={`p-1.5 rounded-lg transition-colors 
                  ${statusFilter === id ? "!bg-white/10 !text-white" : "bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-slate-600"}
                `}>
                  {tab.icon}
                </div>
                <span className="relative z-10">{tab.label}</span>
                {statusFilter === id && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-0" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="hidden lg:flex flex-col items-end text-right animate-in fade-in slide-in-from-right-4 duration-1000">
            <h2 className="text-3xl font-serif italic text-slate-900 tracking-tight leading-none">
              {activeTabConfig.label}
            </h2>
            <p className="text-[9px] font-black text-[#608d64] uppercase tracking-[0.3em] mt-2">
              Viewing Category Content
            </p>
          </div>
        </div>

        {/* Dynamic Context Section */}
        <div className="mb-10 p-10 bg-white border border-slate-50 rounded-[3rem] animate-in fade-in slide-in-from-bottom-2 duration-700 flex flex-col md:flex-row md:items-center gap-10">
          <div className="h-20 w-20 rounded-[1.8rem] bg-[#608d64]/5 border border-[#608d64]/10 flex items-center justify-center shrink-0">
            {statusFilter === "all" ? (
              <ClipboardList className="w-10 h-10 text-[#608d64]/40" />
            ) : (
              <div className="text-[#608d64]/40 scale-[2] transform-gpu transition-transform duration-500">
                {activeTabConfig.icon}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-serif italic text-slate-900">{activeTabConfig.title}</h3>
            <p className="text-[11px] font-medium text-slate-600 uppercase tracking-widest max-w-2xl leading-relaxed">
              {activeTabConfig.description}
            </p>
          </div>
        </div>


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
        <DialogContent className="max-w-[95vw] lg:max-w-7xl w-full p-0 overflow-hidden border-none rounded-[3rem] shadow-2xl">
          <div className="bg-[#fdfcf9] p-6 md:p-14 space-y-10 lg:space-y-14 max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-3xl md:text-5xl font-serif italic text-slate-900 tracking-tight outline-none">Ledger Dossier</DialogTitle>
              <div className="flex items-center gap-3">
                <div className="h-[1px] w-8 bg-[#608d64]/60" />
                <p className="text-[10px] md:text-[12px] font-black text-[#608d64] uppercase tracking-[0.4em]">Detailed Transaction Insight</p>
              </div>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150 fill-mode-both">
                {/* Visual Identity Hub */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
                  <div className="h-24 w-24 md:h-32 md:w-32 rounded-[2.5rem] bg-white border-4 border-white shadow-2xl shadow-slate-200/50 flex items-center justify-center shrink-0">
                    <User className="w-10 h-10 md:w-14 md:h-14 text-[#608d64]/60" />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-3xl md:text-4xl font-serif italic text-slate-900 leading-tight">{selectedBooking.customer_name}</h4>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2.5 ${getStatusConfig(selectedBooking.status).bg} ${getStatusConfig(selectedBooking.status).color}`}>
                        {getStatusConfig(selectedBooking.status).icon}
                        {getStatusConfig(selectedBooking.status).label}
                      </span>
                      <span className="px-4 py-2 bg-slate-50 rounded-full text-[11px] text-slate-500 font-medium flex items-center gap-2 font-mono border border-slate-100">
                        <span className="text-slate-300">#</span>{selectedBooking.id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Narrative Grid */}
                <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
                  <div className="space-y-10">
                    <div className="space-y-5">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] ml-2">Engagement Details</p>
                      <div className="space-y-6 bg-white p-8 md:p-10 rounded-[3rem] border border-slate-50 shadow-sm">
                        <div className="flex items-center gap-5 group/item text-left">
                          <div className="p-3.5 bg-slate-50 rounded-2xl text-slate-400 group-hover/item:text-[#608d64] group-hover/item:bg-[#608d64]/5 transition-colors"><Package className="w-5 h-5" /></div>
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Service Profile</p>
                            <p className="text-lg font-serif italic text-slate-800 leading-tight">{selectedBooking.service_name}</p>
                          </div>
                        </div>
                        {selectedBooking.package_name && (
                          <div className="flex items-center gap-5 group/item text-left">
                            <div className="p-3.5 bg-slate-50 rounded-2xl text-slate-400 group-hover/item:text-[#608d64] group-hover/item:bg-[#608d64]/5 transition-colors"><ClipboardList className="w-5 h-5" /></div>
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Selected Tier</p>
                              <p className="text-lg font-medium text-slate-800 leading-tight">{selectedBooking.package_name}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-5 group/item text-left">
                          <div className="p-3.5 bg-slate-50 rounded-2xl text-slate-400 group-hover/item:text-[#608d64] group-hover/item:bg-[#608d64]/5 transition-colors"><MapPin className="w-5 h-5" /></div>
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Sanctuary Location</p>
                            <p className="text-lg font-medium text-slate-800 leading-tight">{selectedBooking.event_location || "Confidential Location"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="space-y-5 h-full flex flex-col text-left">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] ml-2">Timeline & Value</p>
                      <div className="flex-1 space-y-8 bg-[#608d64]/5 p-8 md:p-10 rounded-[3rem] border border-[#608d64]/10">
                        <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Engagement Horizon</p>
                            <p className="text-xl md:text-2xl font-serif italic text-slate-800">
                              {new Date(selectedBooking.booking_date).toLocaleDateString('en-CA', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Entry Date</p>
                            <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(selectedBooking.created_at).toLocaleDateString('en-CA')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="pt-8 border-t border-[#608d64]/10 space-y-2">
                          <p className="text-[11px] font-black text-[#608d64] uppercase tracking-[0.3em] leading-none mb-2">Total Transaction Value</p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-5xl font-serif italic text-[#4a6e4d]">
                              {selectedBooking.total_amount.toLocaleString()}
                            </p>
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-200 pb-1">RWF</span>
                          </div>
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
                className="w-full h-16 bg-slate-950 text-white border-none rounded-[2rem] font-black uppercase tracking-[0.3em] text-[12px] hover:bg-slate-900 transition-all duration-500 shadow-2xl shadow-slate-200 mt-4 group"
              >
                <span className="group-hover:tracking-[0.4em] transition-all">Conclude Dossier</span>
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
