"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, XCircle, CheckCircle, Search, MapPin, Package, Calendar, UserCircle2, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { StatCard } from "./stat-card";
import { cn } from "@/lib/utils";

interface RitualEvent {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  event_date: string;
  capacity: number;
  tickets_sold: number;
  total_revenue: number;
  image_url?: string;
  status: "draft" | "pending_approval" | "published" | "approved" | "rejected" | "ongoing" | "completed";
  created_at: string;
  provider: {
    id: string;
    full_name: string;
    email: string;
  };
}

export function AdminEvents() {
  const [events, setEvents] = useState<RitualEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending_approval");
  const [selectedEvent, setSelectedEvent] = useState<RitualEvent | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [statusFilter]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.admin.events.getAll(statusFilter === "all" ? undefined : statusFilter);
      const data = response.data || [];
      setEvents(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch rituals");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEventDetails = async (id: string) => {
    try {
      const response = await apiClient.admin.events.getDetails(id);
      setSelectedEvent(response.data || response);
      setIsDetailsModalOpen(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch ritual details");
    }
  };

  const handleAction = async () => {
    if (!selectedEvent) return;
    setIsProcessing(true);
    try {
      if (actionType === "approve") {
        await apiClient.admin.events.approve(selectedEvent.id, adminNotes);
        toast.success("Ritual authorized successfully");
      } else if (actionType === "reject") {
        if (!adminNotes.trim()) {
          toast.error("Please provide a reason for declination");
          setIsProcessing(false);
          return;
        }
        await apiClient.admin.events.reject(selectedEvent.id, adminNotes);
        toast.success("Ritual declined");
      }
      setIsActionModalOpen(false);
      setIsDetailsModalOpen(false);
      setAdminNotes("");
      setSelectedEvent(null);
      fetchEvents();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${actionType} ritual`);
    } finally {
      setIsProcessing(false);
    }
  };

  const openActionModal = (event: RitualEvent, type: typeof actionType) => {
    setSelectedEvent(event);
    setActionType(type);
    setIsActionModalOpen(true);
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: events.length,
    pending: events.filter(e => e.status === "pending_approval").length,
    approved: events.filter(e => e.status === "approved" || e.status === "ongoing" || e.status === "completed").length,
    rejected: events.filter(e => e.status === "rejected").length
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-10">
      {/* Editorial Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif italic text-slate-900 tracking-tight">Ritual Manifests</h1>
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-[#668c65]/60" />
            <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.4em]">Reviewing the Sacred Gatherings</p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-600 group-focus-within:text-[#668c65] transition-colors" />
          </div>
          <Input
            placeholder="Search manifests..."
            className="pl-12 pr-4 h-14 w-full md:w-[320px] bg-white border-slate-100 rounded-2xl focus-visible:ring-1 focus-visible:ring-[#668c65] focus-visible:border-[#668c65] shadow-none transition-all duration-300 placeholder:text-slate-500 placeholder:font-light"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Directory Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard label="Total Manifests" value={stats.total} />
        <StatCard label="Awaiting Sanction" value={stats.pending} color="text-amber-600" />
        <StatCard label="Sanctioned" value={stats.approved} color="text-[#668c65]" />
        <StatCard label="Retracted" value={stats.rejected} color="text-rose-600" />
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="flex items-center gap-1 bg-white border border-slate-100 p-1.5 rounded-[1.8rem] h-auto w-fit mb-8 shadow-sm">
          {[
            { id: "pending_approval", label: "Awaiting Sanction" },
            { id: "approved", label: "Sanctioned" },
            { id: "rejected", label: "Retracted" },
            { id: "all", label: "Complete Logs" }
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={`h-11 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2 ${statusFilter === tab.id
                ? "bg-slate-900 text-white shadow-xl translate-y-[-1px]"
                : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
            >
              {tab.label}
              {tab.id === "pending_approval" && stats.pending > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[8px] font-black border ${statusFilter === "pending_approval" ? "bg-white/20 border-white/40 text-white" : "bg-rose-50 border-rose-100 text-rose-500"}`}>
                  {stats.pending}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={statusFilter} className="mt-0 focus-visible:outline-none">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader className="w-8 h-8 text-[#668c65] animate-spin" />
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Retrieving Manifests</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-32 rounded-[3rem] border border-dashed border-slate-200 bg-slate-50/50">
              <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-serif italic text-slate-600">Ritual registry subset is clear</h3>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2 px-10">No {statusFilter} manifests match your curation filters</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="border-slate-100 bg-white shadow-none rounded-[2.5rem] overflow-hidden hover:border-[#668c65]/20 transition-all duration-500 group">
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                      {/* Ritual Identity Area */}
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <div className="h-20 w-20 rounded-[1.5rem] bg-slate-50 border-2 border-slate-50 flex items-center justify-center group-hover:border-[#668c65]/10 transition-colors overflow-hidden">
                            {event.image_url ? (
                              <img src={event.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Calendar className="w-8 h-8 text-[#668c65]/40" />
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-2xl font-serif italic text-slate-900 tracking-tight group-hover:text-[#668c65] transition-colors duration-500 leading-tight">
                            {event.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="outline" className="bg-[#668c65]/5 border-[#668c65]/20 text-[#668c65] px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-none">
                              {event.category}
                            </Badge>
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Ritual Metadata */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:items-center gap-8 lg:gap-14">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Temporal Origin</p>
                          <p className="text-sm font-medium text-slate-900 font-serif italic">
                            {new Date(event.event_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Originator</p>
                          <p className="text-sm font-medium text-slate-600 truncate max-w-[120px]">
                            {event.provider?.full_name || "Unknown"}
                          </p>
                        </div>

                        {/* Refined Actions */}
                        <div className="col-span-2 md:col-span-1 flex items-center gap-2 lg:ml-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchEventDetails(event.id)}
                            className="h-11 px-5 rounded-2xl border-slate-100 hover:border-[#668c65] hover:bg-[#668c65]/5 text-slate-600 hover:text-[#668c65] transition-all duration-300 flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">Inspect</span>
                          </Button>
                          {(event.status === "pending_approval") && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => openActionModal(event, "approve")}
                                className="h-11 px-5 rounded-2xl bg-[#668c65] hover:bg-[#4a6e4d] text-white shadow-lg shadow-[#668c65]/10 transition-all duration-300 flex items-center gap-2 border-none"
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Sanction</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openActionModal(event, "reject")}
                                className="h-11 w-11 p-0 rounded-2xl border-rose-50 text-rose-500 hover:bg-rose-50 transition-all duration-300 flex items-center justify-center outline-none"
                              >
                                <XCircle className="h-5 w-5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Modal */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl bg-white">
          <div className="p-8 space-y-6 text-slate-900">
            <div className="space-y-2">
              <h2 className="text-2xl font-serif italic text-slate-900 capitalize leading-tight">
                {actionType} Ritual
              </h2>
              <div className="h-[1px] w-12 bg-[#668c65]/60" />
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                Finalizing the Manifest Record
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Administrative Narrative</Label>
                <Textarea
                  placeholder={actionType === "approve" ? "Optional: Add an authorization note..." : "Reason for declination (Required)..."}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="min-h-[120px] rounded-2xl border-slate-100 focus-visible:ring-1 focus-visible:ring-[#668c65] focus-visible:border-[#668c65] resize-none p-4 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsActionModalOpen(false)}
                className="flex-1 h-12 rounded-2xl border-slate-100 text-slate-700 hover:bg-slate-50 font-bold uppercase text-[10px] tracking-widest transition-all"
              >
                Retreat
              </Button>
              <Button
                onClick={handleAction}
                disabled={isProcessing || (actionType === "reject" && !adminNotes.trim())}
                className={cn(
                  "flex-1 h-12 rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-lg transition-all",
                  actionType === "approve"
                    ? "bg-[#668c65] hover:bg-[#4a6e4d] text-white shadow-[#668c65]/20"
                    : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20"
                )}
              >
                {isProcessing ? "Processing..." : `Confirm ${actionType}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none rounded-[3rem] shadow-2xl bg-slate-50/50 backdrop-blur-xl max-h-[90vh]">
          {selectedEvent && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="relative h-[300px] shrink-0">
                {selectedEvent.image_url ? (
                  <img
                    src={selectedEvent.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <Calendar className="w-16 h-16 text-slate-200" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-end justify-between gap-6">
                    <div className="space-y-2">
                      <Badge className="bg-[#668c65] text-white hover:bg-[#668c65] border-none px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                        {selectedEvent.category}
                      </Badge>
                      <h2 className="text-4xl font-serif italic text-white leading-tight">
                        {selectedEvent.title}
                      </h2>
                    </div>
                    {(selectedEvent.status === "pending_approval") && (
                      <div className="flex gap-3 mb-1">
                        <Button
                          size="sm"
                          onClick={() => openActionModal(selectedEvent!, "approve")}
                          className="h-11 px-6 rounded-2xl bg-white text-slate-900 hover:bg-slate-50 font-bold uppercase text-[10px] tracking-widest shadow-xl transition-all"
                        >
                          Sanction Manifest
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="md:col-span-2 space-y-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-px w-8 bg-[#668c65]/40" />
                        <h3 className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.4em]">The Narrative</h3>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-light text-lg">
                        {selectedEvent.description || "No narrative provided for this manifest."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Originator</p>
                        <div className="flex items-center gap-3 pt-2">
                          <div className="h-10 w-10 rounded-full bg-[#668c65]/10 flex items-center justify-center">
                            <UserCircle2 className="w-6 h-6 text-[#668c65]" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{selectedEvent.provider?.full_name}</p>
                            <p className="text-[10px] text-slate-600 font-light">{selectedEvent.provider?.email}</p>
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-slate-50" />

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Location</span>
                          <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {selectedEvent.location}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Gathering Date</span>
                          <span className="text-xs font-medium text-slate-600">
                            {new Date(selectedEvent.event_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Collective Capacity</span>
                          <span className="text-xs font-medium text-slate-600">
                            {selectedEvent.capacity} Souls
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
