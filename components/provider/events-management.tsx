"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Plus, Search, TrendingUp, Users, DollarSign, Loader, MapPin, X, Ticket } from "lucide-react";
import { useEvents, useDeleteEvent, usePublishEvent } from "@/hooks/useEvents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/admin/stat-card";
import { Event } from "@/lib/api/events";
import { CreateEventModal } from "./create-event-modal";

export function EventsManagement() {
  const router = useRouter();
  const [view, setView] = useState<"list" | "create" | "details">("list");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: events = [], isLoading, error } = useEvents(statusFilter);
  const deleteEventMutation = useDeleteEvent();
  const publishEventMutation = usePublishEvent();

  // Filter events based on search query
  const filteredEvents = events.filter((event: Event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setView("details");
  };

  const handleManageTickets = (eventId: string) => {
    // Navigate to ticket management page with event ID using Next.js router
    router.push(`/provider/dashboard?tab=tickets&eventId=${eventId}`);
  };

  const handleCreateEvent = () => {
    setView("create");
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedEvent(null);
  };

  const handleDeleteEvent = async (eventId: string) => {
    // Prevent multiple clicks
    if (deleteEventMutation.isPending) {
      return;
    }
    
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEventMutation.mutateAsync(eventId);
      } catch (error) {
        console.error("Failed to delete event:", error);
      }
    }
  };

  const handlePublishEvent = async (eventId: string) => {
    // Prevent multiple clicks
    if (publishEventMutation.isPending) {
      return;
    }
    
    try {
      await publishEventMutation.mutateAsync(eventId);
    } catch (error) {
      console.error("Failed to publish event:", error);
    }
  };

  // Calculate statistics
  const stats = {
    totalEvents: events.length,
    publishedEvents: events.filter((e: Event) => e.status === "published").length,
    totalTicketsSold: events.reduce((sum: number, e: Event) => sum + e.tickets_sold, 0),
    totalRevenue: events.reduce((sum: number, e: Event) => sum + e.total_revenue, 0),
  };

  // CREATE VIEW
  if (view === "create") {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={handleBackToList}
          className="gap-2 text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Events List
        </Button>
        <CreateEventModal 
          standalone={true}
          open={true}
          onOpenChange={(open) => {
            if (!open) handleBackToList();
          }}
        />
      </div>
    );
  }

  // DETAILS VIEW
  if (view === "details" && selectedEvent) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={handleBackToList}
          className="gap-2 text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Events List
        </Button>
        <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl">{selectedEvent.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <MapPin className="h-4 w-4" />
                  {selectedEvent.location}
                </CardDescription>
              </div>
              <Badge className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold",
                selectedEvent.status === "published" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"
              )}>
                {selectedEvent.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
              <p className="text-slate-600">{selectedEvent.description || "No description provided"}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Date</p>
                <p className="font-semibold">{new Date(selectedEvent.event_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Capacity</p>
                <p className="font-semibold">{selectedEvent.capacity}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Sold</p>
                <p className="font-semibold">{selectedEvent.tickets_sold}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Revenue</p>
                <p className="font-semibold">{(selectedEvent.total_revenue / 1000).toFixed(0)}k RWF</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleBackToList}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-slate-100 pb-10">
        <div>
          <h1 className="text-6xl font-serif italic text-slate-900 tracking-tight leading-none mb-3">
            My Events
          </h1>
          <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.3em] mt-2">
            See what&apos;s happening with your events
          </p>
        </div>
        <Button
          onClick={handleCreateEvent}
          className="h-14 px-8 bg-slate-900 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10 gap-3"
        >
          <Plus className="h-4 w-4 text-[#668c65]" />
          Create New Event
        </Button>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="space-y-12 animate-pulse">
          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-[2rem] bg-white border border-slate-50" />
            ))}
          </div>

          {/* Search/Filter Skeleton */}
          <div className="flex gap-6 items-center">
            <div className="flex-1 h-14 rounded-2xl bg-white border border-slate-50" />
            <div className="w-56 h-14 rounded-2xl bg-white border border-slate-50" />
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-[2.5rem] bg-white border border-slate-50 overflow-hidden h-[500px] flex flex-col p-8 space-y-6">
                <div className="h-48 bg-slate-50 rounded-2xl" />
                <div className="space-y-3">
                  <div className="h-8 w-3/4 bg-slate-50 rounded-lg" />
                  <div className="h-4 w-1/2 bg-slate-50 rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 bg-slate-50 rounded-xl" />
                  <div className="h-10 bg-slate-50 rounded-xl" />
                </div>
                <div className="h-2 w-full bg-slate-50 rounded-full" />
                <div className="h-12 w-full bg-slate-50 rounded-2xl mt-auto" />
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">Failed to load events. Please try again.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Total Events", value: stats.totalEvents, icon: Calendar, sub: "All Events" },
              { label: "Live", value: stats.publishedEvents, icon: TrendingUp, sub: "Live Events" },
              { label: "Sold", value: stats.totalTicketsSold, icon: Users, sub: "Total Attendees" },
              { label: "Income", value: `${(stats.totalRevenue / 1000000).toFixed(1)}M RWF`, icon: DollarSign, sub: "Total Earnings" }
            ].map((stat, i) => (
              <StatCard
                key={i}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                subtitle={stat.sub}
                color="#668c65"
              />
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex gap-6 items-center">
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#668c65] transition-colors" />
              <Input
                placeholder="Search events by title or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-14 pr-6 rounded-2xl border-slate-100 bg-white shadow-sm focus:ring-0 focus:border-[#668c65]/30 transition-all text-[10px] font-black uppercase tracking-widest placeholder:text-slate-300"
              />
            </div>
            <Select value={statusFilter || "all"} onValueChange={(val) => setStatusFilter(val === "all" ? "" : val)}>
              <SelectTrigger className="w-56 h-14 rounded-2xl border-slate-100 bg-white shadow-sm text-[10px] font-black uppercase tracking-widest focus:ring-0 focus:border-[#668c65]/30">
              <SelectValue placeholder="Show Status" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2">
                {[
                  { value: "all", label: "All Events" },
                  { value: "draft", label: "Draft" },
                  { value: "published", label: "Live" },
                  { value: "ongoing", label: "Ongoing" },
                  { value: "completed", label: "Completed" },
                  { value: "cancelled", label: "Cancelled" }
                ].map((item) => (
                  <SelectItem key={item.value} value={item.value} className="rounded-xl text-[10px] font-black uppercase tracking-widest py-3 hover:bg-[#668c65]/5 focus:bg-[#668c65]/5">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <Card className="border-none shadow-none bg-slate-50/50 rounded-[2.5rem] p-20 text-center">
              <Calendar className="h-16 w-16 text-slate-200 mx-auto mb-6" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">No events found</p>
              <Button
                onClick={handleCreateEvent}
                variant="outline"
                className="h-12 border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-white hover:border-[#668c65]/30"
              >
                Create Your First Event
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event: Event) => (
                <Card key={event.id} className="border-none shadow-none bg-white rounded-[2.5rem] overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-700 border border-slate-50">
                  {/* Event Image */}
                  <div className="h-56 bg-slate-50 overflow-hidden relative">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200">
                        <Calendar className="h-12 w-12" />
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                      <Badge className={cn(
                        "border-none px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md",
                        event.status === "published" ? "bg-[#668c65]/90 text-white" : "bg-white/90 text-slate-600"
                      )}>
                        {event.status}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="p-8 pb-4">
                    <div className="space-y-1">
                      <CardTitle className="text-2xl font-serif italic text-slate-900 leading-tight group-hover:text-[#668c65] transition-colors line-clamp-2">
                        {event.title}
                      </CardTitle>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-[#668c65]" />
                        {event.location}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="p-8 pt-0 space-y-8">
                    {/* Event Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Date", value: new Date(event.event_date).toLocaleDateString(undefined, { dateStyle: 'medium' }) },
                        { label: "Space", value: event.capacity },
                        { label: "Sold", value: event.tickets_sold },
                        { label: "Income", value: `${(event.total_revenue / 1000).toFixed(0)}k`, color: "text-[#668c65]" }
                      ].map((detail, idx) => (
                        <div key={idx}>
                          <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">{detail.label}</p>
                          <p className={cn("text-xs font-serif italic font-bold text-slate-900", detail.color)}>{detail.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Capacity</span>
                        <span className="text-[10px] font-serif italic font-bold text-[#668c65]">
                          {Math.round((event.tickets_sold / event.capacity) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-50 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#668c65] h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(102,140,101,0.3)]"
                          style={{
                            width: `${Math.min((event.tickets_sold / event.capacity) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 h-11 rounded-2xl border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-500"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleViewDetails(event);
                          }}
                        >
                          See Details
                        </Button>

                        <Button
                          variant="outline"
                          className="flex-1 h-11 rounded-2xl border-[#668c65]/20 text-[9px] font-black uppercase tracking-widest text-[#668c65] hover:bg-[#668c65] hover:text-white hover:border-[#668c65] transition-all duration-500 gap-2"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleManageTickets(event.id);
                          }}
                        >
                          <Ticket className="h-4 w-4" />
                          Manage Tickets
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        {event.status === "draft" && (
                          <Button
                            className="flex-1 h-11 bg-[#668c65] hover:bg-[#5a7b59] text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#668c65]/20 border-none"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handlePublishEvent(event.id);
                            }}
                            disabled={publishEventMutation.isPending}
                          >
                            {publishEventMutation.isPending ? (
                              <Loader className="h-4 w-4 animate-spin text-white" />
                            ) : (
                              "Make Event Live"
                            )}
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteEvent(event.id);
                          }}
                          disabled={deleteEventMutation.isPending}
                          className={cn(
                            "h-11 w-11 rounded-2xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all",
                            event.status !== "draft" && "flex-1"
                          )}
                        >
                          {deleteEventMutation.isPending ? (
                            <Loader className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <div className="flex items-center gap-2">
                              <X className="h-3.5 w-3.5" />
                              {event.status !== "draft" && <span className="text-[8px] font-black uppercase tracking-widest">Delete</span>}
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
