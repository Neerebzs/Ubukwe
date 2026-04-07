"use client";

import { useSearchParams } from "next/navigation";
import { useEvent, useTicketTypes, useTickets } from "@/hooks/useEvents";
import { TicketManagement } from "./ticket-management";
import { Card, CardContent } from "@/components/ui/card";
import { Loader, AlertCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function TicketManagementWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get("eventId");

  const { data: event, isLoading: eventLoading, error: eventError } = useEvent(eventId || "");
  const { data: ticketTypes = [], isLoading: typesLoading } = useTicketTypes(eventId || "");
  const { data: tickets = [], isLoading: ticketsLoading } = useTickets(eventId || "");

  if (!eventId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border border-slate-100 bg-white rounded-[2.5rem] p-12 text-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
          <AlertCircle className="h-10 w-10 text-slate-300" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-serif italic text-slate-900">Catalogue Unselected</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Please select a manifestation to manage its souls</p>
        </div>
        <Button 
          onClick={() => router.push("/provider/dashboard?tab=events")}
          className="h-12 px-8 bg-[#668c65] hover:bg-[#5a7b59] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          Return to Registry
        </Button>
      </div>
    );
  }

  if (eventLoading || typesLoading || ticketsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border border-slate-100 bg-white rounded-[2.5rem] p-12 text-center">
        <Loader className="h-8 w-8 animate-spin text-[#668c65] mx-auto mb-6" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consulting the Registry...</p>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border border-slate-100 bg-white rounded-[2.5rem] p-12 text-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
          <AlertCircle className="h-10 w-10 text-rose-300" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-serif italic text-slate-900">Ritual Not Found</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">The manifest you seek is hidden or dissolved</p>
        </div>
        <Button 
          onClick={() => router.push("/provider/dashboard?tab=events")}
          className="h-12 px-8 bg-slate-900 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          Return to Registry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Event Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.3em]">
            Event Inventory Control
          </p>
          <h2 className="text-4xl md:text-5xl font-serif italic text-slate-900 tracking-tight leading-none">{event.title}</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex flex-wrap items-center gap-2 mt-4">
            <span className="text-[#668c65]">Manifested at</span> {event.location} <span className="text-slate-200">|</span> <span>{new Date(event.event_date).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.push("/provider/dashboard?tab=events")}
          className="h-12 px-6 border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all gap-2 self-start md:self-auto"
        >
          <ChevronLeft className="h-4 w-4" />
          Registry List
        </Button>
      </div>

      {/* Ticket Management */}
      <TicketManagement
        eventId={eventId}
        eventCapacity={event.capacity}
        ticketTypes={ticketTypes}
        tickets={tickets}
      />
    </div>
  );
}
