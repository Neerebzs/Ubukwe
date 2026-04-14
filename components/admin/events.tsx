"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Eye, XCircle, CheckCircle, Search, MapPin,
  Calendar, UserCircle2, Ticket, Users, TrendingUp,
} from "lucide-react";
import { StatCard } from "./stat-card";
import { toast } from "sonner";
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
  provider?: {
    id: string;
    full_name: string;
    email: string;
  };
}

const STATUS_TABS = [
  { id: "pending_approval", label: "Awaiting Sanction" },
  { id: "approved",         label: "Sanctioned" },
  { id: "rejected",         label: "Retracted" },
  { id: "all",              label: "Complete Logs" },
];

const STATUS_BADGE: Record<string, string> = {
  pending_approval: "bg-amber-50 text-amber-700 border-amber-100",
  approved:         "bg-emerald-50 text-emerald-700 border-emerald-100",
  rejected:         "bg-rose-50 text-rose-700 border-rose-100",
  ongoing:          "bg-blue-50 text-blue-700 border-blue-100",
  completed:        "bg-slate-50 text-slate-600 border-slate-100",
  draft:            "bg-slate-50 text-slate-500 border-slate-100",
  published:        "bg-[#668c65]/10 text-[#668c65] border-[#668c65]/20",
};

export function AdminEvents() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending_approval");
  const [selectedEvent, setSelectedEvent] = useState<RitualEvent | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [adminNotes, setAdminNotes] = useState("");

  // ── Stats (always fetched, not filtered) ──────────────────────────────────
  const { data: statsData } = useQuery({
    queryKey: ["admin-event-stats"],
    queryFn: async () => {
      const res = await apiClient.admin.events.getStats();
      return res.data as any;
    },
    refetchInterval: 30_000,
  });

  const stats = {
    total:   statsData?.total_events      ?? 0,
    pending: statsData?.pending_approval  ?? 0,
    approved:statsData?.approved          ?? 0,
    rejected:statsData?.rejected          ?? 0,
  };

  // ── Events list (filtered by tab) ─────────────────────────────────────────
  const { data: events = [], isLoading } = useQuery<RitualEvent[]>({
    queryKey: ["admin-events", statusFilter],
    queryFn: async () => {
      const res = await apiClient.admin.events.getAll(
        statusFilter === "all" ? undefined : statusFilter
      );
      const data = res.data as any;
      return Array.isArray(data?.data) ? data.data
        : Array.isArray(data) ? data : [];
    },
    refetchInterval: 30_000,
  });

  // ── Approve mutation ───────────────────────────────────────────────────────
  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.admin.events.approve(id, adminNotes || undefined),
    onSuccess: () => {
      toast.success("Event approved successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-event-stats"] });
      closeModals();
    },
    onError: (err: any) => toast.error(err.message || "Failed to approve event"),
  });

  // ── Reject mutation ────────────────────────────────────────────────────────
  const rejectMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.admin.events.reject(id, adminNotes),
    onSuccess: () => {
      toast.success("Event rejected");
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-event-stats"] });
      closeModals();
    },
    onError: (err: any) => toast.error(err.message || "Failed to reject event"),
  });

  const closeModals = () => {
    setActionOpen(false);
    setDetailsOpen(false);
    setAdminNotes("");
    setSelectedEvent(null);
  };

  const openAction = (event: RitualEvent, type: "approve" | "reject") => {
    setSelectedEvent(event);
    setActionType(type);
    setAdminNotes("");
    setActionOpen(true);
  };

  const handleAction = () => {
    if (!selectedEvent) return;
    if (actionType === "reject" && !adminNotes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    if (actionType === "approve") approveMutation.mutate(selectedEvent.id);
    else rejectMutation.mutate(selectedEvent.id);
  };

  const isPending = approveMutation.isPending || rejectMutation.isPending;

  const filtered = events.filter(e =>
    [e.title, e.category, e.location].some(f =>
      f?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif italic text-slate-900 tracking-tight">Ritual Manifests</h1>
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-[#668c65]/60" />
            <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.4em]">
              Reviewing the Sacred Gatherings
            </p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search events..."
            className="pl-12 h-12 w-full md:w-[300px] bg-white border-slate-100 rounded-2xl shadow-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats — always from API, not filtered */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard label="Total Events"       value={stats.total}    />
        <StatCard label="Awaiting Sanction"  value={stats.pending}  color="text-amber-600" />
        <StatCard label="Sanctioned"         value={stats.approved} color="text-[#668c65]" />
        <StatCard label="Retracted"          value={stats.rejected} color="text-rose-600" />
      </div>

      {/* Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="flex items-center gap-1 bg-white border border-slate-100 p-1.5 rounded-[1.8rem] h-auto w-fit mb-8 shadow-sm">
          {STATUS_TABS.map(tab => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="h-11 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-xl text-slate-600 hover:text-slate-800 hover:bg-slate-50 flex items-center gap-2"
            >
              {tab.label}
              {tab.id === "pending_approval" && stats.pending > 0 && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-[8px] font-black border",
                  statusFilter === "pending_approval"
                    ? "bg-white/20 border-white/40 text-white"
                    : "bg-rose-50 border-rose-100 text-rose-500"
                )}>
                  {stats.pending}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={statusFilter} className="mt-0 focus-visible:outline-none">
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <Skeleton key={i} className="h-36 rounded-[2.5rem]" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-28 rounded-[3rem] border border-dashed border-slate-200 bg-slate-50/50">
              <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-serif italic text-slate-500">No events found</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                No {statusFilter === "all" ? "" : statusFilter.replace("_", " ")} events match your search
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {filtered.map(event => (
                <Card
                  key={event.id}
                  className="border-slate-100 bg-white shadow-none rounded-[2.5rem] overflow-hidden hover:border-[#668c65]/20 hover:shadow-md transition-all duration-500 group"
                >
                  <CardContent className="p-7">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Identity */}
                      <div className="flex items-center gap-5">
                        <div className="h-18 w-18 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 h-16 w-16">
                          {event.image_url ? (
                            <img src={event.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Calendar className="w-7 h-7 text-[#668c65]/40" />
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <h3 className="text-xl font-serif italic text-slate-900 group-hover:text-[#668c65] transition-colors leading-tight">
                            {event.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={cn("px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border", STATUS_BADGE[event.status] ?? STATUS_BADGE.draft)}>
                              {event.status.replace(/_/g, " ")}
                            </Badge>
                            <Badge variant="outline" className="bg-[#668c65]/5 border-[#668c65]/20 text-[#668c65] px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                              {event.category}
                            </Badge>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{event.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-8 lg:gap-10">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Date</p>
                          <p className="text-sm font-medium text-slate-700 font-serif italic">
                            {new Date(event.event_date).toLocaleDateString("en-US", { dateStyle: "medium" })}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Capacity</p>
                          <p className="text-sm font-medium text-slate-700 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {event.tickets_sold ?? 0}/{event.capacity ?? 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Revenue</p>
                          <p className="text-sm font-medium text-slate-700 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                            {(event.total_revenue ?? 0).toLocaleString()} RWF
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Organiser</p>
                          <p className="text-sm font-medium text-slate-700 truncate max-w-[120px]">
                            {event.provider?.full_name || "—"}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSelectedEvent(event); setDetailsOpen(true); }}
                            className="h-10 px-4 rounded-2xl border-slate-100 hover:border-[#668c65] hover:bg-[#668c65]/5 text-slate-600 hover:text-[#668c65] transition-all gap-1.5"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Inspect</span>
                          </Button>
                          {event.status === "pending_approval" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => openAction(event, "approve")}
                                className="h-10 px-4 rounded-2xl bg-[#668c65] hover:bg-[#4a6e4d] text-white shadow-sm gap-1.5"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Approve</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openAction(event, "reject")}
                                className="h-10 w-10 p-0 rounded-2xl border-rose-100 text-rose-500 hover:bg-rose-50 transition-all"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
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
      <Dialog open={actionOpen} onOpenChange={setActionOpen}>
        <DialogContent className="sm:max-w-[460px] p-0 border-none rounded-[2rem] shadow-2xl bg-white overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-serif italic text-slate-900 capitalize">
                {actionType === "approve" ? "Approve Event" : "Reject Event"}
              </h2>
              <div className="h-[1px] w-10 bg-[#668c65]/60" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {selectedEvent?.title}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {actionType === "approve" ? "Notes (optional)" : "Rejection Reason *"}
              </Label>
              <Textarea
                placeholder={
                  actionType === "approve"
                    ? "Add an optional note for the provider..."
                    : "Explain why this event is being rejected..."
                }
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="min-h-[100px] rounded-2xl border-slate-100 resize-none p-4 placeholder:text-slate-300"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setActionOpen(false)}
                className="flex-1 h-12 rounded-2xl border-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-widest"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                disabled={isPending || (actionType === "reject" && !adminNotes.trim())}
                className={cn(
                  "flex-1 h-12 rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-lg transition-all disabled:opacity-50",
                  actionType === "approve"
                    ? "bg-[#668c65] hover:bg-[#4a6e4d] text-white"
                    : "bg-rose-600 hover:bg-rose-700 text-white"
                )}
              >
                {isPending ? "Processing..." : actionType === "approve" ? "Confirm Approval" : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl p-0 border-none rounded-[2.5rem] shadow-2xl bg-white overflow-hidden max-h-[90vh]">
          {selectedEvent && (
            <div className="flex flex-col overflow-hidden">
              {/* Hero image */}
              <div className="relative h-56 flex-shrink-0">
                {selectedEvent.image_url ? (
                  <img src={selectedEvent.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#668c65]/20 to-slate-100 flex items-center justify-center">
                    <Calendar className="w-16 h-16 text-[#668c65]/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between gap-4">
                  <div className="space-y-1">
                    <Badge className="bg-[#668c65] text-white border-none px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {selectedEvent.category}
                    </Badge>
                    <h2 className="text-3xl font-serif italic text-white leading-tight">
                      {selectedEvent.title}
                    </h2>
                  </div>
                  {selectedEvent.status === "pending_approval" && (
                    <Button
                      size="sm"
                      onClick={() => { setDetailsOpen(false); openAction(selectedEvent, "approve"); }}
                      className="h-10 px-5 rounded-2xl bg-white text-slate-900 hover:bg-slate-50 font-bold uppercase text-[9px] tracking-widest shadow-xl flex-shrink-0"
                    >
                      Approve
                    </Button>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="overflow-y-auto p-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Description */}
                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-[#668c65] uppercase tracking-[0.3em]">Description</p>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      {selectedEvent.description || "No description provided."}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Organiser</span>
                      <div className="flex items-center gap-2">
                        <UserCircle2 className="w-4 h-4 text-[#668c65]" />
                        <span className="text-sm font-medium text-slate-700">{selectedEvent.provider?.full_name || "—"}</span>
                      </div>
                    </div>
                    <Separator className="bg-slate-100" />
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Location</span>
                      <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />{selectedEvent.location}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</span>
                      <span className="text-sm font-medium text-slate-700">
                        {new Date(selectedEvent.event_date).toLocaleDateString("en-US", { dateStyle: "long" })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Capacity</span>
                      <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {selectedEvent.tickets_sold ?? 0} / {selectedEvent.capacity ?? 0} sold
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenue</span>
                      <span className="text-sm font-bold text-[#668c65]">
                        {(selectedEvent.total_revenue ?? 0).toLocaleString()} RWF
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                      <Badge variant="outline" className={cn("rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest border", STATUS_BADGE[selectedEvent.status] ?? STATUS_BADGE.draft)}>
                        {selectedEvent.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Action buttons in detail modal */}
                {selectedEvent.status === "pending_approval" && (
                  <div className="flex gap-3 pt-2 border-t border-slate-100">
                    <Button
                      className="flex-1 h-12 rounded-2xl bg-[#668c65] hover:bg-[#4a6e4d] text-white font-bold uppercase text-[10px] tracking-widest"
                      onClick={() => { setDetailsOpen(false); openAction(selectedEvent, "approve"); }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Approve Event
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-12 rounded-2xl border-rose-100 text-rose-600 hover:bg-rose-50 font-bold uppercase text-[10px] tracking-widest"
                      onClick={() => { setDetailsOpen(false); openAction(selectedEvent, "reject"); }}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Reject Event
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
