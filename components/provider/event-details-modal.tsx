"use client";

import { useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Download,
  Share2,
  Edit,
  X,
  AlertCircle,
  CheckCircle,
  Loader,
  Ticket,
  TrendingUp,
  Eye,
  Search,
} from "lucide-react";
import { useUpdateEvent, useEventAnalytics, useTickets } from "@/hooks/useEvents";
import { Event as IEvent, TicketType as ITicketType } from "@/lib/api/events";
import { TicketManagement } from "./ticket-management";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { cn } from "@/lib/utils";

interface EventDetailsModalProps {
  event: IEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  standalone?: boolean;
}

interface EditFormData {
  title: string;
  description: string;
  location: string;
  capacity: string;
}

interface EditErrors {
  title?: string;
  description?: string;
  location?: string;
  capacity?: string;
}

export function EventDetailsModal({ event, open, onOpenChange, standalone }: EventDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    title: event.title,
    description: event.description || "",
    location: event.location,
    capacity: event.capacity.toString(),
  });
  const [editErrors, setEditErrors] = useState<EditErrors>({});

  const updateEventMutation = useUpdateEvent();
  const { data: analytics, isLoading: analyticsLoading } = useEventAnalytics(event.id);
  const { data: tickets = [], isLoading: ticketsLoading } = useTickets(event.id);

  // Mock data for charts
  const ticketSalesData = [
    { day: "Mon", sales: 45 },
    { day: "Tue", sales: 52 },
    { day: "Wed", sales: 48 },
    { day: "Thu", sales: 61 },
    { day: "Fri", sales: 55 },
    { day: "Sat", sales: 67 },
    { day: "Sun", sales: 72 },
  ];

  const revenueData = [
    { type: "Standard", revenue: 1000000 },
    { type: "VIP", revenue: 800000 },
    { type: "Premium", revenue: 600000 },
  ];

  const occupancyPercentage = analytics
    ? analytics.occupancy_percentage
    : (event.tickets_sold / event.capacity) * 100 || 0;

  const validateEditForm = (): boolean => {
    const errors: EditErrors = {};

    if (!editFormData.title.trim()) errors.title = "Title is required";
    if (!editFormData.description.trim()) errors.description = "Description is required";
    if (!editFormData.location.trim()) errors.location = "Location is required";
    if (!editFormData.capacity) errors.capacity = "Capacity is required";
    if (Number(editFormData.capacity) <= 0) errors.capacity = "Capacity must be greater than 0";

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    if (editErrors[name as keyof EditErrors]) {
      setEditErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSaveEdit = async () => {
    if (validateEditForm()) {
      try {
        await updateEventMutation.mutateAsync({
          eventId: event.id,
          data: editFormData,
        });
        setIsEditingEvent(false);
      } catch (error) {
        setEditErrors({
          title: error instanceof Error ? error.message : "Failed to update event",
        });
      }
    }
  };

  const handleExportAttendees = () => {
    console.log("Exporting attendee list...");
  };

  const handleShareEvent = () => {
    console.log("Sharing event...");
  };

  const modalContent = (
    <div className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none rounded-[2.5rem] shadow-2xl bg-white relative">
      {/* Header Section */}
      <div className="bg-[#668c65]/5 p-12 border-b border-[#668c65]/10 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
        <div className="flex-1 text-left">
          <h2 className="text-5xl font-serif italic text-slate-900 tracking-tight leading-none mb-3">
            {event.title}
          </h2>
          <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.3em] mt-2">
            Ritual Manifest & Analytical Review
          </p>
        </div>
        {!standalone && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-12 w-12 rounded-full hover:bg-white transition-all text-slate-400"
          >
            <X className="h-6 w-6" />
          </Button>
        )}
      </div>

      <div className="p-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full bg-transparent border-b border-slate-100 rounded-none h-auto p-0 mb-12 overflow-x-auto no-scrollbar">
            {[
              { id: "overview", label: "Existential Overview" },
              { id: "tickets", label: "Allocation Mastery" },
              { id: "analytics", label: "Strategic Insight" },
              { id: "attendees", label: "Collective Registry" }
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#668c65] data-[state=active]:text-[#668c65] rounded-none py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-all border-b-2 border-transparent whitespace-nowrap"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Event Hero */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="md:col-span-8 space-y-8">
                <div className="aspect-[16/7] bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 relative group">
                  {event.image_url ? (
                    <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <Calendar className="h-20 w-20" />
                    </div>
                  )}
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-white/90 backdrop-blur-md text-[#668c65] border-none px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                      {event.status} Ritual
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.3em] flex items-center gap-3">
                    <div className="h-[1px] w-8 bg-[#668c65]/30" />
                    Narrative Essence
                  </h3>
                  <p className="text-xl font-serif italic text-slate-600 leading-relaxed indent-8">
                    {event.description}
                  </p>
                </div>
              </div>

              <div className="md:col-span-4 space-y-6">
                {[
                  { icon: Calendar, label: "Alignment Date", value: new Date(event.event_date).toLocaleDateString(undefined, { dateStyle: 'long' }), sub: event.event_time },
                  { icon: MapPin, label: "Venue Coordinates", value: event.location },
                  { icon: Users, label: "Human Capacity", value: `${event.capacity} Souls`, sub: `${Math.round(occupancyPercentage)}% Manifested` },
                  { icon: DollarSign, label: "Accumulated Value", value: `${(event.total_revenue).toLocaleString()} RWF`, color: "text-[#668c65]" }
                ].map((item, i) => (
                  <Card key={i} className="border-none shadow-none bg-slate-50/50 rounded-3xl p-6 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#668c65]">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className={cn("text-sm font-serif italic font-bold text-slate-900", item.color)}>{item.value}</p>
                        {item.sub && <p className="text-[10px] text-slate-400 font-medium italic">{item.sub}</p>}
                      </div>
                    </div>
                  </Card>
                ))}

                <div className="pt-6 space-y-3">
                  <Button onClick={() => setIsEditingEvent(true)} className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                    Refine Manifest
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={handleShareEvent} className="h-12 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50">
                      Disseminate
                    </Button>
                    <Button variant="outline" onClick={handleExportAttendees} className="h-12 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50">
                      Extract List
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Event Form */}
            {isEditingEvent && (
              <Card className="border-none bg-[#668c65]/5 rounded-[2.5rem] p-10 space-y-8 animate-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-2xl font-serif italic text-slate-900">Refine Ritual Details</h4>
                    <p className="text-[10px] font-black text-[#668c65] uppercase tracking-widest mt-1">Adjusting the coordinates of your gathering</p>
                  </div>
                  <Button variant="ghost" onClick={() => setIsEditingEvent(false)} className="h-10 w-10 rounded-full">
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</Label>
                    <Input
                      name="title"
                      value={editFormData.title}
                      onChange={handleEditChange}
                      className="h-14 rounded-2xl border-slate-100 bg-white focus:ring-0 focus:border-[#668c65]/30 transition-all font-serif italic text-lg"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</Label>
                    <Textarea
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditChange}
                      rows={4}
                      className="rounded-2xl border-slate-100 bg-white focus:ring-0 focus:border-[#668c65]/30 transition-all font-serif italic text-base resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</Label>
                    <Input
                      name="location"
                      value={editFormData.location}
                      onChange={handleEditChange}
                      className="h-14 rounded-2xl border-slate-100 bg-white focus:ring-0 focus:border-[#668c65]/30 transition-all font-serif italic text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Capacity</Label>
                    <Input
                      name="capacity"
                      type="number"
                      value={editFormData.capacity}
                      onChange={handleEditChange}
                      className="h-14 rounded-2xl border-slate-100 bg-white focus:ring-0 focus:border-[#668c65]/30 transition-all font-serif italic text-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setIsEditingEvent(false)} className="h-14 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 rounded-2xl">
                    Discard
                  </Button>
                  <Button onClick={handleSaveEdit} className="h-14 flex-1 bg-[#668c65] hover:bg-[#5a7b59] text-white rounded-2xl shadow-xl shadow-[#668c65]/20 text-[10px] font-black uppercase tracking-widest">
                    {updateEventMutation.isPending ? "Synchronizing..." : "Seal Manifest"}
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-4">
            <TicketManagement
              eventId={event.id}
              eventCapacity={event.capacity}
              ticketTypes={event.ticket_types || []}
              tickets={tickets}
              onTicketTypeAdded={() => {
                // Refresh event data
              }}
              onTicketCreated={() => {
                // Refresh event data
              }}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {analyticsLoading ? (
              <div className="flex flex-col items-center justify-center py-40 space-y-6">
                <Loader className="h-12 w-12 text-[#668c65] animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Extracting Strategic Data...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <Card className="border-none shadow-none bg-slate-50/50 rounded-[2.5rem] p-10 space-y-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-2xl font-serif italic text-slate-900 leading-none">Velocity Trend</h4>
                        <p className="text-[10px] font-black text-[#668c65] uppercase tracking-widest mt-2">Daily ritual alignment frequency</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-[#668c65]/20" />
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={ticketSalesData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }}
                            dy={20}
                          />
                          <YAxis hide />
                          <Tooltip
                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '15px' }}
                            itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                          />
                          <Line
                            type="monotone"
                            dataKey="sales"
                            stroke="#668c65"
                            strokeWidth={4}
                            dot={{ fill: "#668c65", r: 6, strokeWidth: 4, stroke: "#fff" }}
                            activeDot={{ r: 8, strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card className="border-none shadow-none bg-slate-900 text-white rounded-[2.5rem] p-10 space-y-8">
                    <div>
                      <h4 className="text-2xl font-serif italic text-white leading-none">Wealth Distribution</h4>
                      <p className="text-[10px] font-black text-[#668c65] uppercase tracking-widest mt-2">Revenue architecture by offering type</p>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData}>
                          <XAxis
                            dataKey="type"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }}
                            dy={20}
                          />
                          <YAxis hide />
                          <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ backgroundColor: '#1E293B', borderRadius: '20px', border: 'none', padding: '15px' }}
                            itemStyle={{ color: '#668c65', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                          />
                          <Bar
                            dataKey="revenue"
                            fill="#668c65"
                            radius={[12, 12, 12, 12]}
                            barSize={40}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: "Total Manifested", value: analytics?.total_tickets_sold || event.tickets_sold, sub: "Unique Souls" },
                    { label: "Saturation Rate", value: `${analytics?.occupancy_percentage.toFixed(1) || Math.round(occupancyPercentage)}%`, sub: "Venue Density" },
                    { label: "Mean Valuation", value: `${(analytics?.average_ticket_price || 0).toLocaleString()} RWF`, sub: "Per Offering" },
                    { label: "Current Wealth", value: `${((analytics?.total_revenue || event.total_revenue)).toLocaleString()} RWF`, sub: "Aggregated Gross", highlight: true }
                  ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-none bg-white rounded-[2rem] p-8 border border-slate-50 transition-all hover:shadow-2xl hover:shadow-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                      <p className={cn("text-2xl font-serif italic font-bold", stat.highlight ? "text-[#668c65]" : "text-slate-900")}>
                        {stat.value}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium italic mt-1">{stat.sub}</p>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Attendees Tab */}
          <TabsContent value="attendees" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="border-none shadow-none bg-slate-50/50 rounded-[2.5rem] p-10">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h4 className="text-3xl font-serif italic text-slate-900 leading-none">Collective Registry</h4>
                  <p className="text-[10px] font-black text-[#668c65] uppercase tracking-widest mt-3">The assembly of confirmed attendees</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="Search Registry..." className="h-12 pl-12 pr-6 rounded-full border-slate-100 bg-white shadow-sm w-[250px] text-[10px] font-black uppercase tracking-widest placeholder:text-slate-300" />
                </div>
              </div>

              {ticketsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader className="h-8 w-8 animate-spin text-[#668c65]" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-20">
                  <Users className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No souls manifested in this ritual registry yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket: any) => (
                    <div key={ticket.id} className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-50 hover:shadow-xl hover:shadow-slate-100 transition-all duration-500 group">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-[#668c65]/5 flex items-center justify-center relative overflow-hidden">
                          <span className="text-xl font-serif italic text-[#668c65] z-10">
                            {ticket.holder_name.charAt(0)}
                          </span>
                          <div className="absolute inset-0 bg-[#668c65]/10 scale-0 group-hover:scale-150 transition-transform duration-700 rounded-full" />
                        </div>
                        <div>
                          <p className="text-xl font-serif italic text-slate-900 leading-none">{ticket.holder_name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{ticket.holder_email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <Badge className="bg-slate-50 text-slate-600 border-none px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest mb-1">
                            {ticket.ticket_number}
                          </Badge>
                          <p className={cn("text-[10px] font-black uppercase tracking-widest flex items-center justify-end gap-1",
                            ticket.is_checked_in ? "text-[#668c65]" : "text-amber-500"
                          )}>
                            <CheckCircle className="h-3 w-3" />
                            {ticket.is_checked_in ? "Manifested (Checked In)" : "Pending Arrival"}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl border border-slate-50 opacity-0 group-hover:opacity-100 transition-all">
                          <Eye className="h-5 w-5 text-slate-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Button onClick={handleExportAttendees} className="w-full h-20 bg-slate-900 hover:bg-black text-white rounded-[2.5rem] flex items-center justify-center gap-4 transition-all shadow-2xl shadow-slate-900/10">
              <Download className="h-6 w-6 text-[#668c65]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Extract Entire Collective Registry</span>
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  if (standalone) {
    return modalContent;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl p-0 border-none bg-transparent shadow-none"
        showCloseButton={false}
      >
        {modalContent}
      </DialogContent>
    </Dialog>
  );
}
