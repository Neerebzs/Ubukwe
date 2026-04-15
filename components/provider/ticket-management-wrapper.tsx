"use client";

import { useSearchParams } from "next/navigation";
import { 
  useEvent, 
  useTicketTypes, 
  useTickets, 
  useInspectors, 
  useCreateInspector, 
  useDeleteInspector,
  useEventAnalytics,
} from "@/hooks/useEvents";
import { TicketManagement } from "./ticket-management";
import { Card, CardContent } from "@/components/ui/card";
import { Loader, AlertCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function TicketManagementWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get("eventId");

  const { data: event, isLoading: eventLoading, error: eventError } = useEvent(eventId || "");
  const { data: ticketTypes = [], isLoading: typesLoading } = useTicketTypes(eventId || "");
  const { data: tickets = [], isLoading: ticketsLoading } = useTickets(eventId || "");
  const { data: inspectors = [], isLoading: inspectorsLoading } = useInspectors(eventId || "");
  const { data: analytics } = useEventAnalytics(eventId || "");

  const createInspectorMutation = useCreateInspector();
  const deleteInspectorMutation = useDeleteInspector();

  const handleAddInspector = async (data: { name: string; email: string; phone_number: string }) => {
    if (!eventId) return;
    try {
      await createInspectorMutation.mutateAsync({ eventId, data });
      toast.success("Inspector added successfully");
    } catch (error) {
      toast.error("Failed to add inspector");
    }
  };

  const handleDeleteInspector = async (inspectorId: string) => {
    if (!eventId || !confirm("Are you sure you want to remove this inspector?")) return;
    try {
      await deleteInspectorMutation.mutateAsync({ eventId, inspectorId });
      toast.success("Inspector removed successfully");
    } catch (error) {
      toast.error("Failed to remove inspector");
    }
  };

  if (!eventId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border border-slate-100 bg-white rounded-[2.5rem] p-12 text-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
          <AlertCircle className="h-10 w-10 text-slate-300" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-serif italic text-slate-900">No Event Selected</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Please select an event to manage its tickets</p>
        </div>
        <Button 
          onClick={() => router.push("/provider/dashboard?tab=events")}
          className="h-12 px-8 bg-[#668c65] hover:bg-[#5a7b59] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          Back to List
        </Button>
      </div>
    );
  }

  if (eventLoading || typesLoading || ticketsLoading || inspectorsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border border-slate-100 bg-white rounded-[2.5rem] p-12 text-center">
        <Loader className="h-8 w-8 animate-spin text-[#668c65] mx-auto mb-6" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading event details...</p>
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
          <h3 className="text-2xl font-serif italic text-slate-900">Event Not Found</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">The event you are looking for could not be found.</p>
        </div>
        <Button 
          onClick={() => router.push("/provider/dashboard?tab=events")}
          className="h-12 px-8 bg-slate-900 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          Back to List
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
            Ticket Management
          </p>
          <h2 className="text-4xl md:text-5xl font-serif italic text-slate-900 tracking-tight leading-none">{event.title}</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex flex-wrap items-center gap-2 mt-4">
            <span className="text-[#668c65]">Venue:</span> {event.location} <span className="text-slate-200">|</span> <span>{new Date(event.event_date).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.push("/provider/dashboard?tab=events")}
          className="h-12 px-6 border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all gap-2 self-start md:self-auto"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to List
        </Button>
      </div>

      {/* Ticket Management */}
      <TicketManagement
        eventId={eventId}
        eventCapacity={event.capacity}
        ticketTypes={ticketTypes}
        tickets={tickets}
        inspectors={inspectors}
        analytics={analytics}
        onInspectorAdded={handleAddInspector}
        onInspectorDeleted={handleDeleteInspector}
      />
    </div>
  );
}
