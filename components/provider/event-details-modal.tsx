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
  event_date: string;
}

interface EditErrors {
  title?: string;
  description?: string;
  location?: string;
  capacity?: string;
  event_date?: string;
}

export function EventDetailsModal({ event, open, onOpenChange, standalone }: EventDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    title: event.title,
    description: event.description || "",
    location: event.location,
    capacity: event.capacity.toString(),
    event_date: event.event_date ? new Date(event.event_date).toISOString().split('T')[0] : "",
  });
  const [editErrors, setEditErrors] = useState<EditErrors>({});

  const updateEventMutation = useUpdateEvent();
  const { data: analytics, isLoading: analyticsLoading } = useEventAnalytics(event.id);
  const { data: tickets = [], isLoading: ticketsLoading } = useTickets(event.id);

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
    if (!editFormData.event_date) errors.event_date = "Event date is required";

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
  };

  const handleShareEvent = () => {
  };

  const modalContent = (
    <div className={cn(
      "w-full p-0 border-none rounded-[2.5rem] bg-white relative shadow-sm",
      !standalone && "max-h-[92vh] overflow-y-auto"
    )}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-50 to-[#668c65]/5 p-10 md:p-14 border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xl shadow-sm">
        <div className="flex-1 text-left relative">
           <div className="absolute -left-10 md:-left-14 top-1/2 -translate-y-1/2 w-2 h-16 bg-[#668c65] rounded-r-lg" />
          <h2 className="text-4xl md:text-5xl font-serif italic text-slate-900 tracking-tight leading-none mb-3">
            {event.title}
          </h2>
          <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.3em] mt-2">
            Event Details & Analytics
          </p>
        </div>
        {!standalone && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-12 w-12 rounded-full hover:bg-white hover:text-slate-900 hover:shadow-lg transition-all duration-300 text-slate-400"
          >
            <X className="h-6 w-6" />
          </Button>
        )}
      </div>

      <div className="p-8 md:p-14">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="inline-flex w-full md:w-auto bg-slate-50/80 backdrop-blur-xl border border-slate-100/50 rounded-3xl p-2 mb-12 shadow-sm gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: "overview", label: "Overview" },
              { id: "tickets", label: "Tickets" },
              { id: "analytics", label: "Analytics" },
              { id: "attendees", label: "Guest List" }
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex-1 md:flex-none px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 data-[state=active]:bg-white data-[state=active]:text-[#668c65] data-[state=active]:shadow-lg data-[state=active]:shadow-slate-200/50 transition-all duration-500 whitespace-nowrap"
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
                <div className="aspect-[16/7] bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 relative group shadow-2xl shadow-slate-200/40">
                  {event.image_url ? (
                    <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <Calendar className="h-20 w-20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-white/95 backdrop-blur-md text-[#668c65] border-none px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                      {event.status} Event
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4 bg-white rounded-[2.5rem] p-10 border border-slate-50 shadow-xl shadow-slate-100/50">
                  <h3 className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.3em] flex items-center gap-3">
                    <div className="h-[1px] w-8 bg-[#668c65]/30" />
                    Description
                  </h3>
                  <p className="text-xl font-serif text-slate-600 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>

              <div className="md:col-span-4 space-y-4">
                {[
                  { icon: Calendar, label: "Event Date", value: new Date(event.event_date).toLocaleDateString(undefined, { dateStyle: 'long' }), sub: event.event_time },
                  { icon: MapPin, label: "Location", value: event.location },
                  { icon: Users, label: "Capacity", value: `${event.capacity} Guests`, sub: `${Math.round(occupancyPercentage)}% Registered` },
                  { icon: DollarSign, label: "Total Revenue", value: `${(event.total_revenue).toLocaleString()} RWF`, color: "text-[#668c65]" }
                ].map((item, i) => (
                  <Card key={i} className="border-none shadow-sm bg-white border border-slate-50 rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/50 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#668c65]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="flex items-center gap-5 relative z-10">
                      <div className="h-14 w-14 rounded-2xl bg-slate-50 group-hover:bg-[#668c65] group-hover:text-white transition-colors duration-500 flex items-center justify-center text-[#668c65] shadow-inner">
                        <item.icon className="h-6 w-6" />
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
                    Edit Event
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={handleShareEvent} className="h-12 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50">
                      Share
                    </Button>
                    <Button variant="outline" onClick={handleExportAttendees} className="h-12 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50">
                      Download List
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Event Form */}
            {isEditingEvent && (
              <Card className="border border-[#668c65]/10 bg-gradient-to-br from-[#668c65]/5 to-white rounded-[2.5rem] p-10 space-y-8 animate-in zoom-in-95 duration-500 shadow-2xl shadow-[#668c65]/5 mt-12">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-2xl font-serif italic text-slate-900">Edit Event Details</h4>
                    <p className="text-[10px] font-black text-[#668c65] uppercase tracking-widest mt-1">Update your event information below</p>
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
                    {editErrors.title && <p className="text-xs text-red-500 ml-1">{editErrors.title}</p>}
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
                    {editErrors.description && <p className="text-xs text-red-500 ml-1">{editErrors.description}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</Label>
                    <Input
                      name="location"
                      value={editFormData.location}
                      onChange={handleEditChange}
                      className="h-14 rounded-2xl border-slate-100 bg-white focus:ring-0 focus:border-[#668c65]/30 transition-all font-serif italic text-lg"
                    />
                    {editErrors.location && <p className="text-xs text-red-500 ml-1">{editErrors.location}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Date</Label>
                    <Input
                      name="event_date"
                      type="date"
                      value={editFormData.event_date}
                      onChange={handleEditChange}
                      className="h-14 rounded-2xl border-slate-100 bg-white focus:ring-0 focus:border-[#668c65]/30 transition-all font-serif italic text-lg"
                    />
                    {editErrors.event_date && <p className="text-xs text-red-500 ml-1">{editErrors.event_date}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Capacity</Label>
                    <Input
                      name="capacity"
                      type="number"
                      value={editFormData.capacity}
                      onChange={handleEditChange}
                      className="h-14 rounded-2xl border-slate-100 bg-white focus:ring-0 focus:border-[#668c65]/30 transition-all font-serif italic text-lg"
                    />
                    {editErrors.capacity && <p className="text-xs text-red-500 ml-1">{editErrors.capacity}</p>}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setIsEditingEvent(false)} className="h-14 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 rounded-2xl">
                    Discard
                  </Button>
                  <Button onClick={handleSaveEdit} className="h-14 flex-1 bg-[#668c65] hover:bg-[#5a7b59] text-white rounded-2xl shadow-xl shadow-[#668c65]/20 text-[10px] font-black uppercase tracking-widest">
                    {updateEventMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-8">
            {/* Real Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border border-white shadow-xl shadow-slate-200/30 bg-gradient-to-br from-white to-slate-50/50 rounded-[2rem] p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl group">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-50 group-hover:bg-[#668c65] group-hover:text-white transition-colors duration-500 flex items-center justify-center">
                    <Users className="h-6 w-6 text-[#668c65] group-hover:text-white transition-colors" />
                  </div>
                  <Badge className="bg-slate-50 text-slate-600 border-none px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                    Total
                  </Badge>
                </div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Event Capacity</p>
                <p className="text-4xl font-serif italic font-bold text-slate-900">{event.capacity.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 font-medium italic mt-1">Maximum Guests</p>
              </Card>

              <Card className="border border-white shadow-xl shadow-slate-200/30 bg-gradient-to-br from-[#668c65]/5 to-white rounded-[2rem] p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl group">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-[#668c65]/10 group-hover:bg-[#668c65] group-hover:text-white transition-colors duration-500 flex items-center justify-center">
                    <Ticket className="h-6 w-6 text-[#668c65] group-hover:text-white transition-colors" />
                  </div>
                  <Badge className="bg-[#668c65]/10 text-[#668c65] border-none px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                    Sold
                  </Badge>
                </div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Tickets Sold</p>
                <p className="text-4xl font-serif italic font-bold text-[#668c65]">{event.tickets_sold.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 font-medium italic mt-1">Confirmed Purchases</p>
              </Card>

              <Card className="border border-white shadow-xl shadow-slate-200/30 bg-gradient-to-br from-white to-amber-50/50 rounded-[2rem] p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl group">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-amber-50 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-500 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-amber-500 group-hover:text-white transition-colors" />
                  </div>
                  <Badge className="bg-amber-50 text-amber-600 border-none px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                    Available
                  </Badge>
                </div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Remaining Capacity</p>
                <p className="text-4xl font-serif italic font-bold text-amber-600">{(event.capacity - event.tickets_sold).toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 font-medium italic mt-1">{Math.round(((event.capacity - event.tickets_sold) / event.capacity) * 100)}% Still Available</p>
              </Card>
            </div>

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
            ) : analytics ? (
              <>
                {/* Real Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: "Total Registered", value: analytics.total_tickets_sold, sub: "Unique Guests" },
                    { label: "Occupancy Rate", value: `${analytics.occupancy_percentage.toFixed(1)}%`, sub: "Venue Capacity" },
                    { label: "Average Price", value: `${(analytics.average_ticket_price || 0).toLocaleString()} RWF`, sub: "Per Ticket" },
                    { label: "Total Earnings", value: `${analytics.total_revenue.toLocaleString()} RWF`, sub: "Total Sales", highlight: true }
                  ].map((stat, i) => (
                    <Card key={i} className="border border-white shadow-sm bg-gradient-to-b from-white to-slate-50/50 rounded-[2rem] p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/50 group">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-[#668c65] transition-colors">{stat.label}</p>
                      <p className={cn("text-3xl font-serif italic font-bold", stat.highlight ? "text-[#668c65]" : "text-slate-900")}>
                        {stat.value}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium italic mt-1">{stat.sub}</p>
                    </Card>
                  ))}
                </div>

                {/* Ticket Types Breakdown */}
                {analytics.ticket_types_breakdown && analytics.ticket_types_breakdown.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Revenue Distribution Chart */}
                    <Card className="border-none shadow-none bg-slate-900 text-white rounded-[2.5rem] p-10 space-y-8">
                      <div>
                        <h4 className="text-2xl font-serif italic text-white leading-none">Revenue Distribution</h4>
                        <p className="text-[10px] font-black text-[#668c65] uppercase tracking-widest mt-2">Revenue by ticket type</p>
                      </div>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analytics.ticket_types_breakdown}>
                            <XAxis
                              dataKey="name"
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
                              formatter={(value: number) => `${value.toLocaleString()} RWF`}
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

                    {/* Ticket Types Table */}
                    <Card className="border border-white/50 shadow-xl shadow-slate-200/30 bg-gradient-to-br from-white to-slate-50/50 rounded-[2.5rem] p-10 space-y-6">
                      <div>
                        <h4 className="text-2xl font-serif italic text-slate-900 leading-none">Ticket Types Performance</h4>
                        <p className="text-[10px] font-black text-[#668c65] uppercase tracking-widest mt-2">Sales breakdown by type</p>
                      </div>
                      <div className="space-y-4">
                        {analytics.ticket_types_breakdown.map((type, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-50 hover:shadow-lg transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-[#668c65]/10 group-hover:bg-[#668c65] transition-colors flex items-center justify-center">
                                <Ticket className="h-5 w-5 text-[#668c65] group-hover:text-white transition-colors" />
                              </div>
                              <div>
                                <p className="font-serif italic text-lg text-slate-900">{type.name}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                  {type.sold} / {type.quantity} Sold
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-serif italic text-lg text-[#668c65] font-bold">
                                {type.revenue.toLocaleString()} RWF
                              </p>
                              <p className="text-[8px] text-slate-400">
                                @ {type.price.toLocaleString()} RWF
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}

                {/* Check-in Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border border-white shadow-xl shadow-slate-200/30 bg-gradient-to-br from-white to-slate-50/50 rounded-[2rem] p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-[#668c65]/10 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-[#668c65]" />
                      </div>
                      <Badge className="bg-[#668c65]/10 text-[#668c65] border-none px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                        Checked In
                      </Badge>
                    </div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Guests Checked In</p>
                    <p className="text-4xl font-serif italic font-bold text-[#668c65]">{analytics.checked_in_count}</p>
                    <p className="text-[10px] text-slate-400 font-medium italic mt-1">
                      {analytics.check_in_percentage.toFixed(1)}% of total tickets
                    </p>
                  </Card>

                  <Card className="border border-white shadow-xl shadow-slate-200/30 bg-gradient-to-br from-white to-amber-50/50 rounded-[2rem] p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-amber-500" />
                      </div>
                      <Badge className="bg-amber-50 text-amber-600 border-none px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                        Pending
                      </Badge>
                    </div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Awaiting Check-in</p>
                    <p className="text-4xl font-serif italic font-bold text-amber-600">
                      {analytics.total_tickets_sold - analytics.checked_in_count}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium italic mt-1">
                      {(100 - analytics.check_in_percentage).toFixed(1)}% not yet arrived
                    </p>
                  </Card>
                </div>

                {/* Capacity Overview */}
                <Card className="border border-white shadow-xl shadow-slate-200/30 bg-gradient-to-br from-white to-slate-50/50 rounded-[2.5rem] p-10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-2xl font-serif italic text-slate-900 leading-none">Capacity Overview</h4>
                      <p className="text-[10px] font-black text-[#668c65] uppercase tracking-widest mt-2">Event occupancy status</p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-serif italic font-bold text-[#668c65]">
                        {analytics.occupancy_percentage.toFixed(1)}%
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">Occupied</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Tickets Sold</span>
                      <span className="font-bold text-slate-900">{analytics.total_tickets_sold} / {event.capacity}</span>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#668c65] to-[#5a7b59] transition-all duration-1000"
                        style={{ width: `${analytics.occupancy_percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{analytics.available_tickets} tickets remaining</span>
                      <span>{analytics.occupancy_count} occupied</span>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 space-y-6">
                <AlertCircle className="h-12 w-12 text-slate-300" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No Analytics Data Available</p>
              </div>
            )}
          </TabsContent>

          {/* Attendees Tab */}
          <TabsContent value="attendees" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="border-none shadow-none bg-slate-50/50 rounded-[2.5rem] p-10">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h4 className="text-3xl font-serif italic text-slate-900 leading-none">Guest List</h4>
                  <p className="text-[10px] font-black text-[#668c65] uppercase tracking-widest mt-3">The assembly of confirmed guests</p>
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
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No guests have registered for this event yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket: any) => (
                    <div key={ticket.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-50 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden gap-6 md:gap-0">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#668c65]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-[#668c65]/5 group-hover:bg-[#668c65] transition-colors duration-500 flex items-center justify-center relative overflow-hidden">
                          <span className="text-xl font-serif italic text-[#668c65] group-hover:text-white transition-colors duration-500 z-10">
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
                            {ticket.is_checked_in ? "Checked In" : "Pending Arrival"}
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

            <Button onClick={handleExportAttendees} className="w-full h-20 bg-slate-900 hover:bg-black hover:scale-[1.01] active:scale-[0.99] text-white rounded-[2.5rem] flex items-center justify-center gap-4 transition-all duration-500 shadow-2xl shadow-slate-900/20 group">
              <Download className="h-6 w-6 text-[#668c65] group-hover:-translate-y-1 transition-transform duration-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Download Guest List</span>
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
        className="w-[92vw] max-w-[1200px] sm:max-w-[1200px] p-0 border-none bg-white shadow-none rounded-[2.5rem] overflow-hidden max-h-[92vh]"
        showCloseButton={false}
      >
        {modalContent}
      </DialogContent>
    </Dialog>
  );
}
