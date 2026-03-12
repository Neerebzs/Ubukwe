"use client";

import { useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Loader,
  Plus,
  X,
  Ticket,
} from "lucide-react";
import {
  useAvailableEvents,
  useEventDetails,
  useTicketTypes,
  useCheckAvailability,
  usePurchaseTickets,
} from "@/hooks/useTicketPurchase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TicketHolder {
  id: string;
  holder_name: string;
  holder_email: string;
  holder_phone: string;
}

interface FormErrors {
  [key: string]: string;
}

export function TicketPurchase() {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [ticketHolders, setTicketHolders] = useState<TicketHolder[]>([
    { id: "1", holder_name: "", holder_email: "", holder_phone: "" },
  ]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  // Queries
  const { data: events, isLoading: eventsLoading } = useAvailableEvents();
  const { data: eventDetails } = useEventDetails(selectedEventId);
  const { data: ticketTypes } = useTicketTypes(selectedEventId);
  const { data: availability } = useCheckAvailability(
    selectedEventId,
    selectedTicketTypeId,
    quantity
  );
  const purchaseMutation = usePurchaseTickets();

  const handleAddTicketHolder = () => {
    setTicketHolders([
      ...ticketHolders,
      {
        id: Date.now().toString(),
        holder_name: "",
        holder_email: "",
        holder_phone: "",
      },
    ]);
  };

  const handleRemoveTicketHolder = (id: string) => {
    if (ticketHolders.length > 1) {
      setTicketHolders(ticketHolders.filter((t) => t.id !== id));
    }
  };

  const handleTicketHolderChange = (
    id: string,
    field: string,
    value: string
  ) => {
    setTicketHolders(
      ticketHolders.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      )
    );
    if (errors[`${id}-${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${id}-${field}`];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!selectedEventId) newErrors.event = "Please select an event";
    if (!selectedTicketTypeId) newErrors.ticketType = "Please select a ticket type";
    if (quantity < 1) newErrors.quantity = "Quantity must be at least 1";

    ticketHolders.forEach((holder, index) => {
      if (!holder.holder_name.trim()) {
        newErrors[`${holder.id}-holder_name`] = "Name is required";
      }
      if (!holder.holder_email.trim()) {
        newErrors[`${holder.id}-holder_email`] = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(holder.holder_email)) {
        newErrors[`${holder.id}-holder_email`] = "Invalid email format";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePurchase = async () => {
    if (!validateForm()) return;

    try {
      const ticketsData = ticketHolders.map((holder) => ({
        holder_name: holder.holder_name,
        holder_email: holder.holder_email,
        holder_phone: holder.holder_phone || undefined,
      }));

      await purchaseMutation.mutateAsync({
        eventId: selectedEventId,
        ticketTypeId: selectedTicketTypeId,
        tickets: ticketsData,
      });

      // Reset form
      setSelectedEventId("");
      setSelectedTicketTypeId("");
      setQuantity(1);
      setTicketHolders([
        { id: "1", holder_name: "", holder_email: "", holder_phone: "" },
      ]);
      setPurchaseModalOpen(false);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Purchase failed",
      });
    }
  };

  const selectedTicketType = ticketTypes?.find(
    (t) => t.id === selectedTicketTypeId
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Buy Tickets</h1>
        <p className="text-slate-600 mt-1">Browse and purchase tickets for upcoming events</p>
      </div>

      {/* Available Events */}
      {eventsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : !events || events.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No events available at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card
              key={event.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedEventId(event.id)}
            >
              {event.image_url && (
                <div className="h-40 bg-slate-200 overflow-hidden rounded-t-lg">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <CardHeader>
                <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                <CardDescription>{event.location}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-600" />
                    <span className="text-slate-600">
                      {new Date(event.event_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-600" />
                    <span className="text-slate-600">
                      {event.available_tickets} tickets available
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => {
                    setSelectedEventId(event.id);
                    setPurchaseModalOpen(true);
                  }}
                >
                  Buy Tickets
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Purchase Modal */}
      <Dialog open={purchaseModalOpen} onOpenChange={setPurchaseModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
       